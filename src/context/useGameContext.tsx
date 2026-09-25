"use client";

import { syncSteamAchievementBatch, syncSteamGames as syncSteamGamesAction } from "@/actions/sync-steam-games";
import { LoaderCircle } from "lucide-react";
import type { Game } from "@/generated/prisma/client";
import { useSession } from "next-auth/react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fetchWithSession } from "@/lib/client-auth-fetch";

export type GameFilter = "platinados" | "todos" | "console" | "pc" | "outro";

type GameCounts = { platinum: number; console: number; pc: number; outro: number };
type GameTag = { id: string; name: string; color: string; _count?: { games: number } };
export type GameWithTags = Game & { tags?: Array<{ tag: Pick<GameTag, "id" | "name" | "color"> }> };
type SteamConnection = { externalUserId: string; lastSyncedAt: string | null } | null;

interface GameContextType {
  gameSelected: number;
  setGameSelected: (index: number) => void;
  menuSelected: GameFilter;
  setMenuSelected: (menu: GameFilter) => void;
  selectedTagId: string | null;
  setSelectedTagId: (tagId: string | null) => void;
  availableTags: GameTag[];
  gamesByMenu: GameWithTags[];
  isLoadingDbGames: boolean;
  isFetchingDbGames: boolean;
  gamesError: string | null;
  hasGames: boolean;
  page: number;
  pageSize: number;
  totalGames: number;
  counts: GameCounts;
  nextPage: () => void;
  previousPage: () => void;
  openGame: (id: string) => Promise<void>;
  steamConnection: SteamConnection;
  isLoadingConnection: boolean;
  steamOnboardingOpen: boolean;
  setSteamOnboardingOpen: (open: boolean) => void;
  fetchSteamConnection: () => Promise<void>;
  fetchDbGames: (options?: { showError?: boolean; force?: boolean }) => Promise<boolean>;
  isSyncingSteam: boolean;
  syncSteamGames: () => Promise<void>;
  openAddGameModal: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [, setAddGameModalOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));
  const [gameSelected, setGameSelected] = useState(0);
  const [menuSelected, setFilter] = useState<GameFilter>("platinados");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalGames, setTotalGames] = useState(0);
  const [counts, setCounts] = useState<GameCounts>({ platinum: 0, console: 0, pc: 0, outro: 0 });
  const [gamesByMenu, setGamesByMenu] = useState<GameWithTags[]>([]);
  const [isLoadingDbGames, setIsLoadingDbGames] = useState(true);
  const [isFetchingDbGames, setIsFetchingDbGames] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagIdState] = useState<string | null>(null);
  const [steamConnection, setSteamConnection] = useState<SteamConnection>(null);
  const [isLoadingConnection, setIsLoadingConnection] = useState(true);
  const [steamOnboardingOpen, setSteamOnboardingOpen] = useState(false);
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);
  const latestRequest = useRef(0);
  const achievementsInFlight = useRef(false);
  const steamSyncInFlight = useRef(false);
  const userId = session?.user?.id;
  const openAddGameModal = useCallback(() => {
    void setAddGameModalOpen(true);
  }, [setAddGameModalOpen]);

  const { data: availableTags = [], isFetched: tagsLoaded } = useQuery<GameTag[]>({
    queryKey: ["game-tags", session?.user?.id],
    enabled: Boolean(session?.user?.id),
    staleTime: 60_000,
    queryFn: async () => {
      const response = await fetchWithSession("/api/game-tags");
      if (!response.ok) throw new Error("Não foi possível consultar suas tags.");
      const data = await response.json() as { tags: GameTag[] };
      return data.tags;
    },
  });

  useEffect(() => {
    if (tagsLoaded && selectedTagId && !availableTags.some((tag) => tag.id === selectedTagId)) {
      setSelectedTagIdState(null);
    }
  }, [availableTags, selectedTagId, tagsLoaded]);

  const setSelectedTagId = useCallback((tagId: string | null) => {
    setSelectedTagIdState(tagId);
    setPage(0);
    setGameSelected(0);
  }, []);

  const setMenuSelected = useCallback((filter: GameFilter) => {
    setFilter(filter);
    setPage(0);
    setGameSelected(0);
  }, []);

  const nextPage = () => {
    if ((page + 1) * pageSize < totalGames) {
      setPage((current) => current + 1);
      setGameSelected(0);
    }
  };

  const previousPage = () => {
    if (page > 0) {
      setPage((current) => current - 1);
      setGameSelected(pageSize - 1);
    }
  };

  const openGame = async (id: string) => {
    const response = await fetchWithSession(`/api/games/locate?id=${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error("Jogo não encontrado na biblioteca.");
    const location: { page: number; index: number } = await response.json();
    setFilter("todos");
    setSelectedTagIdState(null);
    setPage(location.page);
    setGameSelected(location.index);
  };

  const fetchDbGames = useCallback(async ({ showError = true, force = false }: { showError?: boolean; force?: boolean } = {}) => {
    if (!userId) return false;
    const requestId = ++latestRequest.current;
    const queryKey = ["games", userId, menuSelected, page, selectedTagId] as const;
    const cached = queryClient.getQueryData<{ games: GameWithTags[]; total: number; pageSize: number; counts: GameCounts }>(queryKey);
    const updatedAt = queryClient.getQueryState(queryKey)?.dataUpdatedAt ?? 0;
    const hasUsableCache = Boolean(cached);
    if (cached) {
      setGamesByMenu(cached.games ?? []);
      setGameSelected((current) => Math.min(current, Math.max(0, (cached.games?.length ?? 0) - 1)));
      setTotalGames(cached.total ?? 0);
      setPageSize(cached.pageSize ?? 12);
      setCounts(cached.counts ?? { platinum: 0, console: 0, pc: 0, outro: 0 });
      setGamesError(null);
      setIsLoadingDbGames(false);
    } else {
      setIsLoadingDbGames(true);
    }
    setIsFetchingDbGames(force || !updatedAt || Date.now() - updatedAt >= 60_000);
    try {
      if (force) await queryClient.invalidateQueries({ queryKey: ["games", userId] });
      const data = await queryClient.fetchQuery({
        queryKey,
        staleTime: force ? 0 : 60_000,
        queryFn: async () => {
          const tagParam = selectedTagId ? `&tagId=${encodeURIComponent(selectedTagId)}` : "";
          const response = await fetchWithSession(`/api/games?filter=${menuSelected}&page=${page}${tagParam}`);
          if (!response.ok) {
            const failure = await response.json().catch(() => null) as { message?: string } | null;
            throw new Error(failure?.message ?? "Não foi possível consultar sua biblioteca.");
          }
          return response.json() as Promise<{ games: GameWithTags[]; total: number; pageSize: number; counts: GameCounts }>;
        },
      });
      if (requestId !== latestRequest.current) return true;
      setGamesByMenu(data.games ?? []);
      setGameSelected((current) => Math.min(current, Math.max(0, (data.games?.length ?? 0) - 1)));
      setTotalGames(data.total ?? 0);
      setPageSize(data.pageSize ?? 12);
      setCounts(data.counts ?? { platinum: 0, console: 0, pc: 0, outro: 0 });
      if (page > 0 && !data.games?.length && data.total > 0) setPage(page - 1);
      return true;
    } catch (error) {
      if (requestId !== latestRequest.current) return true;
      console.error("Error fetching games:", error);
      const message = error instanceof Error ? error.message : "Falha ao consultar sua biblioteca.";
      if (!hasUsableCache) {
        setGamesError(message);
        setGamesByMenu([]);
        setTotalGames(0);
        setGameSelected(0);
      }
      if (showError) toast.error(message, { id: "library-load-error" });
      return false;
    } finally {
      if (requestId === latestRequest.current) { setIsLoadingDbGames(false); setIsFetchingDbGames(false); }
    }
  }, [userId, menuSelected, page, selectedTagId, queryClient]);

  const fetchSteamConnection = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsLoadingConnection(true);
    try {
      const response = await fetchWithSession("/api/steam/connection");
      if (!response.ok) throw new Error("Could not load Steam connection");
      const data = await response.json();
      setSteamConnection(data.connection ?? null);
    } catch (error) {
      console.error("Error fetching Steam connection:", error);
      setSteamConnection(null);
    } finally {
      setIsLoadingConnection(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void fetchDbGames(); });
    return () => { active = false; };
  }, [fetchDbGames]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void fetchSteamConnection(); });
    return () => { active = false; };
  }, [fetchSteamConnection]);

  useEffect(() => {
    if (!steamConnection || isSyncingSteam || achievementsInFlight.current) return;
    const pendingIds = gamesByMenu
      .filter((game) => game.externalGameId && game.achievementStatus === "pending")
      .map((game) => game.id);
    if (!pendingIds.length) return;
    achievementsInFlight.current = true;
    void syncSteamAchievementBatch(pendingIds)
      .then(() => fetchDbGames({ force: true }))
      .catch((error) => console.error("Could not load visible achievements", error))
      .finally(() => { achievementsInFlight.current = false; });
  }, [gamesByMenu, steamConnection, isSyncingSteam, fetchDbGames]);

  const syncSteamGames = useCallback(async () => {
    if (!steamConnection || steamSyncInFlight.current) return;
    steamSyncInFlight.current = true;
    setIsSyncingSteam(true);
    const notificationId = "steam-library-sync";
    const updateNotification = (description: string, progress: number) => {
      toast.custom(() => (
        <div className="relative w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/15 bg-[#111216]/95 px-4 pb-4 pt-3 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <LoaderCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin text-sky-300" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-5">Sincronizando biblioteca Steam</p>
              <p className="mt-1 text-xs leading-4 text-white/65">{description}</p>
            </div>
            <span className="shrink-0 pt-0.5 text-xs tabular-nums text-white/55">{progress}%</span>
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
            <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ), {
        id: notificationId,
        duration: Infinity,
        position: "top-center",
        unstyled: true,
        className: "!m-0 !min-w-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
      });
    };

    try {
      updateNotification("Importando jogos da sua conta...", 0);
      const library = await syncSteamGamesAction();
      const recentDescription = library.recentLookupFailed
        ? " Não foi possível verificar a lista de jogos recentes."
        : library.recentOnly
          ? ` ${library.recentOnly} jogos adicionais vieram dos seus jogos recentes.`
          : "";
      updateNotification(`${library.total} jogos encontrados.${recentDescription} Atualizando conquistas...`, 10);
      await fetchDbGames({ showError: false, force: true });

      let processed = 0;
      let remaining = 1;
      for (let batch = 0; batch < 3 && remaining > 0; batch++) {
        const result = await syncSteamAchievementBatch();
        processed += result.processed;
        remaining = result.remaining;
        const expected = processed + remaining;
        const progress = expected ? Math.min(99, 10 + Math.round((processed / expected) * 90)) : 100;
        updateNotification(`${processed} jogos verificados${remaining ? `, ${remaining} restantes` : ""}`, progress);
        if (!result.processed) break;
      }

      updateNotification(
        remaining
          ? `Biblioteca atualizada. ${processed} jogos verificados; ${remaining} restantes serão carregados gradualmente.`
          : `${library.total} jogos sincronizados com sucesso.`,
        100,
      );
      const loaded = await fetchDbGames({ showError: false, force: true });
      if (!loaded) throw new Error("Jogos sincronizados, mas não foi possível atualizar a biblioteca. Tente novamente.");
      toast.dismiss(notificationId);
      toast.custom((id) => (
        <section className="w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/15 bg-[#111216]/95 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="px-4 pb-3 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Sincronização concluída</p>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  {library.owned} jogos próprios encontrados
                  {library.recentOnly > 0 ? ` e ${library.recentOnly} jogos adicionais entre os recentes` : ""}.
                </p>
              </div>
              <button type="button" onClick={() => toast.dismiss(id)} aria-label="Fechar aviso" className="cursor-pointer text-lg leading-4 text-white/50 hover:text-white">×</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/50">
              {library.recentLookupFailed
                ? "Não foi possível consultar os jogos recentes. Jogos compartilhados pela Família Steam podem não aparecer na sincronização."
                : "A Steam pode não listar todos os jogos compartilhados pela Família Steam. Se algum estiver faltando, adicione-o pelo catálogo para tentarmos importar as conquistas disponíveis."}
            </p>
            <button
              type="button"
              onClick={() => { toast.dismiss(id); openAddGameModal(); }}
              className="mt-3 cursor-pointer rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15"
            >
              Adicionar jogo ausente
            </button>
          </div>
        </section>
      ), {
        id: "steam-library-sync-summary",
        duration: 14000,
        position: "top-center",
        unstyled: true,
        className: "!m-0 !min-w-0 !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none",
      });
      await fetchSteamConnection();
    } catch (error) {
      console.error("Error syncing Steam games:", error);
      toast.dismiss(notificationId);
      toast.error(error instanceof Error ? error.message : "Erro ao sincronizar Steam.");
    } finally {
      steamSyncInFlight.current = false;
      setIsSyncingSteam(false);
    }
  }, [steamConnection, fetchDbGames, fetchSteamConnection, openAddGameModal]);

  return (
    <GameContext.Provider value={{
      gameSelected, setGameSelected, menuSelected, setMenuSelected,
    gamesByMenu, isLoadingDbGames, isFetchingDbGames, gamesError, hasGames: gamesByMenu.length > 0,
    selectedTagId, setSelectedTagId, availableTags,
      page, pageSize, totalGames, counts, nextPage, previousPage, openGame,
      steamConnection, isLoadingConnection, steamOnboardingOpen, setSteamOnboardingOpen,
      fetchSteamConnection, fetchDbGames,
      isSyncingSteam, syncSteamGames, openAddGameModal,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameContext must be used within a GameProvider");
  return context;
}
