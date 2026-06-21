import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig } from "../src/config-store.js";
import { ensureScreensaverConfig } from "../public/screensaver-presets.js";

test("validates a minimal deck config", () => {
  assert.doesNotThrow(() => validateConfig({ pages: { home: { buttons: [{ id: "one", label: "One", action: { type: "media" } }] } } }));
});

test("rejects buttons without an action", () => {
  assert.throws(() => validateConfig({ pages: { home: { buttons: [{ id: "one", label: "One" }] } } }));
});

test("normalizes adaptive motion settings for screensavers", () => {
  const config = ensureScreensaverConfig({
    ui: {
      display: {
        motion: {
          mode: "turbo",
          activeSeconds: -10,
          ecoAfterSeconds: 3,
          hideAnalogSecondInEco: false
        }
      }
    }
  });
  assert.equal(config.ui.display.motion.mode, "adaptive");
  assert.equal(config.ui.display.motion.activeSeconds, 5);
  assert.equal(config.ui.display.motion.ecoAfterSeconds, 10);
  assert.equal(config.ui.display.motion.hideAnalogSecondInEco, false);
  assert.deepEqual(config.ui.motion, config.ui.display.motion);
});
