"use client";

import { Icons } from "@/components/icons";
import { parseAsBoolean, useQueryState } from "nuqs";

export function EmptyState() {
  const [, setIsOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));

  const handleAddGame = () => {
    setIsOpen(true);
  };

  return (
    <div className="flex items-center gap-7 px-8 py-5 sm:px-10">
      <button
        type="button"
        onClick={handleAddGame}
        aria-label="Adicionar jogo"
        className="console-game-art group flex shrink-0 flex-col items-center justify-center gap-4 rounded-[14px] border border-dashed border-white/25 bg-white/5 text-white/70 backdrop-blur-lg transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <span className="flex size-14 items-center justify-center rounded-full border border-white/25 bg-white/10">
          <Icons.Plus className="size-7" />
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.18em]">Add game</span>
      </button>
      <p className="max-w-52 text-sm leading-relaxed text-white/55">
        No games here yet. Add a game or sync your Steam library.
      </p>
    </div>
  );
}
