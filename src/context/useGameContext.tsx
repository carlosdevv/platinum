"use client";

import { syncSteamGames as syncSteamGamesAction } from "@/actions/sync-steam-games";
import { fetchSteamGames } from "@/services/game";
import { FetchSteamGamesResponse } from "@/services/game/types";
import { Game } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface GameContextType {
  gameSelected: number;
  setGameSelected: (index: number) => void;
  menuSelected: string;
  setMenuSelected: (menu: string) => void;
  dbGames: Game[];
  steamGames: FetchSteamGamesResponse[];
  isLoadingDbGames: boolean;
  isLoadingSteamGames: boolean;
  isSyncingSteam: boolean;
  syncProgress: number;
  syncMessage: string;
  allGames: (Game | FetchSteamGamesResponse)[];
  gamesByMenu: (Game | FetchSteamGamesResponse)[];
  hasGames: boolean;
  fetchDbGames: () => Promise<void>;
  syncSteamGames: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [gameSelected, setGameSelected] = useState(0);
  const [menuSelected, setMenuSelected] = useState("all");
  const [dbGames, setDbGames] = useState<Game[]>([]);
  const [steamGames, setSteamGames] = useState<FetchSteamGamesResponse[]>([]);
  const [isLoadingDbGames, setIsLoadingDbGames] = useState(false);
  const [isLoadingSteamGames, setIsLoadingSteamGames] = useState(false);
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");

  const fetchDbGames = async () => {
    if (!session?.user?.id) return;

    setIsLoadingDbGames(true);
    try {
      const response = await fetch("/api/games");
      if (!response.ok) {
        throw new Error("Error loading games from database");
      }
      const data = await response.json();
      setDbGames(data || []);
    } catch (error) {
      console.error("Error fetching db games:", error);
      toast.error("Error loading games from database");
      setDbGames([]);
    } finally {
      setIsLoadingDbGames(false);
    }
  };

  const syncSteamGames = async () => {
    if (!session?.user?.id) {
      toast.error("You need to be logged in to sync");
      return;
    }

    const steamUserId = "76561199012234177";

    setIsSyncingSteam(true);
    setSyncProgress(0);
    setSyncMessage("Starting sync...");

    try {
      setSyncProgress(10);
      setSyncMessage("Searching for Steam games...");

      // Fazer a requisição Steam primeiro para mostrar progresso real
      const steamGamesResult = await fetchSteamGames(steamUserId);
      
      setSyncProgress(40);
      setSyncMessage("Checking platinum games...");

      await new Promise(resolve => setTimeout(resolve, 500));

      setSyncProgress(60);
      setSyncMessage("Checking duplicates...");

      const result = await syncSteamGamesAction({
        userId: session.user.id,
        steamUserId,
      });

      setSyncProgress(80);
      setSyncMessage("Saving to database...");

      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX

      setSyncProgress(100);
      setSyncMessage("Sync completed!");

      if (result.success) {
        toast.success(result.message);
        
        await fetchDbGames();
        
        if (steamGamesResult && Array.isArray(steamGamesResult)) {
          setSteamGames(steamGamesResult);
        }
      }
    } catch (error) {
      console.error("Error syncing Steam games:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error syncing: ${errorMessage}`);
      setSyncProgress(0);
      setSyncMessage("");
    } finally {
      setIsSyncingSteam(false);
      setTimeout(() => {
        setSyncProgress(0);
        setSyncMessage("");
      }, 2000);
    }
  };

  useEffect(() => {
    fetchDbGames();
  }, [session?.user?.id]);

  const allGames = [...steamGames, ...dbGames];

  const gamesByMenu = (() => {
    switch (menuSelected) {
      case "all":
        return allGames;
      case "ps5":
        return dbGames.filter((game) => game.platform === "PS5");
      case "pc":
        return [...steamGames, ...dbGames.filter((game) => game.platform === "PC")];
      default:
        return allGames;
    }
  })();

  const hasGames = gamesByMenu.length > 0;

  useEffect(() => {
    if (gamesByMenu.length > 0 && gameSelected >= gamesByMenu.length) {
      setGameSelected(0);
    }
  }, [gamesByMenu.length, gameSelected]);

  return (
    <GameContext.Provider
      value={{
        gameSelected,
        setGameSelected,
        menuSelected,
        setMenuSelected,
        dbGames,
        steamGames,
        isLoadingDbGames,
        isLoadingSteamGames,
        isSyncingSteam,
        syncProgress,
        syncMessage,
        allGames,
        gamesByMenu,
        hasGames,
        fetchDbGames,
        syncSteamGames,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
