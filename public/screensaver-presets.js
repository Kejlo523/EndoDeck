export const SCREENSAVER_SCHEMA_VERSION = 4;

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
  "lunar-tide": "Lunar Tide",
  "solar-atlas": "Solar Atlas",
  "analog-bureau": "Analog Bureau",
  "system-rings": "System Rings",
  "music-wave": "Music Wave",
  "dev-night": "Dev Night"
};

const DEFAULT_BRIGHTNESS = { night: 6, twilight: 9, day: 13, offlineNight: 5, offlineDay: 10 };
const DEFAULT_NIGHT = { enabled: true, start: "00:00", end: "07:00" };
const DEFAULT_MOTION = {
  mode: "adaptive",
  activeSeconds: 45,
  ecoAfterSeconds: 90,
  hideAnalogSecondInEco: true,
  freezeEqualizerInEco: true
};
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
      type: "image",
      value: "/assets/screensavers/classic-ambient.svg",
      overlay: "linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.28))"
    },
    theme: { accent, ink: "#f2f5ef", muted: "#777d73", surface: "#080a08" },
    elements: [
      element("pcStatus", "Status PC", 67, 3, 9, 4, { id: "classic-pc", zIndex: 20 }),
      element("power", "Prąd", 77, 3, 10, 4, { id: "classic-power", zIndex: 20 }),
      element("battery", "Bateria", 88, 3, 8, 4, { id: "classic-battery", zIndex: 20 }),
      element("clock", "Zegar", 8, 15, 32, 15, { id: "classic-clock", style: { size: 7.2, seconds: true, align: "left" } }),
      element("date", "Data", 9, 33, 34, 5, { id: "classic-date", style: { align: "left", letterSpacing: .14, size: 1.12 } }),
      element("weatherNow", "Pogoda", 53, 18, 39, 17, { id: "classic-weather" }),
      element("cpu", "CPU", 17, 48, 9, 14, { id: "classic-cpu" }),
      element("gpu", "GPU", 30, 48, 9, 14, { id: "classic-gpu" }),
      element("ram", "RAM", 43, 48, 9, 14, { id: "classic-ram" }),
      element("network", "Sieć", 57, 48, 17, 14, { id: "classic-network" }),
      element("forecast", "Prognoza", 9, 67, 82, 17, { id: "classic-forecast" }),
      element("nowPlaying", "Teraz gra", 10, 87, 56, 8, { id: "classic-now-playing" }),
      element("text", "Stopka", 60, 91, 30, 3, { id: "classic-footer", locked: true, style: { size: .92, align: "right", opacity: .42, letterSpacing: .16 }, data: { text: "DOTKNIJ, ABY WRÓCIĆ" } })
    ]
  });

  const lunarTide = baseProfile("lunar-tide", "Lunar Tide", "lunar-tide", "#b6c9ff", {
    background: { type: "image", value: "/assets/screensavers/lunar-night.svg", overlay: "linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.32))" },
    theme: { accent: "#b6c9ff", ink: "#edf3ff", muted: "#687389", surface: "#0a0e14" },
    brightness: { night: 5, twilight: 8, day: 11, offlineNight: 4, offlineDay: 8 },
    elements: [
      element("text", "Nagłówek", 8, 9, 40, 4, { id: "lunar-title", style: { font: "mono", size: 1.05, opacity: .6, letterSpacing: .2 }, data: { text: "NIGHT STATUS" } }),
      element("clock", "Zegar", 7, 17, 36, 14, { id: "lunar-clock", style: { size: 5.8, seconds: true, align: "left" } }),
      element("date", "Data", 8, 33, 36, 5, { id: "lunar-date", style: { align: "left", opacity: .66, letterSpacing: .13 } }),
      element("weatherNow", "Pogoda", 8, 46, 39, 15, { id: "lunar-weather" }),
      element("sunTimes", "Wschód i zachód", 8, 66, 56, 9, { id: "lunar-sun" }),
      element("cpu", "CPU", 57, 47, 9, 12, { id: "lunar-cpu" }),
      element("ram", "RAM", 69, 47, 9, 12, { id: "lunar-ram" }),
      element("network", "Sieć", 79, 47, 15, 12, { id: "lunar-network" }),
      element("nowPlaying", "Teraz gra", 8, 82, 44, 7, { id: "lunar-now" }),
      element("pcStatus", "PC", 65, 86, 12, 4, { id: "lunar-pc" }),
      element("power", "Prąd", 78, 86, 10, 4, { id: "lunar-power" }),
      element("battery", "Bateria", 89, 86, 8, 4, { id: "lunar-battery" })
    ]
  });

  const solarAtlas = baseProfile("solar-atlas", "Solar Atlas", "solar-atlas", "#ffbf66", {
    background: { type: "image", value: "/assets/screensavers/solar-dawn.svg", overlay: "linear-gradient(90deg, rgba(0,0,0,.06), rgba(0,0,0,.28))" },
    theme: { accent: "#ffbf66", ink: "#fff4e2", muted: "#9a8060", surface: "#171008" },
    brightness: { night: 6, twilight: 12, day: 18, offlineNight: 5, offlineDay: 12 },
    elements: [
      element("weatherNow", "Pogoda", 27, 13, 46, 18, { id: "solar-weather" }),
      element("clock", "Zegar", 73, 12, 21, 9, { id: "solar-clock", style: { size: 3.5, seconds: true, align: "right" } }),
      element("date", "Data", 58, 25, 36, 5, { id: "solar-date", style: { align: "right", opacity: .62 } }),
      element("forecast", "Prognoza", 9, 43, 82, 17, { id: "solar-forecast" }),
      element("sunTimes", "Słońce tydzień", 10, 67, 80, 8, { id: "solar-sun-times" }),
      element("cpu", "CPU", 10, 82, 8, 10, { id: "solar-cpu" }),
      element("gpu", "GPU", 21, 82, 8, 10, { id: "solar-gpu" }),
      element("ram", "RAM", 32, 82, 8, 10, { id: "solar-ram" }),
      element("nowPlaying", "Teraz gra", 53, 81, 31, 7, { id: "solar-now" }),
      element("pcStatus", "PC", 85, 82, 10, 4, { id: "solar-pc" })
    ]
  });

  const analogBureau = baseProfile("analog-bureau", "Analog Bureau", "analog-bureau", "#d8c59b", {
    background: { type: "image", value: "/assets/screensavers/analog-paper.svg", overlay: "linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.24))" },
    theme: { accent: "#d8c59b", ink: "#f4ead5", muted: "#7d715f", surface: "#15120d" },
    elements: [
      element("analogClock", "Analog", 8, 14, 30, 48, { id: "bureau-analog" }),
      element("clock", "Cyfrowy", 46, 9, 30, 10, { id: "bureau-clock", style: { size: 3.7, seconds: true, align: "left" } }),
      element("date", "Data", 47, 22, 32, 5, { id: "bureau-date", style: { align: "left", opacity: .65, letterSpacing: .08 } }),
      element("weatherNow", "Pogoda", 47, 31, 44, 15, { id: "bureau-weather" }),
      element("cpu", "CPU", 46, 55, 11, 14, { id: "bureau-cpu" }),
      element("gpu", "GPU", 59, 55, 11, 14, { id: "bureau-gpu" }),
      element("ram", "RAM", 72, 55, 11, 14, { id: "bureau-ram" }),
      element("network", "Sieć", 8, 68, 30, 14, { id: "bureau-network" }),
      element("forecast", "Prognoza", 45, 75, 48, 15, { id: "bureau-forecast" }),
      element("nowPlaying", "Teraz gra", 8, 87, 42, 7, { id: "bureau-now" }),
      element("pcStatus", "PC", 80, 5, 12, 4, { id: "bureau-pc" }),
      element("battery", "Bateria", 80, 10, 12, 4, { id: "bureau-battery" })
    ]
  });

  const systemRings = baseProfile("system-rings", "System Rings", "system-rings", "#7df2c2", {
    background: { type: "image", value: "/assets/screensavers/system-grid.svg", overlay: "linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.24))" },
    theme: { accent: "#7df2c2", ink: "#eafff7", muted: "#4f786a", surface: "#07120f" },
    elements: [
      element("text", "Header", 7, 7, 38, 4, { id: "rings-title", style: { font: "mono", size: 1.25, letterSpacing: .18, opacity: .72 }, data: { text: "LIVE MACHINE TELEMETRY" } }),
      element("clock", "Zegar", 62, 5, 31, 9, { id: "rings-clock", style: { font: "mono", size: 3.6, seconds: true, align: "right" } }),
      element("cpu", "CPU", 7, 21, 19, 31, { id: "rings-cpu", style: { ringSize: "large" } }),
      element("gpu", "GPU", 29, 21, 19, 31, { id: "rings-gpu", style: { ringSize: "large" } }),
      element("ram", "RAM", 51, 21, 19, 31, { id: "rings-ram", style: { ringSize: "large" } }),
      element("network", "Sieć", 72, 22, 21, 30, { id: "rings-network", style: { ringSize: "large" } }),
      element("weatherNow", "Pogoda", 8, 61, 38, 13, { id: "rings-weather" }),
      element("forecast", "Prognoza", 49, 61, 44, 15, { id: "rings-forecast" }),
      element("nowPlaying", "Teraz gra", 8, 83, 50, 7, { id: "rings-now" }),
      element("pcStatus", "PC", 64, 84, 12, 4, { id: "rings-pc" }),
      element("power", "Prąd", 77, 84, 10, 4, { id: "rings-power" }),
      element("battery", "Bateria", 88, 84, 8, 4, { id: "rings-battery" })
    ]
  });

  const musicWave = baseProfile("music-wave", "Music Wave", "music-wave", "#ff8ab3", {
    background: { type: "image", value: "/assets/screensavers/music-aurora.svg", overlay: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.28))" },
    theme: { accent: "#ff8ab3", ink: "#fff0f6", muted: "#8a6371", surface: "#12090e" },
    elements: [
      element("clock", "Zegar", 7, 8, 26, 9, { id: "wave-clock", style: { size: 3.4, seconds: true, align: "left" } }),
      element("date", "Data", 7, 20, 30, 4, { id: "wave-date", style: { align: "left", opacity: .55 } }),
      element("weatherNow", "Pogoda", 66, 7, 27, 12, { id: "wave-weather" }),
      element("nowPlaying", "Teraz gra", 18, 32, 64, 17, { id: "wave-now", style: { mode: "hero" } }),
      element("visualizer", "Visualizer", 20, 53, 60, 14, { id: "wave-visualizer" }),
      element("forecast", "Prognoza", 12, 76, 76, 13, { id: "wave-forecast" }),
      element("cpu", "CPU", 7, 86, 8, 10, { id: "wave-cpu" }),
      element("ram", "RAM", 86, 86, 8, 10, { id: "wave-ram" }),
      element("pcStatus", "PC", 43, 91, 12, 4, { id: "wave-pc" })
    ]
  });

  const devNight = baseProfile("dev-night", "Dev Night", "dev-night", "#8cff98", {
    background: { type: "image", value: "/assets/screensavers/dev-circuit.svg", overlay: "linear-gradient(180deg, rgba(0,0,0,.04), rgba(0,0,0,.18))" },
    theme: { accent: "#8cff98", ink: "#e6ffe8", muted: "#55705a", surface: "#061008" },
    elements: [
      element("text", "Prompt", 6, 7, 50, 4, { id: "dev-prompt", style: { font: "mono", size: 1.1, letterSpacing: .12, opacity: .8 }, data: { text: "endo@deck:~$ watch system" } }),
      element("clock", "Zegar", 6, 16, 34, 12, { id: "dev-clock", style: { font: "mono", size: 5.2, seconds: true, align: "left" } }),
      element("date", "Data", 7, 31, 36, 5, { id: "dev-date", style: { font: "mono", align: "left", opacity: .64 } }),
      element("weatherNow", "Pogoda", 56, 12, 36, 14, { id: "dev-weather" }),
      element("cpu", "CPU", 7, 45, 16, 21, { id: "dev-cpu" }),
      element("gpu", "GPU", 26, 45, 16, 21, { id: "dev-gpu" }),
      element("ram", "RAM", 45, 45, 16, 21, { id: "dev-ram" }),
      element("network", "Sieć", 64, 45, 28, 21, { id: "dev-network" }),
      element("forecast", "Prognoza", 7, 72, 54, 16, { id: "dev-forecast" }),
      element("nowPlaying", "Teraz gra", 64, 75, 28, 7, { id: "dev-now" }),
      element("pcStatus", "PC", 64, 86, 12, 4, { id: "dev-pc" }),
      element("power", "Prąd", 77, 86, 10, 4, { id: "dev-power" }),
      element("battery", "Bateria", 88, 86, 8, 4, { id: "dev-battery" })
    ]
  });

  return [classic, lunarTide, solarAtlas, analogBureau, systemRings, musicWave, devNight].map(clone);
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
  const motionInput = display.motion ?? ui.motion ?? {};
  const motionMode = ["full", "adaptive", "eco"].includes(motionInput.mode) ? motionInput.mode : DEFAULT_MOTION.mode;
  const nightStandby = {
    ...DEFAULT_NIGHT,
    ...(display.nightStandby ?? ui.nightStandby ?? {})
  };
  const showEqualizer = display.showEqualizer ?? ui.showEqualizer ?? true;
  return {
    dimAfterSeconds: numberOr(display.dimAfterSeconds ?? ui.dimAfterSeconds, 90, 1, 3600),
    screensaverAfterSeconds: numberOr(display.screensaverAfterSeconds ?? ui.screensaverAfterSeconds, 300, 1, 7200),
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
    },
    motion: {
      ...DEFAULT_MOTION,
      ...motionInput,
      mode: motionMode,
      activeSeconds: numberOr(motionInput.activeSeconds, DEFAULT_MOTION.activeSeconds, 5, 600),
      ecoAfterSeconds: numberOr(motionInput.ecoAfterSeconds, DEFAULT_MOTION.ecoAfterSeconds, 10, 3600),
      hideAnalogSecondInEco: motionInput.hideAnalogSecondInEco !== false,
      freezeEqualizerInEco: motionInput.freezeEqualizerInEco !== false
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
  next.ui.motion = { ...next.ui.display.motion };

  const defaults = createDefaultScreensavers(next.accent);
  const existing = Array.isArray(next.ui.screensavers) ? next.ui.screensavers : [];
  const byId = new Map(defaults.map((profile) => [profile.id, profile]));
  const defaultIds = new Set(defaults.map((profile) => profile.id));
  for (const profile of existing) {
    if (!profile?.id) continue;
    if (Number(profile.schemaVersion ?? 0) < SCREENSAVER_SCHEMA_VERSION) continue;
    byId.set(profile.id, normalizeScreensaver(profile, next.accent));
  }
  next.ui.screensavers = defaults.map((profile) => byId.get(profile.id) ?? profile);
  for (const profile of existing) {
    if (profile?.id && Number(profile.schemaVersion ?? 0) >= SCREENSAVER_SCHEMA_VERSION && !defaults.some((preset) => preset.id === profile.id)) {
      next.ui.screensavers.push(normalizeScreensaver(profile, next.accent));
    }
  }

  const active = String(next.ui.screensaverProfile || "classic-orbit");
  next.ui.screensaverProfile = next.ui.screensavers.some((profile) => profile.id === active) ? active : "classic-orbit";
  return next;
}
