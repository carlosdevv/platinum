"use server";

import { auth } from "@/lib/auth";
import { steamPosterUrl } from "@/lib/game-artwork";
import prisma from "@/lib/prismadb";
import { getSteamAchievementSummary, getSteamOwnedGames, getSteamRecentlyPlayedGames } from "@/lib/steam";
import type { Prisma } from "@/generated/prisma/client";

const BATCH_SIZE = 12;
const ACHIEVEMENT_REFRESH_MS = 24 * 60 * 60 * 1000;

async function currentConnection() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Faça login para sincronizar seus jogos.");

  const connection = await prisma.gameConnection.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: "steam" } },
  });
  if (!connection) throw new Error("Conecte sua conta Steam antes de sincronizar.");
  return connection;
}

export async function syncSteamGames() {
  const connection = await currentConnection();
  const ownedGames = await getSteamOwnedGames(connection.externalUserId);
  const userId = connection.userId;

  // The owned-games endpoint does not enumerate Family Sharing titles. Recent
  // games can expose their AppIDs, so merge them as a best-effort discovery
  // source. Steam does not document whether every shared title appears here.
  let recentGames: Awaited<ReturnType<typeof getSteamRecentlyPlayedGames>> = [];
  let recentLookupFailed = false;
  try {
    recentGames = await getSteamRecentlyPlayedGames(connection.externalUserId);
  } catch (error) {
    recentLookupFailed = true;
    console.warn("Could not fetch recently played Steam games", error);
  }

  const gamesByAppId = new Map(ownedGames.map((game) => [String(game.appid), game]));
  let recentOnly = 0;
  for (const game of recentGames) {
    const appId = String(game.appid);
    if (gamesByAppId.has(appId)) continue;
    gamesByAppId.set(appId, game);
    recentOnly++;
  }
  const gamesToSync = [...gamesByAppId.values()];

  // A user-triggered sync is also an explicit retry for games previously
  // inaccessible through Steam, for example after changing profile privacy.
  await prisma.game.updateMany({
    where: { userId, externalGameId: { not: null }, achievementStatus: "private" },
    data: { achievementStatus: "pending", achievementsSyncedAt: null },
  });

  const existing = await prisma.game.findMany({
    where: { userId },
    select: { id: true, name: true, platform: true, source: true, externalGameId: true, lastPlayed: true, playtimeMinutes: true, iconUrl: true },
  });
  const steamById = new Map(existing.filter((game) => game.externalGameId).map((game) => [game.externalGameId, game]));
  const manualPcGames = existing.filter((game) => game.source === "manual" && game.platform === "PC" && !game.externalGameId);
  const manualPcByName = new Map(manualPcGames.map((game) => [game.name.toLocaleLowerCase(), game]));
  const manualPcByAppId = new Map(manualPcGames.flatMap((game) => {
    const appId = game.iconUrl?.match(/\/steam\/apps\/(\d+)\//)?.[1];
    return appId ? [[appId, game] as const] : [];
  }));
  const toCreate: Array<{
    userId: string; name: string; source: string; externalGameId: string; platform: string;
    iconUrl: string; lastPlayed: Date | null; playtimeMinutes: number; hasPlatinum: boolean; status: string;
  }> = [];
  const updates: Promise<unknown>[] = [];

  for (const owned of gamesToSync) {
    const appId = String(owned.appid);
    const hasLastPlayed = typeof owned.rtime_last_played === "number";
    const lastPlayed = owned.rtime_last_played ? new Date(owned.rtime_last_played * 1000) : null;
    const lastPlayedUpdate = hasLastPlayed ? { lastPlayed } : {};
    const existingSteam = steamById.get(appId);
    if (existingSteam) {
      if (existingSteam.playtimeMinutes !== owned.playtime_forever ||
          (hasLastPlayed && existingSteam.lastPlayed?.getTime() !== lastPlayed?.getTime())) {
        updates.push(prisma.game.update({
          where: { id: existingSteam.id },
          data: { ...lastPlayedUpdate, playtimeMinutes: owned.playtime_forever },
        }));
      }
      continue;
    }

    const manual = manualPcByAppId.get(appId) ?? manualPcByName.get(owned.name.toLocaleLowerCase());
    if (manual) {
      manualPcByName.delete(manual.name.toLocaleLowerCase());
      const manualAppId = manual.iconUrl?.match(/\/steam\/apps\/(\d+)\//)?.[1];
      if (manualAppId) manualPcByAppId.delete(manualAppId);
      updates.push(prisma.game.update({
        where: { id: manual.id },
        data: {
          externalGameId: appId, ...lastPlayedUpdate,
          playtimeMinutes: owned.playtime_forever,
          iconUrl: manual.iconUrl || steamPosterUrl(appId),
          achievementStatus: "pending",
        },
      }));
      continue;
    }

    toCreate.push({
      userId, name: owned.name, source: "steam", externalGameId: appId,
      platform: "PC", iconUrl: steamPosterUrl(appId), lastPlayed,
      playtimeMinutes: owned.playtime_forever, hasPlatinum: false, status: "playing",
    });
  }

  if (toCreate.length) await prisma.game.createMany({ data: toCreate, skipDuplicates: true });
  for (let start = 0; start < updates.length; start += 20) {
    await Promise.all(updates.slice(start, start + 20));
  }

  await prisma.gameConnection.update({
    where: { id: connection.id },
    data: { lastSyncedAt: new Date(), syncError: null },
  });

  return {
    imported: toCreate.length,
    total: gamesToSync.length,
    owned: ownedGames.length,
    recentOnly,
    recentLookupFailed,
  };
}

export async function syncSteamAchievementBatch(visibleGameIds?: string[]) {
  const connection = await currentConnection();
  const cutoff = new Date(Date.now() - ACHIEVEMENT_REFRESH_MS);
  const pendingFilter = {
    userId: connection.userId,
    externalGameId: { not: null },
    ...(visibleGameIds?.length ? { id: { in: visibleGameIds.slice(0, BATCH_SIZE) } } : {}),
    OR: [
      { achievementStatus: "pending" },
      { achievementsSyncedAt: { lt: cutoff } },
    ],
  } satisfies Prisma.GameWhereInput;

  const games = await prisma.game.findMany({
    where: pendingFilter,
    orderBy: [{ lastPlayed: { sort: "desc", nulls: "last" } }, { id: "asc" }],
    take: BATCH_SIZE,
  });

  // Three workers keep a batch responsive without issuing dozens of requests at once.
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(3, games.length) }, async () => {
    while (next < games.length) {
      const game = games[next++];
      try {
        const result = await getSteamAchievementSummary(connection.externalUserId, game.externalGameId!);
        await prisma.game.update({
          where: { id: game.id },
          data: {
            achievementStatus: result.status,
            achievementsSyncedAt: new Date(),
            progress: result.progress,
            earnedAchievements: result.earned,
            totalAchievements: result.total,
            lastAchievementName: result.lastName,
            lastAchievementAt: result.lastAt,
            hasPlatinum: result.completed || game.hasPlatinum,
            status: result.completed ? "completed" : game.status,
          },
        });
      } catch (error) {
        const isForbidden = error instanceof Error && error.message === "Steam API returned 403";
        if (!isForbidden) console.error("Steam achievement sync failed", game.externalGameId, error);
        await prisma.game.update({
          where: { id: game.id },
          data: {
            achievementStatus: isForbidden ? "private" : "error",
            achievementsSyncedAt: new Date(),
          },
        });
      }
    }
  }));

  const remaining = await prisma.game.count({ where: pendingFilter });
  return { processed: games.length, remaining };
}
