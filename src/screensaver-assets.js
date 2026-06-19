import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { dataPath } from "./runtime-paths.js";

const assetDir = dataPath("assets", "screensavers");
const allowedMime = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

const mimeByExt = new Map([...allowedMime.entries()].map(([mime, ext]) => [ext, mime]));
const maxAssetBytes = 8 * 1024 * 1024;

function safeLabel(value) {
  return String(value || "screensaver")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "screensaver";
}

function parseImageData(body) {
  const raw = String(body.data || "");
  const match = raw.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  const mime = String(body.mime || match?.[1] || "").toLowerCase();
  if (!allowedMime.has(mime)) throw new Error("Obsługiwane są tylko PNG, JPG, WEBP i GIF");
  const base64 = match?.[2] || raw;
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length || buffer.length > maxAssetBytes) throw new Error("Obraz jest pusty albo większy niż 8 MB");
  return { mime, buffer };
}

function assetPath(id) {
  const file = basename(String(id || ""));
  if (!/^[a-f0-9-]{36}-[a-z0-9-]+\.(png|jpg|webp|gif)$/i.test(file)) throw new Error("Nieprawidłowy identyfikator assetu");
  return join(assetDir, file);
}

function assetToPublic(file, info) {
  return {
    id: file,
    name: file.replace(/^[a-f0-9-]{36}-/, "").replace(/\.(png|jpg|webp|gif)$/i, ""),
    url: `/api/assets/screensavers/${encodeURIComponent(file)}`,
    size: info.size,
    type: mimeByExt.get(extname(file).toLowerCase()) ?? "application/octet-stream",
    createdAt: info.birthtime?.toISOString?.() ?? info.mtime.toISOString()
  };
}

export async function listScreensaverAssets() {
  await mkdir(assetDir, { recursive: true });
  const files = await readdir(assetDir).catch(() => []);
  const assets = [];
  for (const file of files) {
    try {
      const path = assetPath(file);
      const info = await stat(path);
      if (info.isFile()) assets.push(assetToPublic(file, info));
    } catch {}
  }
  assets.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return { assets };
}

export async function saveScreensaverAsset(body) {
  await mkdir(assetDir, { recursive: true });
  const { mime, buffer } = parseImageData(body);
  const id = `${randomUUID()}-${safeLabel(body.name)}${allowedMime.get(mime)}`;
  const path = assetPath(id);
  await writeFile(path, buffer);
  const info = await stat(path);
  return { ok: true, asset: assetToPublic(id, info) };
}

export async function deleteScreensaverAsset(id) {
  await rm(assetPath(id), { force: true });
  return { ok: true };
}

export async function readScreensaverAsset(id) {
  const path = assetPath(id);
  const data = await readFile(path);
  return {
    data,
    mime: mimeByExt.get(extname(path).toLowerCase()) ?? "application/octet-stream"
  };
}
