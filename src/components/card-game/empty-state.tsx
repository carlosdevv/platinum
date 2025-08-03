"use client";

import { Icons } from "@/components/icons";
import { parseAsBoolean, useQueryState } from "nuqs";

export function EmptyState() {
  const [, setIsOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));

  const handleAddGame = () => {
    setIsOpen(true);
  };

  return (
    <div className="flex-1 flex items-center justify-start mb-6 -mx-8 overflow-hidden py-4">
      <div className="ml-8 pl-4">
        <div
          onClick={handleAddGame}
          className="relative group cursor-pointer transition-all duration-500 ease-out p-2"
        >
          <div className="relative w-80 h-48 rounded-xl overflow-hidden transition-all duration-500 bg-gray-900/20 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-gray-900/30 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <Icons.Plus className="text-white/70 size-8 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-white/90 text-lg font-medium mb-2 group-hover:text-white transition-colors duration-300">
                  No games found
                </h3>
                <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors duration-300 mb-2">
                  Click to add your first game
                </p>
                <p className="text-white/40 text-xs group-hover:text-white/60 transition-colors duration-300">
                  Sync with Steam or add games manually
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
} 