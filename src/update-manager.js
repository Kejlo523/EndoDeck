import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { compareVersions, verifyArtifact, verifyReleaseManifest } from "./release-integrity.js";
import { dataPath, resourcePath } from "./runtime-paths.js";

const MODULE_FILES = {
  "endodeck-core": "EndoDeck-Core-Magisk.zip",
  "endodeck-balanced": "EndoDeck-Balanced-Magisk.zip",
  "endodeck-oem-huawei-ale-l21": "EndoDeck-OEM-Huawei-ALE-L21-Magisk.zip"
};

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

export class ReleaseUpdateManager {
  constructor({ adb, currentVersion, channel = "beta", repository = "Kejlo523/endodeck" }) {
    this.adb = adb;
    this.currentVersion = currentVersion;
    this.channel = channel;
    this.repository = repository;
    this.pendingModules = [];
    this.lastCheck = null;
  }

  async github(path) {
    const response = await fetch(`https://api.github.com/repos/${this.repository}${path}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": `EndoDeck/${this.currentVersion}` }
    });
    if (!response.ok) throw new Error(`GitHub update API: HTTP ${response.status}`);
    return response.json();
  }

  async latestRelease() {
    const releases = await this.github("/releases?per_page=20");
    return releases.find((release) => !release.draft && (this.channel === "beta" ? true : !release.prerelease)) ?? null;
  }

  async signedManifest(release) {
    const assets = new Map(release.assets.map((asset) => [asset.name, asset]));
    const manifestAsset = assets.get("release-manifest.json");
    const signatureAsset = assets.get("release-manifest.sig");
    if (!manifestAsset || !signatureAsset) throw new Error("Wydanie nie zawiera podpisanego manifestu");
    const [serialized, signature, publicKey] = await Promise.all([
      fetch(manifestAsset.browser_download_url).then((response) => response.text()),
      fetch(signatureAsset.browser_download_url).then((response) => response.text()),
      readFile(resourcePath("resources", "release-public-key.pem"), "utf8")
    ]);
    const manifest = verifyReleaseManifest(serialized, signature, publicKey);
    if (manifest.channel !== this.channel && this.channel === "stable") throw new Error("Manifest pochodzi z innego kanalu aktualizacji");
    return { manifest, assets };
  }

  async downloadArtifact(version, artifact, asset) {
    if (!asset) throw new Error(`Brak pliku ${artifact.file} w wydaniu GitHub`);
    const directory = dataPath("cache", "releases", version);
    const target = join(directory, artifact.file);
    await mkdir(directory, { recursive: true });
    if (await exists(target)) {
      try { return await verifyArtifact(target, artifact); } catch {}
    }
    const response = await fetch(asset.browser_download_url);
    if (!response.ok) throw new Error(`Pobieranie ${artifact.file}: HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length !== artifact.size || createHash("sha256").update(data).digest("hex") !== artifact.sha256) {
      throw new Error(`Suma kontrolna ${artifact.file} jest nieprawidlowa`);
    }
    const temporary = `${target}.${process.pid}.tmp`;
    await writeFile(temporary, data);
    await rename(temporary, target);
    return target;
  }

  async checkPhone(serial, { automaticApk = true } = {}) {
    const release = await this.latestRelease();
    if (!release) return { available: false };
    const { manifest, assets } = await this.signedManifest(release);
    this.lastCheck = { release, manifest, assets };
    const desktopUpdateAvailable = compareVersions(manifest.version, this.currentVersion) > 0;
    if (!serial) return { available: desktopUpdateAvailable, version: manifest.version, phoneConnected: false };

    const diagnosis = await this.adb.diagnose(serial);
    if (!diagnosis.supported) throw new Error(diagnosis.errors.join("; "));
    const phoneUpdateAvailable = compareVersions(manifest.version, diagnosis.installedApk) > 0;
    if (!desktopUpdateAvailable && !phoneUpdateAvailable) return { available: false, version: manifest.version };
    let apkUpdated = false;
    if (automaticApk && phoneUpdateAvailable) {
      const apkName = diagnosis.profile.apkVariant === "legacy-arm32" ? "EndoDeck-legacy-arm32.apk" : "EndoDeck-universal.apk";
      const artifact = manifest.artifacts.find((item) => item.file === apkName);
      if (!artifact) throw new Error(`Manifest nie zawiera ${apkName}`);
      const path = await this.downloadArtifact(manifest.version, artifact, assets.get(apkName));
      await this.adb.installApkFile(serial, path);
      const health = await this.adb.diagnose(serial);
      if (compareVersions(health.installedApk, manifest.version) !== 0) throw new Error("Test zdrowia APK po aktualizacji nie powiodl sie");
      await this.adb.configureConnection(serial);
      apkUpdated = true;
    }

    this.pendingModules = [];
    for (const moduleId of diagnosis.profile.modules) {
      const file = MODULE_FILES[moduleId];
      const artifact = manifest.artifacts.find((item) => item.file === file);
      if (!artifact) continue;
      const path = await this.downloadArtifact(manifest.version, artifact, assets.get(file));
      this.pendingModules.push({ moduleId, file, path, version: manifest.version });
    }
    return { available: true, version: manifest.version, apkUpdated, modulesPending: this.pendingModules.length };
  }

  async installPendingModules(serial) {
    if (!serial || !this.pendingModules.length) return { installed: 0, rebootRequired: false };
    for (const module of this.pendingModules) await this.adb.installModuleFile(serial, module.path, module.file);
    const installed = this.pendingModules.length;
    this.pendingModules = [];
    return { installed, rebootRequired: true };
  }
}
