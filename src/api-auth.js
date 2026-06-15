import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dataPath } from "./runtime-paths.js";

const tokenPath = dataPath("api-token");

export async function loadApiToken() {
  try {
    const value = (await readFile(tokenPath, "utf8")).trim();
    if (value.length >= 32) return value;
  } catch {}
  const value = randomBytes(32).toString("base64url");
  await writeFile(tokenPath, `${value}\n`, { encoding: "utf8", mode: 0o600 });
  return value;
}

export function tokenMatches(expected, candidate) {
  if (!expected || !candidate) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(candidate);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function requestToken(request, url) {
  const query = url.searchParams.get("token");
  const authorization = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const cookies = Object.fromEntries(String(request.headers.cookie ?? "").split(";").map((part) => part.trim().split(/=(.*)/s).slice(0, 2)).filter(([key]) => key));
  return query || authorization || cookies.endodeck_session || "";
}
