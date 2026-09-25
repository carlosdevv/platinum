"use client";

import { Icons } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGameContext } from "@/context/useGameContext";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect } from "react";

export function Footer() {
  const { isLoadingDbGames, isFetchingDbGames, gameSelected, gamesByMenu, hasGames } = useGameContext();
  const [, setRemoveModalOpen] = useQueryState("remove-game-modal", parseAsBoolean.withDefault(false));
  const [, setUpdateModalOpen] = useQueryState("update-game-modal", parseAsBoolean.withDefault(false));
  const [, setAddModalOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));
  const [, setSearchModalOpen] = useQueryState("search-game-modal", parseAsBoolean.withDefault(false));

  const isLoading = isLoadingDbGames;
  const isActionsDisabled = isLoadingDbGames || isFetchingDbGames;
  const currentGame = gamesByMenu[gameSelected];
  const isDbGame = Boolean(currentGame && 'id' in currentGame);
  const showGameActions = isLoadingDbGames || Boolean(isDbGame && hasGames);

  useEffect(() => {
    if (isLoading) return;

    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest('input, textarea, select, [role="combobox"]'))
      ) return;

      const key = event.key.toLowerCase();
      if (key === "d" && isDbGame && hasGames) {
        event.preventDefault();
        setRemoveModalOpen(true);
      } else if (key === "e" && isDbGame && hasGames) {
        event.preventDefault();
        setUpdateModalOpen(true);
      } else if (key === "a") {
        event.preventDefault();
        setAddModalOpen(true);
      } else if (key === "/") {
        event.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [hasGames, isDbGame, isLoading, setAddModalOpen, setRemoveModalOpen, setSearchModalOpen, setUpdateModalOpen]);

  const handleDeleteGame = () => {
    if (!hasGames) return;
    setRemoveModalOpen(true);
  };

  const handleUpdateGame = () => {
    if (!hasGames) return;
    setUpdateModalOpen(true);
  };

  const handleAddGame = () => {
    setAddModalOpen(true);
  };

  const handleSearchGame = () => {
    setSearchModalOpen(true);
  };

  return (
    <footer className="sticky bottom-0 z-30 bg-transparent px-4 py-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-end lg:pr-8">
        {/* Delete Game Button - Only show for database games */}
        {showGameActions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDeleteGame}
                disabled={isActionsDisabled || !isDbGame || !hasGames}
                aria-keyshortcuts="D"
                className="group inline-flex cursor-pointer items-center gap-2 transition-transform duration-300 hover:scale-105 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-white/50 shadow-lg">
                  <Icons.X className="size-4" />
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-gray-50 ps5-text-glow">Excluir jogo</span>
                <kbd className="inline-flex size-5 shrink-0 items-center justify-center rounded border border-white/15 text-center text-[0.65rem] font-medium leading-none text-white/60">D</kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent>Excluir o jogo selecionado · tecla D</TooltipContent>
          </Tooltip>
        )}

        {/* Update Game Button - Only show for database games */}
        {showGameActions && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleUpdateGame}
                disabled={isActionsDisabled || !isDbGame || !hasGames}
                aria-keyshortcuts="E"
                className="group inline-flex cursor-pointer items-center gap-2 transition-transform duration-300 hover:scale-105 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-white/50 shadow-lg">
                  <Icons.Circle className="size-4" />
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-gray-50 ps5-text-glow">Editar jogo</span>
                <kbd className="inline-flex size-5 shrink-0 items-center justify-center rounded border border-white/15 text-center text-[0.65rem] font-medium leading-none text-white/60">E</kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent>Editar o jogo selecionado · tecla E</TooltipContent>
          </Tooltip>
        )}

        {/* Add Game Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleAddGame}
              disabled={isActionsDisabled}
              aria-keyshortcuts="A"
              className="group inline-flex cursor-pointer items-center gap-2 transition-transform duration-300 hover:scale-105 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-white/50 shadow-lg">
                <Icons.Square className="size-4" />
              </span>
              <span className="text-sm font-medium uppercase tracking-wider text-gray-50 ps5-text-glow">Adicionar jogo</span>
              <kbd className="inline-flex size-5 shrink-0 items-center justify-center rounded border border-white/15 text-center text-[0.65rem] font-medium leading-none text-white/60">A</kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent>Adicionar um jogo · tecla A</TooltipContent>
        </Tooltip>

        {/* Search Game Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleSearchGame}
              disabled={isActionsDisabled}
              aria-keyshortcuts="/"
              className="group inline-flex cursor-pointer items-center gap-2 transition-transform duration-300 hover:scale-105 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-white/50 shadow-lg">
                <Icons.Triangle className="size-4" />
              </span>
              <span className="text-sm font-medium uppercase tracking-wider text-gray-50 ps5-text-glow">Localizar jogo</span>
              <kbd className="inline-flex size-5 shrink-0 items-center justify-center rounded border border-white/15 text-center text-[0.65rem] font-medium leading-none text-white/60">/</kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent>Localizar jogo já adicionado · tecla /</TooltipContent>
        </Tooltip>
      </div>
    </footer>
  );
}
