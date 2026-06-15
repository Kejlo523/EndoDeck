import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";
import { compareVersions, verifyReleaseManifest } from "../src/release-integrity.js";

test("verifies a signed release manifest", () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const serialized = `${JSON.stringify({ schema: "release-manifest-v1", version: "1.2.0-beta.1", channel: "beta", artifacts: [] })}\n`;
  const signature = sign(null, Buffer.from(serialized), privateKey).toString("base64");
  assert.equal(verifyReleaseManifest(serialized, signature, publicKey).version, "1.2.0-beta.1");
  assert.throws(() => verifyReleaseManifest(`${serialized} `, signature, publicKey));
});

test("orders beta and stable semantic versions", () => {
  assert.equal(compareVersions("1.1.0-beta.2", "1.1.0-beta.1"), 1);
  assert.equal(compareVersions("1.1.0", "1.1.0-beta.9"), 1);
  assert.equal(compareVersions("1.0.9", "1.1.0-beta.1"), -1);
});
