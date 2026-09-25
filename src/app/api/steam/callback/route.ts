import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { appOrigin, STEAM_OPENID_ENDPOINT, STEAM_STATE_COOKIE, validateSteamState } from "@/lib/steam-openid";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = appOrigin();
  const redirect = (result: string) => {
    const response = NextResponse.redirect(new URL(`/?steam=${result}`, origin));
    response.cookies.delete({ name: STEAM_STATE_COOKIE, path: "/api/steam/callback" });
    return response;
  };

  const session = await auth();
  if (!session?.user?.id) return redirect("login-required");

  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(STEAM_STATE_COOKIE)?.value;
  if (!state || !cookieState || state !== cookieState || !validateSteamState(state, session.user.id)) {
    return redirect("invalid-state");
  }

  const params = request.nextUrl.searchParams;
  if (params.get("openid.mode") !== "id_res" ||
      params.get("openid.ns") !== "http://specs.openid.net/auth/2.0" ||
      params.get("openid.op_endpoint") !== STEAM_OPENID_ENDPOINT) {
    return redirect("invalid-response");
  }

  const expectedReturnTo = new URL("/api/steam/callback", origin);
  expectedReturnTo.searchParams.set("state", state);
  if (params.get("openid.return_to") !== expectedReturnTo.toString()) return redirect("invalid-return-to");

  const claimedId = params.get("openid.claimed_id");
  const steamId = claimedId?.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/)?.[1];
  if (!steamId || params.get("openid.identity") !== claimedId) return redirect("invalid-steam-id");

  const nonce = params.get("openid.response_nonce");
  const nonceDate = nonce && Date.parse(nonce.slice(0, 20));
  if (!nonceDate || Math.abs(Date.now() - nonceDate) > 10 * 60_000) return redirect("expired-response");

  let openIdVerified = false;
  try {
    const verification = new URLSearchParams();
    for (const [key, value] of params) {
      if (key.startsWith("openid.")) verification.set(key, value);
    }
    verification.set("openid.mode", "check_authentication");
    const result = await fetch(STEAM_OPENID_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: verification.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!result.ok || !/^is_valid\s*:\s*true\s*$/m.test(await result.text())) return redirect("verification-failed");
    openIdVerified = true;

    const connectionWhere = { userId_provider: { userId: session.user.id, provider: "steam" } } as const;
    const previous = await prisma.gameConnection.findUnique({ where: connectionWhere });

    // First-time connections and reconnects to the same Steam account only need
    // a single upsert. Keep an interactive transaction for account changes,
    // where connection replacement and old Steam game cleanup must be atomic.
    if (previous && previous.externalUserId !== steamId) {
      await prisma.$transaction(async (tx) => {
        await tx.game.deleteMany({ where: { userId: session.user.id, source: "steam" } });
        await tx.game.updateMany({
          where: { userId: session.user.id, source: "manual", externalGameId: { not: null } },
          data: {
            externalGameId: null,
            playtimeMinutes: null,
            progress: null,
            earnedAchievements: null,
            totalAchievements: null,
            lastAchievementName: null,
            lastAchievementAt: null,
            achievementsSyncedAt: null,
            achievementStatus: "pending",
          },
        });
        await tx.gameConnection.upsert({
          where: connectionWhere,
          create: { userId: session.user.id, provider: "steam", externalUserId: steamId },
          update: { externalUserId: steamId, lastSyncedAt: null, syncError: null },
        });
      }, { maxWait: 10_000, timeout: 15_000 });
    } else {
      await prisma.gameConnection.upsert({
        where: connectionWhere,
        create: { userId: session.user.id, provider: "steam", externalUserId: steamId },
        update: { externalUserId: steamId, lastSyncedAt: null, syncError: null },
      });
    }
    return redirect("connected");
  } catch (error) {
    console.error(openIdVerified ? "Steam connection could not be saved" : "Steam OpenID verification failed", error);
    return redirect(openIdVerified ? "connection-save-failed" : "verification-failed");
  }
}
