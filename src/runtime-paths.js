import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const resourceRoot = resolve(process.env.ENDODECK_RESOURCE_ROOT || projectRoot);
export const dataDir = resolve(process.env.ENDODECK_DATA_DIR || join(process.env.APPDATA || projectRoot, "EndoDeck"));
export const publicDir = join(resourceRoot, "public");
export const artifactsDir = resolve(process.env.ENDODECK_ARTIFACTS_DIR || join(resourceRoot, "dist"));
export const platformToolsDir = resolve(process.env.ENDODECK_PLATFORM_TOOLS || join(resourceRoot, "vendor", "platform-tools"));
export const nativeDir = resolve(process.env.ENDODECK_NATIVE_DIR || join(resourceRoot, "native"));
export const scriptsDir = resolve(process.env.ENDODECK_SCRIPTS_DIR || join(resourceRoot, "scripts"));

export function dataPath(...parts) {
  return join(dataDir, ...parts);
}

export function resourcePath(...parts) {
  return join(resourceRoot, ...parts);
}

export function scriptPath(...parts) {
  return join(scriptsDir, ...parts);
}
