"use client";

import { useGameContext } from "@/context/useGameContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { menuItens } from "./itens";

export function Menu() {
  const { menuSelected, setMenuSelected, setGameSelected } = useGameContext();

  const updateMenuSelection = (selectedId: string) => {
    setMenuSelected(selectedId);
    setGameSelected(0);
  };

  const cycleFilter = (direction: number) => {
    const currentIndex = menuItens.findIndex((item) => item.id === menuSelected);
    const nextIndex = (currentIndex + direction + menuItens.length) % menuItens.length;
    updateMenuSelection(menuItens[nextIndex].id);
  };

  return (
    <nav aria-label="Filtros da biblioteca" className="max-w-full">
      <div className="console-filter-bar inline-flex max-w-full items-center gap-1.5 rounded-2xl p-1.5 sm:gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Filtro anterior"
              onClick={() => cycleFilter(-1)}
              className="flex h-10 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-black/15 text-xs font-semibold tracking-wider text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              L1
            </button>
          </TooltipTrigger>
          <TooltipContent>Filtro anterior</TooltipContent>
        </Tooltip>

        <div role="tablist" aria-label="Plataforma" className="flex items-center gap-1 overflow-x-auto">
          {menuItens.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="tab"
                  aria-selected={item.id === menuSelected}
                  aria-controls="game-library"
                  tabIndex={item.id === menuSelected ? 0 : -1}
                  data-active={item.id === menuSelected}
                  onClick={() => updateMenuSelection(item.id)}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                    event.preventDefault();
                    const direction = event.key === "ArrowRight" ? 1 : -1;
                    const currentIndex = menuItens.findIndex((tab) => tab.id === item.id);
                    const nextIndex = (currentIndex + direction + menuItens.length) % menuItens.length;
                    updateMenuSelection(menuItens[nextIndex].id);
                    event.currentTarget.parentElement
                      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]
                      ?.focus();
                  }}
                  className={cn(
                    "console-filter-tab relative min-w-16 cursor-pointer rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-w-20 sm:px-5",
                    item.id === menuSelected
                      ? "text-white"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.name}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {item.id === "all" ? "Mostrar todos os jogos" : `Mostrar jogos do ${item.id === "pc" ? "PC" : "PS5"}`}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Próximo filtro"
              onClick={() => cycleFilter(1)}
              className="flex h-10 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-black/15 text-xs font-semibold tracking-wider text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              R1
            </button>
          </TooltipTrigger>
          <TooltipContent>Próximo filtro</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  );
}
