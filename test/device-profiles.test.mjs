import test from "node:test";
import assert from "node:assert/strict";
import { matchDeviceProfile } from "../src/device-profiles.js";

test("selects the Huawei legacy profile", async () => {
  const profile = await matchDeviceProfile({ manufacturer: "HUAWEI", model: "ALE-L21", sdk: 25 });
  assert.equal(profile.id, "huawei-ale-l21");
  assert.equal(profile.apkVariant, "legacy-arm32");
});

test("selects the universal generic profile for 64-bit Android 11", async () => {
  const profile = await matchDeviceProfile({ manufacturer: "Example", model: "Deck", sdk: 30, abis: ["arm64-v8a", "armeabi-v7a"] });
  assert.equal(profile.id, "generic");
  assert.equal(profile.apkVariant, "universal");
});

test("selects legacy ARM32 for an old 32-bit ROM", async () => {
  const profile = await matchDeviceProfile({ manufacturer: "Example", model: "Deck", sdk: 25, abis: ["armeabi-v7a"] });
  assert.equal(profile.apkVariant, "legacy-arm32");
});
