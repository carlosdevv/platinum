import { auth } from "@/lib/auth";
import { appOrigin, createSteamState, STEAM_OPENID_ENDPOINT, STEAM_STATE_COOKIE } from "@/lib/steam-openid";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/login", appOrigin()));

  const state = createSteamState(session.user.id);
  const origin = appOrigin();
  const callback = new URL("/api/steam/callback", origin);
  callback.searchParams.set("state", state);
  const provider = new URL(STEAM_OPENID_ENDPOINT);
  provider.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
  provider.searchParams.set("openid.mode", "checkid_setup");
  provider.searchParams.set("openid.return_to", callback.toString());
  provider.searchParams.set("openid.realm", origin);
  provider.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
  provider.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");

  const response = NextResponse.redirect(provider);
  response.cookies.set(STEAM_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https:"),
    path: "/api/steam/callback",
    maxAge: 600,
  });
  return response;
}
