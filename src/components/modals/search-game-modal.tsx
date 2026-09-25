"use client";

import { GameCover } from "@/components/game-cover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGameContext } from "@/context/useGameContext";
import { useDebounce } from "@/hooks/useDebounce";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchWithSession } from "@/lib/client-auth-fetch";

type SearchResult = { id: string; name: string; iconUrl: string | null; platform: string };

export function SearchGameModal() {
  const [open, setOpen] = useQueryState("search-game-modal", parseAsBoolean.withDefault(false));
  const { openGame } = useGameContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (!open || debounced.length < 2) return;
    const controller = new AbortController();
    fetchWithSession(`/api/games/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Falha na busca");
        return response.json();
      })
      .then((data) => setResults(data.games ?? []))
      .catch((error) => { if (error.name !== "AbortError") toast.error("Não foi possível buscar seus jogos."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, debounced]);

  const close = () => { setOpen(false); setQuery(""); setResults([]); };

  return (
    <Dialog open={open} onOpenChange={(next) => next ? setOpen(true) : close()}>
      <DialogContent variant="glass" className="max-w-md">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl font-light text-white">Localizar jogo</DialogTitle>
          <DialogDescription className="text-white/60">Encontre um jogo que já foi adicionado à sua biblioteca do Platinum. Para incluir um título novo, use Adicionar jogo.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-4 pb-4 pt-4">
        <Input
          autoFocus
          value={query}
          onChange={(event) => { setQuery(event.target.value); setResults([]); setLoading(event.target.value.trim().length >= 2); }}
          placeholder="Nome do jogo"
          className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
        />
        {query.trim().length < 2 ? (
          <p className="text-sm text-white/50">Digite pelo menos 2 letras.</p>
        ) : loading ? (
          <p className="text-sm text-white/50">Buscando...</p>
        ) : results.length ? (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {results.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={async () => { try { await openGame(game.id); close(); } catch { toast.error("Não foi possível abrir o jogo."); } }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/10"
              >
                <span className="relative block size-10 shrink-0 overflow-hidden rounded bg-white/10">
                  <GameCover imageUrl={game.iconUrl} name={game.name} sizes="40px" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{game.name}</span>
                <span className="text-xs text-white/45">{game.platform}</span>
              </button>
            ))}
          </div>
        ) : <p className="text-sm text-white/50">Nenhum jogo encontrado.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
