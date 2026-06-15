import { createHash, verify } from "node:crypto";
import { readFile } from "node:fs/promises";

export function parseReleaseManifest(serialized) {
  const manifest = JSON.parse(serialized);
  if (manifest.schema !== "release-manifest-v1" || !manifest.version || !["beta", "stable"].includes(manifest.channel)) {
    throw new Error("Nieprawidlowy manifest wydania EndoDeck");
  }
  const names = new Set();
  for (const artifact of manifest.artifacts ?? []) {
    if (!artifact.file || !/^[a-f0-9]{64}$/.test(artifact.sha256) || !Number.isInteger(artifact.size) || artifact.size < 1) {
      throw new Error("Manifest zawiera nieprawidlowy artefakt");
    }
    if (names.has(artifact.file)) throw new Error("Manifest zawiera zduplikowany artefakt");
    names.add(artifact.file);
  }
  return manifest;
}

export function verifyReleaseManifest(serialized, signatureBase64, publicKey) {
  const signature = Buffer.from(String(signatureBase64).trim(), "base64");
  if (!signature.length || !verify(null, Buffer.from(serialized), publicKey, signature)) {
    throw new Error("Podpis manifestu wydania jest nieprawidlowy");
  }
  return parseReleaseManifest(serialized);
}

export function compareVersions(left, right) {
  const parse = (value) => {
    const match = String(value).replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.(\d+))?/i);
    if (!match) return [0, 0, 0, -1, 0];
    return [Number(match[1]), Number(match[2]), Number(match[3]), match[4] ? 0 : 1, Number(match[5] || 0)];
  };
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

export async function verifyArtifact(path, artifact) {
  const data = await readFile(path);
  if (data.length !== artifact.size || createHash("sha256").update(data).digest("hex") !== artifact.sha256) {
    throw new Error(`Suma kontrolna ${artifact.file} jest nieprawidlowa`);
  }
  return path;
}
