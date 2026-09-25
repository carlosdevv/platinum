"use client";

import type { GameFilter } from "@/context/useGameContext";

export function EmptyState({ filter, error, onRetry }: { filter: GameFilter; error?: string | null; onRetry: () => void }) {
  const emptyCopy: Record<GameFilter, string> = {
    platinados: "Você ainda não registrou jogos platinados.",
    todos: "Nenhum jogo encontrado nesta biblioteca.",
    console: "Você ainda não adicionou jogos de console.",
    pc: "Você ainda não adicionou jogos de PC.",
    outro: "Você ainda não adicionou jogos de outras plataformas.",
  };
  return (
    <div className="flex min-h-[clamp(222px,16.9vw,338px)] flex-col items-start justify-center gap-3 px-5 py-8 text-sm text-white/60">
      <p>{error ?? emptyCopy[filter]}</p>
      {error && (
        <button type="button" onClick={onRetry} className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
