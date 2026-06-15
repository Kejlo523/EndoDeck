import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig } from "../src/config-store.js";

test("validates a minimal deck config", () => {
  assert.doesNotThrow(() => validateConfig({ pages: { home: { buttons: [{ id: "one", label: "One", action: { type: "media" } }] } } }));
});

test("rejects buttons without an action", () => {
  assert.throws(() => validateConfig({ pages: { home: { buttons: [{ id: "one", label: "One" }] } } }));
});
