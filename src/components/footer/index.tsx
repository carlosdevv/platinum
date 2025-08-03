"use client";

import { Icons } from "@/components/icons";
import { useGameContext } from "@/context/useGameContext";
import { parseAsBoolean, useQueryState } from "nuqs";

export function Footer() {
  const { isLoadingDbGames, gameSelected, gamesByMenu, hasGames } = useGameContext();
  const [, setRemoveModalOpen] = useQueryState("remove-game-modal", parseAsBoolean.withDefault(false));
  const [, setUpdateModalOpen] = useQueryState("update-game-modal", parseAsBoolean.withDefault(false));
  const [, setAddModalOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));
  const [, setSearchModalOpen] = useQueryState("search-game-modal", parseAsBoolean.withDefault(false));

  const isLoading = isLoadingDbGames;
  const currentGame = gamesByMenu[gameSelected];
  const isDbGame = currentGame && 'id' in currentGame;

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

  if (isLoading) {
    return (
      <footer className="py-6">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <span className="text-gray-400 text-sm font-semibold">Loading...</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="py-6">
      <div className="flex items-center justify-end pr-16 gap-6">
        {/* Delete Game Button - Only show for database games */}
        {isDbGame && (
          <button
            onClick={handleDeleteGame}
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-lg">
                <Icons.X className="size-4" />
              </div>
              <div className="absolute inset-0 w-6 h-6 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            </div>
            <span className="text-gray-50 text-sm font-medium ps5-text-glow uppercase tracking-wider">
              Delete Game
            </span>
          </button>
        )}

        {/* Update Game Button - Only show for database games */}
        {isDbGame && (
          <button
            onClick={handleUpdateGame}
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-lg">
                <Icons.Circle className="size-4" />
              </div>
              <div className="absolute inset-0 w-6 h-6 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            </div>
            <span className="text-gray-50 text-sm font-medium ps5-text-glow uppercase tracking-wider">
              Update Game
            </span>
          </button>
        )}

        {/* Add Game Button */}
        <button
          onClick={handleAddGame}
          className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <div className="w-6 h-6 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-lg">
              <Icons.Square className="size-4" />
            </div>
            <div className="absolute inset-0 w-6 h-6 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
          </div>
          <span className="text-gray-50 text-sm font-medium ps5-text-glow uppercase tracking-wider">
            Add Game
          </span>
        </button>

        {/* Search Game Button */}
        <button
          onClick={handleSearchGame}
          className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <div className="w-6 h-6 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-lg">
              <Icons.Triangle className="size-4" />
            </div>
            <div className="absolute inset-0 w-6 h-6 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
          </div>
          <span className="text-gray-50 text-sm font-medium ps5-text-glow uppercase tracking-wider">
            Search Game
          </span>
        </button>
      </div>
    </footer>
  );
}
