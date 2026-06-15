import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { nativeDir, scriptPath } from "./runtime-paths.js";

const execFileAsync = promisify(execFile);
const fallbackScript = scriptPath("audio-control.ps1");
let helper;

async function findHelper() {
  if (helper !== undefined) return helper;
  const candidates = [
    join(nativeDir, "EndoDeck.WindowsHelper.exe"),
    join(nativeDir, "EndoDeck.WindowsHelper", "bin", "Release", "net8.0-windows", "win-x64", "publish", "EndoDeck.WindowsHelper.exe")
  ];
  for (const candidate of candidates) {
    try { await access(candidate); helper = candidate; return helper; } catch {}
  }
  helper = null;
  return null;
}

async function runHelper(args) {
  const executable = await findHelper();
  if (executable) {
    const { stdout } = await execFileAsync(executable, args, { windowsHide: true, timeout: 10000, maxBuffer: 1024 * 1024 });
    return JSON.parse(String(stdout).replace(/^\uFEFF/, "").trim() || "{}");
  }
  const map = { list: "list", status: "status", devices: "devices", master: "master", session: "session", "microphone-toggle": "microphone-toggle", "process-toggle": "process-toggle", "set-default": "set-default" };
  const command = map[args[0]];
  const powershellArgs = ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", fallbackScript, "-Action", command];
  if (command === "master") powershellArgs.push("-Volume", args[1]);
  if (command === "session") powershellArgs.push("-SessionId", args[1], "-Volume", args[2]);
  if (command === "process-toggle") powershellArgs.push("-ProcessName", args[1]);
  if (command === "set-default") powershellArgs.push("-DeviceId", args[1]);
  const { stdout } = await execFileAsync("powershell.exe", powershellArgs, { windowsHide: true, timeout: 10000, maxBuffer: 1024 * 1024, encoding: "buffer" });
  return JSON.parse((Buffer.isBuffer(stdout) ? stdout.toString("utf8") : String(stdout)).replace(/^\uFEFF/, "").trim() || "{}");
}

export function getAudioSnapshot() { return runHelper(["list"]); }
export function getOutputDevices() { return runHelper(["devices"]); }
export function setDefaultOutputDevice(deviceId) { return runHelper(["set-default", String(deviceId)]); }
export function setMasterVolume(volume) { return runHelper(["master", String(volume)]); }
export function setSessionVolume(sessionId, volume) { return runHelper(["session", String(sessionId), String(volume)]); }
export function toggleMicrophoneMute() { return runHelper(["microphone-toggle"]); }
export function toggleProcessMute(processName) { return runHelper(["process-toggle", String(processName)]); }
