import { createHash, sign } from "node:crypto";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import process from "node:process";
import packageJson from "../package.json" with { type: "json" };

const root = new URL("..", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
const release = new URL("../release/", import.meta.url);
await mkdir(dist, { recursive: true });
await mkdir(release, { recursive: true });

async function exists(path) { try { await access(path); return true; } catch { return false; } }
const candidates = [];
for (const directory of [dist, release]) {
  for (const name of await readdir(directory).catch(() => [])) {
    if (/\.(?:apk|zip|exe|yml|blockmap|cdx\.json)$/i.test(name) && !/builder-debug|manifest|SHA256/i.test(name)) candidates.push(new URL(name, directory));
  }
}

const artifacts = [];
for (const url of candidates) {
  const data = await readFile(url);
  artifacts.push({ id: basename(url.pathname).replace(/\.[^.]+$/, ""), file: basename(url.pathname), sha256: createHash("sha256").update(data).digest("hex"), size: (await stat(url)).size });
}
artifacts.sort((a, b) => a.file.localeCompare(b.file));
const manifest = {
  schema: "release-manifest-v1",
  version: packageJson.version,
  channel: packageJson.version.includes("beta") ? "beta" : "stable",
  publishedAt: new Date().toISOString(),
  compatibility: { windows: { min: "10", arch: ["x64"] }, android: { sdkMin: 24, sdkMax: 30, magiskMin: "22.1", magiskTestedMax: "30.7" } },
  artifacts
};
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
await writeFile(new URL("release-manifest.json", dist), serialized);
await writeFile(new URL("SHA256SUMS", dist), `${artifacts.map((item) => `${item.sha256}  ${item.file}`).join("\n")}\n`);

let privateKey = process.env.ENDODECK_RELEASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const localKey = new URL("../.endodeck-release-private.pem", import.meta.url);
if (!privateKey && await exists(localKey)) privateKey = await readFile(localKey, "utf8");
if (privateKey) await writeFile(new URL("release-manifest.sig", dist), sign(null, Buffer.from(serialized), privateKey).toString("base64"));
else await writeFile(new URL("release-manifest.sig", dist), "UNSIGNED-DEVELOPMENT-BUILD\n");
console.log(new URL("release-manifest.json", dist).pathname);
