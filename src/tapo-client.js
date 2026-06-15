import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { request as httpRequest } from "node:http";

const digest = (algorithm, data) => createHash(algorithm).update(data).digest();
const concat = (...parts) => Buffer.concat(parts.map((part) => Buffer.isBuffer(part) ? part : Buffer.from(part)));

function sequenceBytes(sequence) {
  const value = Buffer.alloc(4);
  value.writeInt32BE(sequence);
  return value;
}

function post(ip, path, body, { query = "", cookie = "", captureCookie = false } = {}) {
  return new Promise((resolve, reject) => {
    const request = httpRequest({
      hostname: ip,
      port: 80,
      path: `/app/${path}${query ? `?${query}` : ""}`,
      method: "POST",
      timeout: 2600,
      headers: { "Content-Type": "application/octet-stream", "Content-Length": body.length, ...(cookie ? { Cookie: cookie } : {}) }
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const payload = Buffer.concat(chunks);
        if ((response.statusCode ?? 500) < 200 || (response.statusCode ?? 500) >= 300) return reject(new Error(`Tapo HTTP ${response.statusCode}`));
        const setCookie = captureCookie ? response.headers["set-cookie"]?.find((entry) => entry.startsWith("TP_SESSIONID="))?.split(";")[0] : null;
        resolve({ payload, cookie: setCookie ?? null });
      });
    });
    request.on("timeout", () => request.destroy(new Error("Tapo timed out")));
    request.on("error", reject);
    request.end(body);
  });
}

export class TapoClient {
  constructor(ip, username, password) {
    this.ip = ip;
    this.username = username;
    this.password = password;
    this.key = null;
    this.iv = null;
    this.signatureKey = null;
    this.sequence = 0;
    this.cookie = "";
  }

  async initialize() {
    const localSeed = randomBytes(16);
    const authHash = digest("sha256", concat(digest("sha1", this.username), digest("sha1", this.password)));
    const first = await post(this.ip, "handshake1", localSeed, { captureCookie: true });
    if (first.payload.length < 48 || !first.cookie) throw new Error("Tapo handshake failed");
    const remoteSeed = first.payload.subarray(0, 16);
    const serverHash = first.payload.subarray(16, 48);
    if (!digest("sha256", concat(localSeed, remoteSeed, authHash)).equals(serverHash)) throw new Error("Tapo auth failed");
    this.cookie = first.cookie;
    await post(this.ip, "handshake2", digest("sha256", concat(remoteSeed, localSeed, authHash)), { cookie: this.cookie });
    const localHash = concat(localSeed, remoteSeed, authHash);
    this.key = digest("sha256", concat("lsk", localHash)).subarray(0, 16);
    const ivSequence = digest("sha256", concat("iv", localHash));
    this.iv = ivSequence.subarray(0, 12);
    this.sequence = ivSequence.readInt32BE(ivSequence.length - 4);
    this.signatureKey = digest("sha256", concat("ldk", localHash)).subarray(0, 28);
  }

  encrypt(data) {
    const padding = 16 - (data.length % 16);
    const padded = Buffer.concat([data, Buffer.alloc(padding, padding)]);
    const sequence = sequenceBytes(this.sequence);
    const cipher = createCipheriv("aes-128-cbc", this.key, concat(this.iv, sequence));
    cipher.setAutoPadding(false);
    const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);
    return concat(digest("sha256", concat(this.signatureKey, sequence, encrypted)), encrypted);
  }

  decrypt(data) {
    const decipher = createDecipheriv("aes-128-cbc", this.key, concat(this.iv, sequenceBytes(this.sequence)));
    decipher.setAutoPadding(false);
    const decrypted = Buffer.concat([decipher.update(data.subarray(32)), decipher.final()]);
    return decrypted.subarray(0, decrypted.length - decrypted.at(-1));
  }

  async invoke(method, params) {
    if (!this.key) await this.initialize();
    this.sequence += 1;
    const body = this.encrypt(Buffer.from(JSON.stringify({ method, ...(params ? { params } : {}) }), "utf8"));
    try {
      const response = await post(this.ip, "request", body, { query: `seq=${this.sequence}`, cookie: this.cookie });
      const result = JSON.parse(this.decrypt(response.payload).toString("utf8"));
      if (result.error_code !== 0) throw new Error(`Tapo error ${result.error_code}`);
      return result.result ?? {};
    } catch (error) {
      this.key = null;
      throw error;
    }
  }

  async getState() {
    const info = await this.invoke("get_device_info");
    return Boolean(info.device_on ?? info.on);
  }

  async setState(active) {
    await this.invoke("set_device_info", { device_on: Boolean(active) });
    return Boolean(active);
  }

  async toggle() {
    return this.setState(!(await this.getState()));
  }
}
