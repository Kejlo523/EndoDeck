export const SCREENSAVER_SCHEMA_VERSION = 2;

export const ELEMENT_TYPES = [
  ["clock", "Zegar"],
  ["analogClock", "Zegar analogowy"],
  ["date", "Data"],
  ["weatherNow", "Pogoda teraz"],
  ["forecast", "Prognoza tygodnia"],
  ["sunTimes", "Wschód / zachód"],
  ["pcStatus", "Status PC"],
  ["power", "Pobór prądu"],
  ["battery", "Bateria"],
  ["cpu", "CPU"],
  ["gpu", "GPU"],
  ["ram", "RAM"],
  ["network", "Sieć"],
  ["nowPlaying", "Teraz gra"],
  ["visualizer", "Visualizer"],
  ["image", "Obraz"],
  ["text", "Tekst"],
  ["shape", "Kształt"]
];

export const PRESET_LABELS = {
  "classic-orbit": "Classic Orbit",
  "minimal-oled": "Minimal OLED",
  "system-rings": "System Rings",
  "weather-atlas": "Weather Atlas",
  "music-pulse": "Music Pulse",
  "dev-console": "Dev Console",
  "ambient-home": "Ambient Home",
  "analog-station": "Analog Station",
  "flip-desk": "Flip Desk",
  "metro-lines": "Metro Lines",
  "lunar-desk": "Lunar Desk",
  "pilot-gauges": "Pilot Gauges",
  "paper-calendar": "Paper Calendar",
  "crt-monitor": "CRT Monitor",
  "home-minimap": "Home Minimap",
  "focus-mono": "Focus Mono"
};

const DEFAULT_BRIGHTNESS = { night: 6, twilight: 9, day: 13, offlineNight: 5, offlineDay: 10 };
const DEFAULT_NIGHT = { enabled: true, start: "00:00", end: "07:00" };
const DEFAULT_PROTECTION = {
  pixelShift: true,
  subtleRotation: true,
  compositionRotation: false,
  lowBrightnessOled: false,
  staticElementLimitMinutes: 12
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function element(type, label, x, y, w, h, options = {}) {
  return {
    id: options.id ?? `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    label,
    x,
    y,
    w,
    h,
    zIndex: options.zIndex ?? 10,
    visible: options.visible !== false,
    locked: options.locked === true,
    style: options.style ?? {},
    data: options.data ?? {}
  };
}

function baseProfile(id, label, preset, accent, overrides = {}) {
  return {
    schemaVersion: SCREENSAVER_SCHEMA_VERSION,
    id,
    label,
    preset,
    background: {
      type: "gradient",
      value: "radial-gradient(circle at 20% 20%, rgba(183,243,74,.13), transparent 34%), linear-gradient(145deg, #050705, #0b0d0a)"
    },
    theme: {
      accent,
      ink: "#f4f6ef",
      muted: "#7b8278",
      surface: "#0d100d"
    },
    elements: [],
    protection: { ...DEFAULT_PROTECTION },
    brightness: { ...DEFAULT_BRIGHTNESS },
    enabledWidgets: {
      nowPlaying: true,
      visualizer: true,
      topStatus: true,
      weather: true,
      telemetry: true
    },
    ...overrides
  };
}

export function createDefaultScreensavers(accent = "#b7f34a") {
  const classic = baseProfile("classic-orbit", "Classic Orbit", "classic-orbit", accent, {
    background: {
      type: "solid",
      value: "#050705"
    },
    theme: { accent, ink: "#f2f5ef", muted: "#777d73", surface: "#080a08" },
    elements: [
      element("shape", "Orbita górna", 73, -26, 42, 58, { id: "classic-orbit-a", zIndex: 1, locked: true, style: { shape: "circle", border: "1px solid rgba(255,255,255,.08)", opacity: .52 } }),
      element("shape", "Orbita dolna", 24, 78, 28, 38, { id: "classic-orbit-b", zIndex: 1, locked: true, style: { shape: "circle", border: "1px solid rgba(255,255,255,.055)", opacity: .42 } }),
      element("pcStatus", "Status PC", 67, 3, 9, 4, { id: "classic-pc", zIndex: 20 }),
      element("power", "Prąd", 77, 3, 10, 4, { id: "classic-power", zIndex: 20 }),
      element("battery", "Bateria", 88, 3, 8, 4, { id: "classic-battery", zIndex: 20 }),
      element("clock", "Zegar", 8, 17, 33, 20, { id: "classic-clock", style: { size: 12.8, seconds: true, align: "left" } }),
      element("date", "Data", 9, 39, 34, 6, { id: "classic-date", style: { align: "left", letterSpacing: .16, size: 1.25 } }),
      element("weatherNow", "Pogoda", 50, 22, 42, 18, { id: "classic-weather" }),
      element("cpu", "CPU", 24, 51, 9, 14, { id: "classic-cpu" }),
      element("gpu", "GPU", 35, 51, 9, 14, { id: "classic-gpu" }),
      element("ram", "RAM", 46, 51, 9, 14, { id: "classic-ram" }),
      element("network", "Sieć", 57, 51, 17, 14, { id: "classic-network" }),
      element("forecast", "Prognoza", 7, 69, 86, 17, { id: "classic-forecast" }),
      element("nowPlaying", "Teraz gra", 10, 88, 70, 8, { id: "classic-now-playing" }),
      element("text", "Stopka", 32, 96, 36, 3, { id: "classic-footer", locked: true, style: { size: 1.1, align: "center", opacity: .55, letterSpacing: .18 }, data: { text: "DOTKNIJ, ABY WRÓCIĆ DO ENDO DECK" } })
    ]
  });

  const minimal = baseProfile("minimal-oled", "Minimal OLED", "minimal-oled", accent, {
    background: { type: "solid", value: "#000000" },
    theme: { accent, ink: "#eef2ea", muted: "#525851", surface: "#050605" },
    enabledWidgets: { nowPlaying: false, visualizer: false, topStatus: true, weather: false, telemetry: false },
    protection: { ...DEFAULT_PROTECTION, lowBrightnessOled: true, staticElementLimitMinutes: 6 },
    brightness: { night: 3, twilight: 6, day: 9, offlineNight: 2, offlineDay: 6 },
    elements: [
      element("clock", "Zegar", 36, 35, 28, 16, { id: "minimal-clock", style: { size: 6.8, seconds: true, align: "center" } }),
      element("date", "Data", 32, 52, 36, 5, { id: "minimal-date", style: { align: "center", opacity: .58 } }),
      element("pcStatus", "PC", 30, 64, 12, 4, { id: "minimal-pc" }),
      element("battery", "Bateria", 45, 64, 12, 4, { id: "minimal-battery" }),
      element("power", "Prąd", 60, 64, 12, 4, { id: "minimal-power" })
    ]
  });

  const rings = baseProfile("system-rings", "System Rings", "system-rings", accent, {
    background: { type: "gradient", value: "linear-gradient(135deg, #040604 0%, #0a0d0a 55%, #11150f 100%)" },
    elements: [
      element("text", "Nagłówek", 8, 8, 48, 6, { id: "rings-title", style: { size: 2.2, weight: 700, letterSpacing: .12 }, data: { text: "SYSTEM RINGS" } }),
      element("pcStatus", "PC", 76, 8, 15, 5, { id: "rings-pc" }),
      element("cpu", "CPU", 10, 27, 18, 30, { id: "rings-cpu", style: { ringSize: "large" } }),
      element("gpu", "GPU", 31, 27, 18, 30, { id: "rings-gpu", style: { ringSize: "large" } }),
      element("ram", "RAM", 52, 27, 18, 30, { id: "rings-ram", style: { ringSize: "large" } }),
      element("network", "Sieć", 72, 29, 18, 27, { id: "rings-network", style: { ringSize: "large" } }),
      element("power", "Prąd", 18, 72, 18, 6, { id: "rings-power" }),
      element("battery", "Bateria", 40, 72, 18, 6, { id: "rings-battery" }),
      element("clock", "Zegar", 63, 69, 24, 10, { id: "rings-clock", style: { size: 4.2, seconds: true, align: "right" } })
    ]
  });

  const weather = baseProfile("weather-atlas", "Weather Atlas", "weather-atlas", accent, {
    background: { type: "gradient", value: "radial-gradient(circle at 22% 14%, rgba(105,178,255,.16), transparent 34%), radial-gradient(circle at 78% 92%, rgba(255,193,92,.11), transparent 32%), #06100f" },
    elements: [
      element("weatherNow", "Pogoda teraz", 7, 15, 60, 22, { id: "atlas-now", style: { mode: "hero" } }),
      element("clock", "Zegar", 71, 12, 20, 12, { id: "atlas-clock", style: { size: 4.4, seconds: true, align: "right" } }),
      element("date", "Data", 58, 25, 33, 5, { id: "atlas-date", style: { align: "right", opacity: .72 } }),
      element("sunTimes", "Słońce", 9, 43, 80, 9, { id: "atlas-sun" }),
      element("forecast", "Tydzień", 7, 60, 86, 27, { id: "atlas-forecast", style: { cards: "wide" } }),
      element("pcStatus", "PC", 9, 91, 14, 4, { id: "atlas-pc" })
    ]
  });

  const music = baseProfile("music-pulse", "Music Pulse", "music-pulse", accent, {
    background: { type: "gradient", value: "radial-gradient(circle at 50% 38%, rgba(183,243,74,.18), transparent 32%), linear-gradient(180deg, #050605, #0e1110)" },
    elements: [
      element("shape", "Aura", 23, 13, 54, 54, { id: "music-aura", zIndex: 1, locked: true, style: { shape: "circle", fill: "color-mix(in srgb,var(--saver-accent) 8%,transparent)", border: "1px solid color-mix(in srgb,var(--saver-accent) 22%,transparent)" } }),
      element("nowPlaying", "Teraz gra", 18, 32, 64, 16, { id: "music-now", style: { mode: "hero" } }),
      element("visualizer", "Visualizer", 24, 53, 52, 12, { id: "music-visualizer" }),
      element("clock", "Zegar", 34, 72, 32, 12, { id: "music-clock", style: { size: 4.6, seconds: true, align: "center" } }),
      element("pcStatus", "PC", 40, 88, 20, 5, { id: "music-pc" })
    ]
  });

  const dev = baseProfile("dev-console", "Dev Console", "dev-console", accent, {
    background: { type: "solid", value: "#050705" },
    theme: { accent: "#7dff9b", ink: "#eaffef", muted: "#6e806f", surface: "#081009" },
    elements: [
      element("text", "Prompt", 7, 9, 45, 5, { id: "dev-prompt", style: { font: "mono", size: 1.7, letterSpacing: .06 }, data: { text: "endodeck@runtime:~$ status" } }),
      element("pcStatus", "PC", 74, 9, 17, 5, { id: "dev-pc" }),
      element("clock", "Zegar", 7, 20, 32, 14, { id: "dev-clock", style: { font: "mono", size: 4.8, seconds: true, align: "left" } }),
      element("date", "Data", 7, 34, 40, 5, { id: "dev-date", style: { font: "mono", align: "left" } }),
      element("cpu", "CPU", 8, 50, 15, 20, { id: "dev-cpu" }),
      element("gpu", "GPU", 29, 50, 15, 20, { id: "dev-gpu" }),
      element("ram", "RAM", 50, 50, 15, 20, { id: "dev-ram" }),
      element("network", "Sieć", 70, 50, 18, 20, { id: "dev-network" }),
      element("text", "Runtime", 8, 78, 84, 10, { id: "dev-runtime", style: { font: "mono", size: 1.45, opacity: .72 }, data: { text: "ports: 8765/tcp · adb reverse active · studio sync ready" } })
    ]
  });

  const home = baseProfile("ambient-home", "Ambient Home", "ambient-home", accent, {
    background: { type: "gradient", value: "radial-gradient(circle at 15% 18%, rgba(255,193,92,.12), transparent 32%), radial-gradient(circle at 86% 84%, rgba(83,185,255,.11), transparent 34%), #070908" },
    elements: [
      element("clock", "Zegar", 8, 10, 34, 16, { id: "home-clock", style: { size: 5.5, seconds: true, align: "left" } }),
      element("date", "Data", 9, 27, 32, 5, { id: "home-date", style: { align: "left", opacity: .7 } }),
      element("weatherNow", "Pogoda", 49, 11, 42, 18, { id: "home-weather" }),
      element("pcStatus", "PC", 9, 42, 14, 5, { id: "home-pc" }),
      element("power", "Prąd", 27, 42, 15, 5, { id: "home-power" }),
      element("battery", "Bateria", 45, 42, 15, 5, { id: "home-battery" }),
      element("forecast", "Prognoza", 8, 58, 84, 22, { id: "home-forecast" }),
      element("text", "Dom", 10, 86, 78, 6, { id: "home-note", style: { size: 1.55, opacity: .74, align: "center" }, data: { text: "Smart home gotowy · lokalne przełączniki Tapo są dostępne na decku" } })
    ]
  });

  const analog = baseProfile("analog-station", "Analog Station", "analog-station", accent, {
    background: { type: "solid", value: "#070806" },
    theme: { accent: "#d7c7a5", ink: "#f3efe5", muted: "#8a8272", surface: "#11100d" },
    enabledWidgets: { nowPlaying: false, visualizer: false, topStatus: true, weather: true, telemetry: false },
    elements: [
      element("analogClock", "Analog", 34, 13, 32, 46, { id: "analog-clock", style: { ringSize: "large" } }),
      element("clock", "Cyfrowy", 37, 60, 26, 8, { id: "analog-digital", style: { size: 3.4, seconds: true, align: "center" } }),
      element("date", "Data", 30, 70, 40, 5, { id: "analog-date", style: { align: "center", opacity: .72 } }),
      element("weatherNow", "Pogoda", 8, 26, 24, 18, { id: "analog-weather" }),
      element("pcStatus", "PC", 74, 27, 14, 4, { id: "analog-pc" }),
      element("power", "Prąd", 72, 34, 16, 4, { id: "analog-power" }),
      element("battery", "Bateria", 72, 41, 16, 4, { id: "analog-battery" })
    ]
  });

  const flip = baseProfile("flip-desk", "Flip Desk", "flip-desk", accent, {
    background: { type: "solid", value: "#080807" },
    theme: { accent: "#f2f0e8", ink: "#f7f4ec", muted: "#716d64", surface: "#12110f" },
    enabledWidgets: { nowPlaying: true, visualizer: false, topStatus: true, weather: true, telemetry: false },
    elements: [
      element("clock", "Flip time", 14, 20, 50, 24, { id: "flip-clock", style: { size: 9.4, seconds: true, align: "left", mode: "flip" } }),
      element("date", "Data", 16, 47, 42, 5, { id: "flip-date", style: { align: "left", letterSpacing: .18 } }),
      element("weatherNow", "Pogoda", 62, 27, 28, 13, { id: "flip-weather" }),
      element("nowPlaying", "Teraz gra", 17, 68, 62, 8, { id: "flip-now" }),
      element("pcStatus", "PC", 17, 82, 14, 4, { id: "flip-pc" }),
      element("battery", "Bateria", 34, 82, 12, 4, { id: "flip-battery" })
    ]
  });

  const metro = baseProfile("metro-lines", "Metro Lines", "metro-lines", accent, {
    background: { type: "solid", value: "#060707" },
    theme: { accent: "#ffcf5a", ink: "#f4f1e7", muted: "#72746d", surface: "#0c0d0c" },
    elements: [
      element("shape", "Linia A", 7, 20, 78, 1.2, { id: "metro-line-a", locked: true, style: { fill: "#ffcf5a", radius: 99, opacity: .9 } }),
      element("shape", "Linia B", 17, 50, 70, 1.2, { id: "metro-line-b", locked: true, style: { fill: "#4fb9ff", radius: 99, opacity: .72 } }),
      element("clock", "Zegar", 8, 27, 24, 13, { id: "metro-clock", style: { size: 5.8, seconds: true, align: "left" } }),
      element("date", "Data", 8, 41, 28, 4, { id: "metro-date", style: { align: "left", opacity: .65 } }),
      element("cpu", "CPU", 42, 26, 12, 16, { id: "metro-cpu" }),
      element("ram", "RAM", 57, 26, 12, 16, { id: "metro-ram" }),
      element("network", "Sieć", 72, 26, 16, 16, { id: "metro-network" }),
      element("forecast", "Prognoza", 9, 64, 82, 19, { id: "metro-forecast" })
    ]
  });

  const lunar = baseProfile("lunar-desk", "Lunar Desk", "lunar-desk", accent, {
    background: { type: "gradient", value: "radial-gradient(circle at 72% 34%, rgba(215,226,255,.13), transparent 18%), linear-gradient(180deg,#05070a,#070909)" },
    theme: { accent: "#b6c9ff", ink: "#eef3ff", muted: "#6d7487", surface: "#0b0d12" },
    elements: [
      element("shape", "Księżyc", 67, 13, 16, 24, { id: "lunar-moon", locked: true, style: { shape: "moon", opacity: .96 } }),
      element("clock", "Zegar", 9, 18, 34, 15, { id: "lunar-clock", style: { size: 5.9, seconds: true, align: "left" } }),
      element("weatherNow", "Pogoda", 9, 39, 42, 17, { id: "lunar-weather" }),
      element("sunTimes", "Słońce", 9, 62, 82, 9, { id: "lunar-sun" }),
      element("pcStatus", "PC", 9, 82, 13, 4, { id: "lunar-pc" }),
      element("battery", "Bateria", 25, 82, 13, 4, { id: "lunar-battery" })
    ]
  });

  const pilot = baseProfile("pilot-gauges", "Pilot Gauges", "pilot-gauges", accent, {
    background: { type: "solid", value: "#050605" },
    theme: { accent: "#8ee6a7", ink: "#eff7ef", muted: "#667368", surface: "#0b100c" },
    elements: [
      element("text", "Header", 8, 8, 42, 5, { id: "pilot-title", style: { size: 1.7, weight: 700, letterSpacing: .22 }, data: { text: "SYSTEM TELEMETRY" } }),
      element("clock", "Zegar", 70, 8, 20, 8, { id: "pilot-clock", style: { size: 3.5, seconds: true, align: "right" } }),
      element("cpu", "CPU", 9, 27, 18, 29, { id: "pilot-cpu", style: { ringSize: "large" } }),
      element("gpu", "GPU", 31, 27, 18, 29, { id: "pilot-gpu", style: { ringSize: "large" } }),
      element("ram", "RAM", 53, 27, 18, 29, { id: "pilot-ram", style: { ringSize: "large" } }),
      element("network", "NET", 73, 29, 18, 27, { id: "pilot-net", style: { ringSize: "large" } }),
      element("power", "Prąd", 22, 72, 16, 5, { id: "pilot-power" }),
      element("battery", "Bateria", 43, 72, 16, 5, { id: "pilot-battery" }),
      element("pcStatus", "PC", 64, 72, 16, 5, { id: "pilot-pc" })
    ]
  });

  const paper = baseProfile("paper-calendar", "Paper Calendar", "paper-calendar", accent, {
    background: { type: "solid", value: "#11100c" },
    theme: { accent: "#f0d28a", ink: "#fbf5e6", muted: "#9a8e75", surface: "#17150f" },
    enabledWidgets: { nowPlaying: false, visualizer: false, topStatus: true, weather: true, telemetry: false },
    elements: [
      element("date", "Data", 8, 13, 52, 8, { id: "paper-date", style: { size: 2.2, align: "left", letterSpacing: .08 } }),
      element("clock", "Zegar", 8, 26, 30, 12, { id: "paper-clock", style: { size: 4.9, seconds: true, align: "left" } }),
      element("weatherNow", "Pogoda", 50, 21, 36, 17, { id: "paper-weather" }),
      element("forecast", "Prognoza", 8, 49, 84, 24, { id: "paper-forecast" }),
      element("sunTimes", "Słońce", 8, 80, 84, 8, { id: "paper-sun" })
    ]
  });

  const crt = baseProfile("crt-monitor", "CRT Monitor", "crt-monitor", accent, {
    background: { type: "solid", value: "#020403" },
    theme: { accent: "#66ff99", ink: "#d8ffe2", muted: "#4e7659", surface: "#061008" },
    elements: [
      element("text", "Terminal", 7, 8, 54, 5, { id: "crt-title", style: { font: "mono", size: 1.65, letterSpacing: .08 }, data: { text: "> ENDO RUNTIME MONITOR" } }),
      element("clock", "Zegar", 7, 20, 32, 13, { id: "crt-clock", style: { font: "mono", size: 4.9, seconds: true, align: "left" } }),
      element("pcStatus", "PC", 68, 20, 18, 5, { id: "crt-pc" }),
      element("cpu", "CPU", 8, 43, 14, 18, { id: "crt-cpu" }),
      element("gpu", "GPU", 27, 43, 14, 18, { id: "crt-gpu" }),
      element("ram", "RAM", 46, 43, 14, 18, { id: "crt-ram" }),
      element("network", "Sieć", 65, 43, 20, 18, { id: "crt-network" }),
      element("text", "Footer", 8, 78, 74, 6, { id: "crt-footer", style: { font: "mono", size: 1.25, opacity: .68 }, data: { text: "SCANLINES OFF · LOW GPU · LOCALHOST READY" } })
    ]
  });

  const homeMini = baseProfile("home-minimap", "Home Minimap", "home-minimap", accent, {
    background: { type: "solid", value: "#070706" },
    theme: { accent: "#85d8ff", ink: "#eef7fb", muted: "#6d7c82", surface: "#0d1112" },
    enabledWidgets: { nowPlaying: false, visualizer: false, topStatus: true, weather: true, telemetry: false },
    elements: [
      element("clock", "Zegar", 8, 10, 24, 10, { id: "minimap-clock", style: { size: 4.2, seconds: true, align: "left" } }),
      element("weatherNow", "Pogoda", 51, 9, 38, 16, { id: "minimap-weather" }),
      element("shape", "Salon", 13, 34, 25, 18, { id: "minimap-room-a", style: { radius: 16, fill: "rgba(133,216,255,.08)", border: "1px solid rgba(133,216,255,.22)" }, data: { text: "Duży pokój" } }),
      element("shape", "Pokój", 42, 34, 18, 18, { id: "minimap-room-b", style: { radius: 16, fill: "rgba(255,207,90,.07)", border: "1px solid rgba(255,207,90,.22)" } }),
      element("shape", "Kuchnia", 64, 34, 22, 18, { id: "minimap-room-c", style: { radius: 16, fill: "rgba(142,230,167,.07)", border: "1px solid rgba(142,230,167,.22)" } }),
      element("text", "Dom", 14, 58, 70, 6, { id: "minimap-label", style: { size: 1.5, align: "center", opacity: .78 }, data: { text: "DOM · lokalne przełączniki gotowe bez PC" } }),
      element("pcStatus", "PC", 24, 73, 14, 4, { id: "minimap-pc" }),
      element("battery", "Bateria", 43, 73, 14, 4, { id: "minimap-battery" }),
      element("power", "Prąd", 62, 73, 14, 4, { id: "minimap-power" })
    ]
  });

  const focus = baseProfile("focus-mono", "Focus Mono", "focus-mono", accent, {
    background: { type: "solid", value: "#000000" },
    theme: { accent: "#e8e8e0", ink: "#f2f2ec", muted: "#4a4a45", surface: "#050505" },
    enabledWidgets: { nowPlaying: false, visualizer: false, topStatus: true, weather: false, telemetry: false },
    protection: { ...DEFAULT_PROTECTION, lowBrightnessOled: true, staticElementLimitMinutes: 5 },
    brightness: { night: 2, twilight: 5, day: 8, offlineNight: 1, offlineDay: 5 },
    elements: [
      element("clock", "Zegar", 40, 35, 20, 10, { id: "focus-clock", style: { size: 4.4, seconds: true, align: "center" } }),
      element("date", "Data", 34, 49, 32, 4, { id: "focus-date", style: { align: "center", opacity: .42, size: .95 } }),
      element("pcStatus", "PC", 38, 62, 10, 4, { id: "focus-pc" }),
      element("battery", "Bateria", 52, 62, 10, 4, { id: "focus-battery" })
    ]
  });

  return [classic, minimal, rings, weather, music, dev, home, analog, flip, metro, lunar, pilot, paper, crt, homeMini, focus].map(clone);
}

export function cloneScreensaver(profile) {
  return clone(profile);
}

function numberOr(value, fallback, min = -Infinity, max = Infinity) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

export function normalizeBrightness(value = {}) {
  return {
    night: numberOr(value.night, DEFAULT_BRIGHTNESS.night, 1, 100),
    twilight: numberOr(value.twilight, DEFAULT_BRIGHTNESS.twilight, 1, 100),
    day: numberOr(value.day, DEFAULT_BRIGHTNESS.day, 1, 100),
    offlineNight: numberOr(value.offlineNight, DEFAULT_BRIGHTNESS.offlineNight, 1, 100),
    offlineDay: numberOr(value.offlineDay, DEFAULT_BRIGHTNESS.offlineDay, 1, 100)
  };
}

export function normalizeDisplayConfig(ui = {}) {
  const display = ui.display ?? {};
  const brightness = normalizeBrightness(display.screensaverBrightness ?? ui.screensaverBrightness);
  const nightStandby = {
    ...DEFAULT_NIGHT,
    ...(display.nightStandby ?? ui.nightStandby ?? {})
  };
  const showEqualizer = display.showEqualizer ?? ui.showEqualizer ?? true;
  return {
    dimAfterSeconds: numberOr(display.dimAfterSeconds ?? ui.dimAfterSeconds, 90, 10, 3600),
    screensaverAfterSeconds: numberOr(display.screensaverAfterSeconds ?? ui.screensaverAfterSeconds, 300, 30, 7200),
    showNowPlaying: display.showNowPlaying ?? ui.showNowPlaying ?? true,
    showEqualizer,
    visualizer: {
      enabled: display.visualizer?.enabled ?? showEqualizer,
      quality: display.visualizer?.quality ?? "balanced"
    },
    screensaverBrightness: brightness,
    nightStandby: {
      enabled: nightStandby.enabled !== false,
      start: nightStandby.start || DEFAULT_NIGHT.start,
      end: nightStandby.end || DEFAULT_NIGHT.end
    },
    protection: {
      ...DEFAULT_PROTECTION,
      ...(display.protection ?? {})
    }
  };
}

export function normalizeScreensaver(profile, accent = "#b7f34a") {
  const defaults = createDefaultScreensavers(accent);
  const fallback = defaults.find((preset) => preset.id === profile?.id) ?? defaults[0];
  const next = {
    ...clone(fallback),
    ...(profile ?? {})
  };
  next.schemaVersion = SCREENSAVER_SCHEMA_VERSION;
  next.id = String(next.id || fallback.id);
  next.label = String(next.label || PRESET_LABELS[next.preset] || fallback.label);
  next.preset = String(next.preset || next.id || fallback.preset);
  next.background = { ...(fallback.background ?? {}), ...(profile?.background ?? next.background ?? {}) };
  next.theme = { ...(fallback.theme ?? {}), accent, ...(profile?.theme ?? next.theme ?? {}) };
  next.protection = { ...DEFAULT_PROTECTION, ...(profile?.protection ?? next.protection ?? {}) };
  next.brightness = normalizeBrightness(profile?.brightness ?? next.brightness);
  next.enabledWidgets = { ...(fallback.enabledWidgets ?? {}), ...(profile?.enabledWidgets ?? next.enabledWidgets ?? {}) };
  next.elements = Array.isArray(profile?.elements) && profile.elements.length ? profile.elements.map((entry, index) => ({
    id: String(entry.id || `${entry.type || "element"}-${index + 1}`),
    type: String(entry.type || "text"),
    label: String(entry.label || entry.type || "Element"),
    x: numberOr(entry.x, 10, -50, 150),
    y: numberOr(entry.y, 10, -50, 150),
    w: numberOr(entry.w, 20, 1, 200),
    h: numberOr(entry.h, 10, 1, 200),
    zIndex: numberOr(entry.zIndex, index + 10, -100, 999),
    visible: entry.visible !== false,
    locked: entry.locked === true,
    style: entry.style && typeof entry.style === "object" ? entry.style : {},
    data: entry.data && typeof entry.data === "object" ? entry.data : {}
  })) : clone(fallback.elements);
  return next;
}

export function ensureScreensaverConfig(config) {
  const next = config ?? {};
  next.ui ??= {};
  next.ui.display = normalizeDisplayConfig(next.ui);
  next.ui.dimAfterSeconds = next.ui.display.dimAfterSeconds;
  next.ui.screensaverAfterSeconds = next.ui.display.screensaverAfterSeconds;
  next.ui.showNowPlaying = next.ui.display.showNowPlaying;
  next.ui.showEqualizer = next.ui.display.showEqualizer;
  next.ui.screensaverBrightness = normalizeBrightness(next.ui.display.screensaverBrightness);
  next.ui.nightStandby = { ...next.ui.display.nightStandby };

  const defaults = createDefaultScreensavers(next.accent);
  const existing = Array.isArray(next.ui.screensavers) ? next.ui.screensavers : [];
  const byId = new Map(defaults.map((profile) => [profile.id, profile]));
  const defaultIds = new Set(defaults.map((profile) => profile.id));
  for (const profile of existing) {
    if (!profile?.id) continue;
    const oldLunarMoon = profile.id === "lunar-desk" && profile.elements?.some((entry) => entry.id === "lunar-moon" && entry.style?.shape !== "moon");
    if (defaultIds.has(profile.id) && Number(profile.schemaVersion ?? 0) < SCREENSAVER_SCHEMA_VERSION) continue;
    if (oldLunarMoon) continue;
    byId.set(profile.id, normalizeScreensaver(profile, next.accent));
  }
  next.ui.screensavers = defaults.map((profile) => byId.get(profile.id) ?? profile);
  for (const profile of existing) {
    if (profile?.id && !defaults.some((preset) => preset.id === profile.id)) {
      next.ui.screensavers.push(normalizeScreensaver(profile, next.accent));
    }
  }

  const active = String(next.ui.screensaverProfile || "classic-orbit");
  next.ui.screensaverProfile = next.ui.screensavers.some((profile) => profile.id === active) ? active : "classic-orbit";
  return next;
}
