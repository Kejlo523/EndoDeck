import test from "node:test";
import assert from "node:assert/strict";
import { parseScreenOffReport } from "../src/adb.js";

test("parses successful screen-off reports", () => {
  assert.deepEqual(parseScreenOffReport('{"screen":"off","ok":true}'), {
    screen: "off",
    ok: true,
    reason: "display-off"
  });
  assert.equal(parseScreenOffReport("Display Power: state=OFF").ok, true);
});

test("classifies root and timeout diagnostics", () => {
  assert.equal(parseScreenOffReport("su: permission denied").reason, "root-permission");
  assert.equal(parseScreenOffReport("step timeout exit=124").reason, "timeout");
  assert.equal(parseScreenOffReport("Display Power: state=ON").reason, "display-on");
});
