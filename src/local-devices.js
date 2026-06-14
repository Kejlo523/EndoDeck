import { spawn } from "node:child_process";
import { readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const settingsPath = fileURLToPath(new URL("../devices.local.json", import.meta.url));
const bridgePath = fileURLToPath(new URL("../scripts/local-device-bridge.py", import.meta.url));
const defaults = {
  tapo: { username: "", password: "" },
  devices: {
    "tapo-109": { name: "Tapo P100 - 109", provider: "tapo", model: "P100", ip: "192.168.11.109" },
    "tapo-116": { name: "Tapo P100 - 116", provider: "tapo", model: "P100", ip: "192.168.11.116" },
    "tapo-142": { name: "Tapo P100 - 142", provider: "tapo", model: "P100", ip: "192.168.11.142" },
    "tuya-147": { name: "Duzy pokoj", provider: "tuya", ip: "192.168.11.147", id: "bf36c2f58621c15751zux9", version: "3.4", dp: "1", localKey: "" },
    "tuya-148": { name: "Maly pokoj", provider: "tuya", ip: "192.168.11.148", id: "bf1357a27cebe638ecb6ed", version: "3.4", dp: "1", localKey: "" }
  }
};

let cachedSettings;
let settingsMtime = -1;
let stateCache = { at: 0, value: {} };
let tapoAuthBlock = null;

function isTapoAuthError(message) {
  return /Nieprawidlowy e-mail|Third-Party Compatibility|HASH_MISMATCH|LOGIN_ERROR|FORBIDDEN|Invalid credentials/i.test(String(message ?? ""));
}

function blockedTapoState() {
  return {
    active: false,
    available: false,
    provider: "tapo",
    source: "local-device",
    error: `${tapoAuthBlock} Automatyczne proby Tapo zostaly zatrzymane.`
  };
}

function blockTapo(settings, error, result) {
  tapoAuthBlock = String(error);
  for (const [alias, device] of Object.entries(settings.devices)) {
    if (device.provider === "tapo") result[alias] = blockedTapoState();
  }
}

function normalizeSettings(value = {}) {
  const devices = {};
  for (const [alias, base] of Object.entries(defaults.devices)) {
    const saved = value.devices?.[alias] ?? {};
    devices[alias] = { ...base, ...saved, provider: base.provider, ip: base.ip, id: base.id };
  }
  return {
    tapo: { username: String(value.tapo?.username ?? ""), password: String(value.tapo?.password ?? "") },
    devices
  };
}

async function loadSettings() {
  try {
    const mtime = (await stat(settingsPath)).mtimeMs;
    if (cachedSettings && mtime === settingsMtime) return cachedSettings;
    cachedSettings = normalizeSettings(JSON.parse(await readFile(settingsPath, "utf8")));
    settingsMtime = mtime;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    cachedSettings = normalizeSettings(defaults);
    await writeFile(settingsPath, `${JSON.stringify(cachedSettings, null, 2)}\n`, "utf8");
    settingsMtime = (await stat(settingsPath)).mtimeMs;
  }
  return cachedSettings;
}

function runBridge(payload, timeout = 12_000) {
  return new Promise((resolve, reject) => {
    const child = spawn("python", [bridgePath], { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill(), timeout);
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const result = JSON.parse(stdout || "{}");
        if (code !== 0 || result.error) reject(new Error(result.error || stderr.trim() || "Most urządzeń zakończył się błędem"));
        else resolve(result);
      } catch (error) {
        reject(new Error(stderr.trim() || error.message));
      }
    });
    child.stdin.end(JSON.stringify(payload));
  });
}

function isConfigured(device, settings) {
  return device.provider === "tapo"
    ? Boolean(settings.tapo.username && settings.tapo.password)
    : Boolean(device.localKey);
}

function publicDevice(alias, device, settings) {
  const { localKey, ...safe } = device;
  return { alias, ...safe, configured: isConfigured(device, settings) };
}

export async function getLocalDeviceSetup() {
  const settings = await loadSettings();
  return {
    tapo: { username: settings.tapo.username, hasPassword: Boolean(settings.tapo.password) },
    devices: Object.entries(settings.devices).map(([alias, device]) => publicDevice(alias, device, settings))
  };
}

export async function saveLocalDeviceSetup(input = {}) {
  const current = await loadSettings();
  const next = normalizeSettings(current);
  if (typeof input.tapo?.username === "string") next.tapo.username = input.tapo.username.trim();
  if (typeof input.tapo?.password === "string" && input.tapo.password) next.tapo.password = input.tapo.password;
  for (const [alias, update] of Object.entries(input.devices ?? {})) {
    if (!next.devices[alias] || !update || typeof update !== "object") continue;
    if (typeof update.name === "string" && update.name.trim()) next.devices[alias].name = update.name.trim().slice(0, 48);
    if (typeof update.localKey === "string" && update.localKey) next.devices[alias].localKey = update.localKey.trim();
  }
  await writeFile(settingsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  cachedSettings = next;
  settingsMtime = (await stat(settingsPath)).mtimeMs;
  stateCache = { at: 0, value: {} };
  tapoAuthBlock = null;
  return getLocalDeviceSetup();
}

export async function getLocalDeviceStates(aliases = [], { force = false } = {}) {
  const wanted = [...new Set(aliases.map(String))];
  if (force) tapoAuthBlock = null;
  if (!force && Date.now() - stateCache.at < 7000 && wanted.every((alias) => stateCache.value[alias])) {
    return Object.fromEntries(wanted.map((alias) => [alias, stateCache.value[alias]]));
  }
  const settings = await loadSettings();
  const result = {};
  const tapoDevices = [];
  const otherDevices = [];
  for (const alias of wanted) {
    const device = settings.devices[alias];
    if (!device) continue;
    if (isConfigured(device, settings)) {
      const entry = { alias, ...device };
      if (device.provider === "tapo") tapoDevices.push(entry);
      else otherDevices.push(entry);
    }
    else result[alias] = {
      active: false,
      available: false,
      provider: device.provider,
      source: "local-device",
      error: device.provider === "tapo" ? "Brak danych konta Tapo" : "Brak lokalnego klucza Tuya"
    };
  }
  if (otherDevices.length) Object.assign(result, await runBridge({ command: "status", settings, devices: otherDevices }));
  if (tapoDevices.length && tapoAuthBlock) {
    for (const device of tapoDevices) result[device.alias] = blockedTapoState();
  } else if (tapoDevices.length) {
    const [probe, ...remaining] = tapoDevices;
    const probeResult = await runBridge({ command: "status", settings, devices: [probe] });
    Object.assign(result, probeResult);
    const probeError = probeResult[probe.alias]?.error;
    if (isTapoAuthError(probeError)) blockTapo(settings, probeError, result);
    else if (remaining.length) Object.assign(result, await runBridge({ command: "status", settings, devices: remaining }));
  }
  stateCache = { at: Date.now(), value: { ...stateCache.value, ...result } };
  return Object.fromEntries(wanted.filter((alias) => result[alias]).map((alias) => [alias, result[alias]]));
}

export async function testLocalDevices() {
  const settings = await loadSettings();
  return getLocalDeviceStates(Object.keys(settings.devices), { force: true });
}

export async function toggleLocalDevice(alias) {
  const settings = await loadSettings();
  const device = settings.devices[String(alias)];
  if (!device) throw new Error("Nie znaleziono lokalnego urządzenia");
  if (device.provider === "tapo" && tapoAuthBlock) throw new Error(`${tapoAuthBlock} Automatyczne proby Tapo zostaly zatrzymane; zapisz dane konta albo uruchom test recznie.`);
  try {
    const result = await runBridge({ command: "toggle", settings, device: { alias: String(alias), ...device } }, 15_000);
    stateCache = { at: Date.now(), value: { ...stateCache.value, [alias]: result } };
    return result;
  } catch (error) {
    if (device.provider === "tapo" && isTapoAuthError(error.message)) {
      const blocked = {};
      blockTapo(settings, error.message, blocked);
      stateCache = { at: Date.now(), value: { ...stateCache.value, ...blocked } };
    }
    throw error;
  }
}
