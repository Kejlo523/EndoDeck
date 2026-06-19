import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, "public");
const androidAssets = join(root, "android", "assets");

await mkdir(androidAssets, { recursive: true });
await cp(join(publicDir, "screensaver-presets.js"), join(androidAssets, "screensaver-presets.js"));
await cp(join(publicDir, "screensaver-renderer.js"), join(androidAssets, "screensaver-renderer.js"));
await cp(join(publicDir, "screensaver.css"), join(androidAssets, "screensaver.css"));

const targetScreensaverAssets = join(androidAssets, "assets", "screensavers");
await rm(targetScreensaverAssets, { recursive: true, force: true });
await mkdir(targetScreensaverAssets, { recursive: true });
await cp(join(publicDir, "assets", "screensavers"), targetScreensaverAssets, { recursive: true });

console.log("Prepared Android offline screensaver assets.");
