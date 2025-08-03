import { getCachedData, setCachedData } from "@/lib/cache";
import { FetchSteamGamesResponse } from "@/services/game/types";
import { NextResponse, type NextRequest } from "next/server";

const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function GET(request: NextRequest) {
  const steamUserId = request.nextUrl.searchParams.get("steamUserId");

  if (!steamUserId) {
    return NextResponse.json(
      { error: "Steam user ID is required" },
      { status: 400 }
    );
  }

  const cacheKey = `steam-games-${steamUserId}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return NextResponse.json({ result: cachedData });
  }

  try {
    // Obter lista de jogos do usuário
    const gamesResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamUserId}&format=json&include_appinfo=true`
    );

    if (!gamesResponse.ok) {
      console.error(
        `Steam API error: ${gamesResponse.status} ${gamesResponse.statusText}`
      );
      throw new Error(
        `Failed to get steam games data: ${gamesResponse.status}`
      );
    }

    const gamesData = await gamesResponse.json();

    if (!gamesData.response || !gamesData.response.games) {
      console.log("No games found or invalid response format", gamesData);
      return NextResponse.json({ result: [] });
    }

    // Filtrar jogos com tempo de jogo
    const games =
      gamesData.response.games.filter(
        (game: any) => game.playtime_forever > 0
      ) || [];

    const gamesWithAchievements: FetchSteamGamesResponse[] = [];
    const processedGames: string[] = [];

    for (const game of games) {
      // Verificar se já processamos este jogo para evitar duplicatas
      if (processedGames.includes(game.appid.toString())) {
        continue;
      }

      processedGames.push(game.appid.toString());

      try {
        // Obter informações sobre todas as conquistas do jogo primeiro
        const gameSchemaResponse = await fetch(
          `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${game.appid}&key=${STEAM_API_KEY}`
        );

        if (!gameSchemaResponse.ok) {
          console.log(
            `No schema for game ${game.name} (${game.appid}): ${gameSchemaResponse.status}`
          );
          continue;
        }

        const gameSchemaData = await gameSchemaResponse.json();

        if (
          !gameSchemaData.game ||
          !gameSchemaData.game.availableGameStats ||
          !gameSchemaData.game.availableGameStats.achievements ||
          gameSchemaData.game.availableGameStats.achievements.length === 0
        ) {
          console.log(`Game ${game.name} has no achievements in schema`);
          continue;
        }

        const allAchievements =
          gameSchemaData.game.availableGameStats.achievements;

        // Se o jogo tem conquistas no schema, verificar as conquistas do jogador
        const playerStatsResponse = await fetch(
          `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${STEAM_API_KEY}&steamid=${steamUserId}`
        );

        // Se não conseguir obter as conquistas do jogador, pular este jogo
        if (!playerStatsResponse.ok) {
          console.log(
            `Failed to get player achievements for ${game.name}: ${playerStatsResponse.status}`
          );
          continue;
        }

        const playerStatsData = await playerStatsResponse.json();

        if (
          !playerStatsData.playerstats ||
          !playerStatsData.playerstats.achievements ||
          playerStatsData.playerstats.achievements.length === 0
        ) {
          console.log(`No player achievements for game ${game.name}`);
          continue;
        }

        const playerAchievements = playerStatsData.playerstats.achievements;
        const totalAchievements = allAchievements.length;
        const earnedAchievements = playerAchievements.filter(
          (a: { achieved: number }) => a.achieved === 1
        ).length;

        const progress = Math.round(
          (earnedAchievements / totalAchievements) * 100
        );
        const isCompleted =
          earnedAchievements === totalAchievements && totalAchievements > 0;

        // Só adicionar jogos que têm pelo menos uma conquista obtida
        if (earnedAchievements > 0) {
          console.log(
            `Adding game ${game.name}: ${earnedAchievements}/${totalAchievements} achievements (${progress}%) - isCompleted: ${isCompleted}`
          );

          gamesWithAchievements.push({
            iconUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
            name: game.name,
            platform: "Steam",
            progress,
            totalAchievements,
            earnedAchievements,
            isCompleted,
            lastPlayed: game.rtime_last_played || 0,
            appId: game.appid.toString(),
          });
        } else {
          console.log(`Skipping game ${game.name} with no earned achievements`);
        }
      } catch (error) {
        console.error(`Error processing game ${game.name}:`, error);
      }
    }

    // Filtrar apenas jogos completados (100% das conquistas)
    const completedGames = gamesWithAchievements.filter(
      (game) =>
        game.isCompleted && game.totalAchievements && game.totalAchievements > 0
    );

    // Armazenar no cache apenas se encontrou jogos
    if (completedGames.length > 0) {
      setCachedData(cacheKey, completedGames);
      console.log(`Cached ${completedGames.length} completed games`);
    } else {
      console.log("No completed games to cache");
    }

    return NextResponse.json({
      result: completedGames,
    });
  } catch (error) {
    console.error("Error getting Steam games data:", error);
    return NextResponse.json(
      { error: "Failed to get Steam games data" },
      { status: 500 }
    );
  }
}
