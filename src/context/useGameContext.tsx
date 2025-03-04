"use client";

import {
  type DatabaseGameResponse,
  type FetchPsnGamesResponse,
  type FetchSteamGamesResponse,
} from "@/services/game/types";
import {
  useFetchPsnGames,
  useFetchSteamGames,
} from "@/services/game/useGameService";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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
  isLoadingDbGames: boolean;
  psnGames: FetchPsnGamesResponse[];
  platinumGames: FetchPsnGamesResponse[];
  steamGames: FetchSteamGamesResponse[];
  dbGames: DatabaseGameResponse[];
  menuSelected: number;
  setMenuSelected: React.Dispatch<React.SetStateAction<number>>;
  handleShowListOption: () =>
    | FetchPsnGamesResponse[]
    | FetchSteamGamesResponse[]
    | DatabaseGameResponse[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameSelected, setGameSelected] = useState(0);
  const [menuSelected, setMenuSelected] = useState(1);
  const [dbGames, setDbGames] = useState<DatabaseGameResponse[]>([]);
  const [isLoadingDbGames, setIsLoadingDbGames] = useState(true);

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

  // Função para buscar jogos do banco de dados
  const fetchDbGames = async () => {
    setIsLoadingDbGames(true);
    try {
      const response = await fetch("/api/games");
      if (!response.ok) {
        throw new Error("Failed to fetch games from database");
      }
      const data = await response.json();
      setDbGames(data);
    } catch (error) {
      console.error("Error fetching games from database:", error);
    } finally {
      setIsLoadingDbGames(false);
    }
  };

  useEffect(() => {
    fetchDbGames();
  }, []);

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
    )
    .concat(
      dbGames.map((game) => ({
        lastPlayed: game.lastPlayed,
        iconUrl: game.iconUrl,
        name: game.name,
        platform: game.platform,
        hasPlatinum: game.hasPlatinum,
      }))
    );

  const ps5Games = psnGames.concat(
    dbGames.filter((game) => game.platform === "PS5")
  );

  const pcGames = steamGames.concat(
    dbGames.filter((game) => game.platform === "PC")
  );

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
      [Number(MenuOptions.PLATINUM)]: platinumGames,
      [Number(MenuOptions.PS5)]: ps5Games,
      [Number(MenuOptions.STEAM)]: pcGames,
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
        isLoadingDbGames,
        psnGames,
        platinumGames,
        menuSelected,
        setMenuSelected,
        handleShowListOption,
        isLoadingSteamGames,
        steamGames,
        dbGames,
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
