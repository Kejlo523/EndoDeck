import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as solid from "@fortawesome/free-solid-svg-icons";
import * as brands from "@fortawesome/free-brands-svg-icons";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const vendorDir = join(root, "public", "vendor", "leaflet");

const wanted = [
  // Dźwięk i multimedia
  "volume-high", "volume-low", "volume-xmark", "volume-off",
  "headphones", "headset", "microphone", "microphone-slash", "microphone-lines", "ear-listen",
  "music", "radio", "podcast", "wave-square", "sliders",
  "play", "pause", "stop", "forward-step", "backward-step", "forward", "backward", "shuffle", "repeat",
  "circle-play", "circle-pause", "circle-stop", "eject", "record-vinyl", "compact-disc",
  "film", "clapperboard", "photo-film", "tv", "closed-captioning",
  // Aplikacje i usługi
  "discord", "spotify", "youtube", "twitch", "x-twitter", "telegram", "steam", "slack", "reddit",
  "github", "chrome", "firefox-browser", "edge", "windows", "android", "apple", "linux",
  "docker", "npm", "node-js",
  // PC, pliki, okna
  "terminal", "code", "laptop-code", "file-code", "code-branch", "code-commit", "code-merge", "code-compare",
  "folder", "folder-open", "file", "file-lines", "floppy-disk",
  "copy", "paste", "scissors", "crop-simple", "trash", "trash-can", "download", "upload", "link",
  "desktop", "laptop", "display", "keyboard", "computer-mouse", "gamepad", "mobile-screen", "tablet-screen-button",
  "window-maximize", "window-minimize", "window-restore", "maximize", "minimize", "expand", "compress",
  "up-right-and-down-left-from-center", "down-left-and-up-right-to-center", "arrow-up-right-from-square",
  "globe", "arrow-right-from-bracket", "arrow-right-to-bracket",
  // Sterowanie i nawigacja
  "arrow-left", "arrow-right", "arrow-up", "arrow-down",
  "rotate-left", "rotate-right", "arrows-rotate", "magnifying-glass",
  "plus", "minus", "check", "xmark", "bars", "list", "list-check", "table-cells-large",
  "toggle-on", "toggle-off",
  // Dom, Tapo, sieć
  "plug", "plug-circle-check", "plug-circle-xmark", "plug-circle-bolt", "plug-circle-plus",
  "power-off", "bolt", "bolt-lightning", "lightbulb", "fan",
  "house", "house-chimney", "house-signal", "door-open", "door-closed", "fire", "house-fire", "tree",
  "lock", "unlock", "lock-open", "key",
  "wifi", "bluetooth", "signal", "tower-broadcast", "network-wired", "ethernet", "satellite-dish",
  // Wideo, obraz, streaming
  "video", "video-slash", "camera", "camera-retro", "image", "images",
  // System, monitoring, narzędzia
  "gear", "gears", "wrench", "screwdriver-wrench", "palette", "wand-magic-sparkles", "rocket",
  "chart-line", "gauge-high", "gauge", "battery-full", "battery-half", "battery-empty",
  "spinner", "server", "database", "hard-drive", "memory", "microchip",
  "cloud", "cloud-arrow-up", "cloud-arrow-down",
  // Komunikacja
  "comment", "comments", "envelope", "phone", "paper-plane", "share", "at", "hashtag",
  // Pogoda i czas
  "sun", "moon", "cloud-sun", "cloud-rain", "cloud-bolt", "snowflake", "wind", "temperature-half", "umbrella",
  "clock", "calendar", "calendar-days", "stopwatch", "alarm-clock", "bell", "bell-slash",
  // Status i bezpieczeństwo
  "circle-info", "circle-question", "circle-exclamation", "triangle-exclamation", "ban",
  "circle-check", "circle-xmark", "circle-dot", "bug", "shield-halved", "eye", "eye-slash", "fingerprint",
  // Kafelki pomocnicze
  "star", "heart", "bookmark", "flag", "location-dot", "map", "compass",
  "user", "users", "user-group", "user-gear", "print", "note-sticky", "clipboard"
];

const aliases = {
  speaker: "volume-high",
  loudspeaker: "volume-high",
  sound: "volume-high",
  audio: "volume-high",
  glosnik: "volume-high",
  micOff: "microphone-slash",
  headset: "headphones",
  volumeDown: "volume-low",
  volumeUp: "volume-high",
  volumeMute: "volume-xmark",
  mute: "volume-xmark",
  unmute: "volume-high",
  mic: "microphone",
  next: "forward-step",
  previous: "backward-step",
  back: "arrow-left",
  undo: "rotate-left",
  redo: "rotate-right",
  automation: "wand-magic-sparkles",
  activity: "chart-line",
  inspect: "bug",
  crop: "crop-simple",
  equalizer: "wave-square",
  mixer: "sliders",
  twitter: "x-twitter",
  christmas: "tree",
  choinka: "plug",
  socket: "plug",
  outlet: "plug",
  tapo: "plug",
  cam: "camera",
  photo: "image",
  screenshot: "crop-simple",
  mail: "envelope",
  email: "envelope",
  settings: "gear",
  config: "gear",
  home: "house",
  pc: "desktop",
  monitor: "display",
  launch: "rocket",
  power: "power-off",
  lockScreen: "lock",
  unlockScreen: "unlock",
  weather: "cloud-sun",
  rain: "cloud-rain",
  storm: "cloud-bolt",
  snow: "snowflake",
  stream: "tower-broadcast",
  live: "tower-broadcast",
  record: "circle-dot",
  chat: "comments",
  message: "comment",
  call: "phone",
  discordMute: "microphone-slash",
  deafen: "volume-xmark",
  group: "user-group",
  profile: "user",
  admin: "user-gear",
  secure: "shield-halved",
  alert: "triangle-exclamation",
  info: "circle-info",
  help: "circle-question",
  ok: "circle-check",
  cancel: "circle-xmark",
  add: "plus",
  remove: "minus",
  save: "floppy-disk",
  open: "folder-open",
  git: "code-branch",
  node: "node-js",
  web: "globe",
  browser: "chrome",
  game: "gamepad",
  fullscreen: "maximize",
  fullscreenExit: "compress",
  refresh: "arrows-rotate",
  search: "magnifying-glass"
};

const available = new Map(
  [...Object.values(solid), ...Object.values(brands)]
    .filter((icon) => icon?.iconName && icon?.icon)
    .map((icon) => [icon.iconName, icon])
);

const icons = {};
for (const name of [...new Set(wanted)]) {
  const icon = available.get(name);
  if (!icon) continue;
  const [width, height, , , data] = icon.icon;
  icons[name] = { viewBox: `0 0 ${width} ${height}`, paths: Array.isArray(data) ? data : [data] };
}

await mkdir(vendorDir, { recursive: true });
await cp(join(root, "node_modules", "leaflet", "dist", "leaflet.css"), join(vendorDir, "leaflet.css"));
await cp(join(root, "node_modules", "leaflet", "dist", "leaflet.js"), join(vendorDir, "leaflet.js"));
await cp(join(root, "node_modules", "leaflet", "dist", "images"), join(vendorDir, "images"), { recursive: true });
await writeFile(
  join(root, "public", "icons.js"),
  `export const ICONS = ${JSON.stringify(icons)};\nexport const ICON_ALIASES = ${JSON.stringify(aliases)};\n`,
  "utf8"
);

const missing = [...new Set(wanted)].filter((name) => !available.has(name));
console.log(`Prepared ${Object.keys(icons).length} deck icons and Leaflet assets.`);
if (missing.length) console.log(`Skipped ${missing.length} unknown icon names: ${missing.join(", ")}`);
