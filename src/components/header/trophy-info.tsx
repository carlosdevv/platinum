"use client";

import { Icons } from "@/components/icons";
import { useGameContext } from "@/context/useGameContext";

export function TrophyInfo() {
  const { isLoadingDbGames, steamGames, dbGames } = useGameContext();

  if (isLoadingDbGames) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="size-5 bg-gray-700 rounded-full"></div>
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-8 bg-gray-700 rounded"></div>
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-8 bg-gray-700 rounded"></div>
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Contar jogos platinados da Steam
  const steamPlatinumCount = steamGames.filter(game => game.isCompleted).length;
  
  // Contar jogos platinados do banco de dados
  const dbPlatinumCount = dbGames.filter(game => game.hasPlatinum).length;
  
  // Total de jogos platinados
  const platinumCount = steamPlatinumCount + dbPlatinumCount;
  
  // Contar por plataforma
  const ps5Count = dbGames.filter((game) => game.platform === "PS5" && game.hasPlatinum).length;
  const pcCount = steamPlatinumCount + dbGames.filter((game) => game.platform === "PC" && game.hasPlatinum).length;

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Icons.Trophy className="text-white size-5 ps5-text-glow" />
        <span className="text-white ps5-text-glow">{platinumCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white ps5-text-glow">PS5 {ps5Count}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white ps5-text-glow">PC {pcCount}</span>
      </div>
    </div>
  );
}
