"use server";

import prisma from "@/lib/prismadb";
import { fetchSteamGames } from "@/services/game";

interface SyncSteamGamesParams {
  userId: string;
  steamUserId: string;
}

export async function syncSteamGames(params: SyncSteamGamesParams) {
  const { userId, steamUserId } = params;

  if (!userId || !steamUserId) {
    throw new Error("UserId and steamUserId are required");
  }

  try {
    console.log("Starting Steam sync for user:", userId);
    
    // Buscar jogos da Steam
    console.log("Fetching Steam games...");
    const steamGamesResult = await fetchSteamGames(steamUserId);
    
    // Verificar se o resultado é válido
    if (!steamGamesResult || !Array.isArray(steamGamesResult)) {
      console.log("No Steam games found or invalid response:", steamGamesResult);
      return {
        success: true,
        syncedGames: 0,
        message: "No platinum games found on Steam",
      };
    }

    const steamGames = steamGamesResult;
    console.log(`Found ${steamGames.length} Steam games`);
    
    // Filtrar apenas jogos platinados (100% completed)
    const platinumSteamGames = steamGames.filter(game => game.isCompleted === true);
    console.log(`Found ${platinumSteamGames.length} platinum games`);

    if (platinumSteamGames.length === 0) {
      return {
        success: true,
        syncedGames: 0,
        message: "No platinum games found on Steam",
      };
    }

    // Buscar jogos existentes no banco de dados para evitar duplicatas
    console.log("Checking for existing games in database...");
    const existingGames = await prisma.game.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
      },
    });

    const existingGameNames = new Set(existingGames.map(game => game.name.toLowerCase()));
    console.log(`Found ${existingGames.length} existing games in database`);

    // Filtrar jogos que ainda não estão no banco
    const newPlatinumGames = platinumSteamGames.filter(
      game => !existingGameNames.has(game.name.toLowerCase())
    );

    console.log(`Found ${newPlatinumGames.length} new games to sync`);

    // Inserir novos jogos platinados no banco
    if (newPlatinumGames.length > 0) {
      console.log("Saving new games to database...");
      
      await prisma.game.createMany({
        data: newPlatinumGames.map(game => ({
          name: game.name,
          platform: "PC", // Jogos da Steam são PC
          lastPlayed: game.lastPlayed ? new Date(game.lastPlayed * 1000) : new Date(), // Convert Unix timestamp
          userId,
          iconUrl: game.iconUrl,
          hasPlatinum: true, // Todos os jogos sincronizados são platinados
        })),
      });
      console.log(`Successfully saved ${newPlatinumGames.length} games to database`);
    }

    return {
      success: true,
      syncedGames: newPlatinumGames.length,
      totalPlatinumGames: platinumSteamGames.length,
      message: `${newPlatinumGames.length} novos jogos platinados sincronizados`,
    };
  } catch (error) {
    console.error("Error syncing Steam games:", error);
    
    // Melhor tratamento de erro
    let errorMessage = "Erro ao sincronizar jogos da Steam";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
} 