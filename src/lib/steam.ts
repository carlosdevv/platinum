import "server-only";

import { getCachedData, setCachedData } from "@/lib/cache";

const STEAM_API = "https://api.steampowered.com";

export type SteamOwnedGame = {
  appid: number;
  name: string;
  playtime_forever: number;
  rtime_last_played?: number;
};

export type SteamRecentlyPlayedGame = SteamOwnedGame & {
  playtime_2weeks?: number;
};

type SteamAchievement = {
  apiname: string;
  achieved: number;
  unlocktime?: number;
};

type SteamSchemaAchievement = {
  name: string;
  displayName?: string;
};

async function steamRequest<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.STEAM_API_KEY;
  if (!key) throw new Error("Steam API key is not configured");

  const url = new URL(path, STEAM_API);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);

  const response = await fetch(url, {
    headers: { "x-webapi-key": key },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Steam API returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getSteamOwnedGames(steamId: string) {
  const data = await steamRequest<{
    response?: { game_count?: number; games?: SteamOwnedGame[] };
  }>("/IPlayerService/GetOwnedGames/v0001/", {
    steamid: steamId,
    include_appinfo: "true",
    include_played_free_games: "true",
    format: "json",
  });

  if (!data.response || (data.response.game_count === undefined && !data.response.games)) {
    throw new Error("A lista de jogos da Steam não está visível. Confira a privacidade dos detalhes dos jogos.");
  }

  return (data.response.games ?? []).filter((game) => game.playtime_forever > 0);
}

export async function getSteamRecentlyPlayedGames(steamId: string) {
  const data = await steamRequest<{
    response?: { total_count?: number; games?: SteamRecentlyPlayedGame[] };
  }>("/IPlayerService/GetRecentlyPlayedGames/v0001/", {
    steamid: steamId,
    count: "0",
    format: "json",
  });

  if (!data.response || (data.response.total_count === undefined && !data.response.games)) {
    throw new Error("Steam did not return the recently played games list.");
  }

  return (data.response.games ?? []).filter((game) => game.appid && game.name);
}

export type SteamAchievementSummary = {
  status: "ready" | "unavailable" | "private";
  progress: number | null;
  earned: number | null;
  total: number | null;
  lastName: string | null;
  lastAt: Date | null;
  completed: boolean;
};

export async function getSteamAchievementSummary(steamId: string, appId: string): Promise<SteamAchievementSummary> {
  const schemaCacheKey = `steam-schema-${appId}`;
  let schema = getCachedData(schemaCacheKey) as SteamSchemaAchievement[] | undefined;
  if (!schema) {
    const data = await steamRequest<{
      game?: { availableGameStats?: { achievements?: SteamSchemaAchievement[] } };
    }>("/ISteamUserStats/GetSchemaForGame/v2/", { appid: appId, l: "brazilian" });
    schema = data.game?.availableGameStats?.achievements;
    if (schema) setCachedData(schemaCacheKey, schema);
  }

  if (!schema?.length) {
    return { status: "unavailable", progress: null, earned: null, total: null, lastName: null, lastAt: null, completed: false };
  }

  const data = await steamRequest<{
    playerstats?: { success?: boolean; achievements?: SteamAchievement[] };
  }>("/ISteamUserStats/GetPlayerAchievements/v0001/", {
    appid: appId,
    steamid: steamId,
    l: "brazilian",
  });

  if (!data.playerstats?.success || !data.playerstats.achievements) {
    return { status: "private", progress: null, earned: null, total: schema.length, lastName: null, lastAt: null, completed: false };
  }

  const achievements = data.playerstats.achievements;
  const earned = achievements.filter((achievement) => achievement.achieved === 1);
  const latest = earned.filter((achievement) => achievement.unlocktime).sort((a, b) => (b.unlocktime ?? 0) - (a.unlocktime ?? 0))[0];
  const schemaByName = new Map(schema.map((achievement) => [achievement.name, achievement.displayName]));
  const total = schema.length;

  return {
    status: "ready",
    progress: Math.round((earned.length / total) * 100),
    earned: earned.length,
    total,
    lastName: latest ? schemaByName.get(latest.apiname) ?? latest.apiname : null,
    lastAt: latest?.unlocktime ? new Date(latest.unlocktime * 1000) : null,
    completed: earned.length === total,
  };
}
