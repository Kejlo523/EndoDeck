import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { resourcePath } from "./runtime-paths.js";

let cache;

export async function loadDeviceProfiles() {
  if (cache) return cache;
  const directory = resourcePath("resources", "device-profiles");
  cache = await Promise.all((await readdir(directory)).filter((name) => name.endsWith(".json")).map(async (name) => JSON.parse(await readFile(join(directory, name), "utf8"))));
  return cache;
}

export async function matchDeviceProfile(device) {
  const profiles = await loadDeviceProfiles();
  const matches = profiles.filter((profile) => {
    const rule = profile.match;
    if (device.sdk < rule.sdkMin || device.sdk > rule.sdkMax) return false;
    if (rule.manufacturer && rule.manufacturer.toLowerCase() !== device.manufacturer.toLowerCase()) return false;
    if (rule.model && rule.model.toLowerCase() !== device.model.toLowerCase()) return false;
    return true;
  });
  const selected = matches.find((profile) => profile.id !== "generic") ?? matches.find((profile) => profile.id === "generic") ?? null;
  if (!selected) return null;
  const profile = structuredClone(selected);
  if (profile.apkVariant === "auto") {
    const has64BitAbi = (device.abis ?? []).some((abi) => /64/.test(abi));
    profile.apkVariant = device.sdk <= 25 || !has64BitAbi ? "legacy-arm32" : "universal";
  }
  return profile;
}
