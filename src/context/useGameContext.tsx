"use client";

import {
  type FetchPsnGamesResponse,
  type FetchSteamGamesResponse,
} from "@/services/game/types";
import {
  useFetchPsnGames,
  useFetchSteamGames,
} from "@/services/game/useGameService";
import { ReactNode, createContext, useContext, useState } from "react";

enum MenuOptions {
  PLATINUM = 1,
  PS5 = 2,
  STEAM = 3,
}

interface GameContextType {
  gameSelected: number;
  setGameSelected: React.Dispatch<React.SetStateAction<number>>;
  handlePressL1: () => void;
  handlePressR1: () => void;
  isLoadingPsnGames: boolean;
  isLoadingSteamGames: boolean;
  psnGames: FetchPsnGamesResponse[];
  platinumGames: FetchPsnGamesResponse[];
  steamGames: FetchSteamGamesResponse[];
  menuSelected: number;
  setMenuSelected: React.Dispatch<React.SetStateAction<number>>;
  handleShowListOption: () =>
    | FetchPsnGamesResponse[]
    | FetchSteamGamesResponse[];
  shufflePlatinumGames: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameSelected, setGameSelected] = useState(0);
  const [menuSelected, setMenuSelected] = useState(1);
  const [shuffledPlatinumGames, setShuffledPlatinumGames] = useState<
    FetchPsnGamesResponse[]
  >([]);

  const { data: psnGames = [], isLoading: isLoadingPsnGames } =
    useFetchPsnGames({
      staleTime: 1000 * 60 * 60, // 1 hour
    });

  const { data: steamGames = [], isLoading: isLoadingSteamGames } =
    useFetchSteamGames(
      { steamUserId: "76561199012234177" },
      {
        staleTime: 1000 * 60 * 60, // 1 hour
      }
    );

  const platinumGames = psnGames
    .filter((game) => game.hasPlatinum)
    .concat(
      steamGames.map((game) => ({
        iconUrl: game.iconUrl,
        name: game.name,
        progress: game.progress,
        totalTrophies: game.totalAchievements,
        earnedTrophies: game.earnedAchievements,
        hasPlatinum: game.isCompleted,
        lastPlayed: game.lastPlayed,
        platform: game.platform,
      }))
    );

  const shufflePlatinumGames = () => {
    const shuffled = [...platinumGames];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledPlatinumGames(shuffled);
    setGameSelected(0);
  };

  const handlePressL1 = () => {
    const games = handleShowListOption();
    setGameSelected((prev) => (prev > 0 ? prev - 1 : games.length - 1));
  };

  const handlePressR1 = () => {
    const games = handleShowListOption();
    setGameSelected((prev) => (prev < games.length - 1 ? prev + 1 : 0));
  };

  const handleShowListOption = () => {
    const listOption = {
      [Number(MenuOptions.PLATINUM)]:
        shuffledPlatinumGames.length > 0
          ? shuffledPlatinumGames
          : platinumGames,
      [Number(MenuOptions.PS5)]: psnGames,
      [Number(MenuOptions.STEAM)]: steamGames,
    };

    return listOption[menuSelected];
  };

  return (
    <GameContext.Provider
      value={{
        gameSelected,
        setGameSelected,
        handlePressL1,
        handlePressR1,
        isLoadingPsnGames,
        psnGames,
        platinumGames,
        menuSelected,
        setMenuSelected,
        handleShowListOption,
        isLoadingSteamGames,
        steamGames,
        shufflePlatinumGames,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
