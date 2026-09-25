import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
export const STEAM_STATE_COOKIE = "platinum_steam_state";

export function appOrigin() {
  const configured = process.env.NEXTAUTH_URL;
  if (!configured) throw new Error("NEXTAUTH_URL não configurada");
  return new URL(configured).origin;
}

function signature(nonce: string, userId: string) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET não configurado");
  return createHmac("sha256", secret).update(`${nonce}:${userId}`).digest("hex");
}

export function createSteamState(userId: string) {
  const nonce = randomBytes(24).toString("hex");
  return `${nonce}.${signature(nonce, userId)}`;
}

export function validateSteamState(state: string, userId: string) {
  const [nonce, supplied] = state.split(".");
  if (!/^[a-f0-9]{48}$/.test(nonce ?? "") || !/^[a-f0-9]{64}$/.test(supplied ?? "")) return false;
  return timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(signature(nonce, userId), "hex"));
}
