"use client";

import { Icons } from "@/components/icons";
import { useGameContext } from "@/context/useGameContext";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect } from "react";

export default function Footer() {
  const { isLoadingPsnGames, isLoadingSteamGames } = useGameContext();
  const isLoading = isLoadingPsnGames || isLoadingSteamGames;

  const [, onOpenAddGameModal] = useQueryState(
    "add-game-modal",
    parseAsBoolean
  );

  const [, onOpenSearchGameModal] = useQueryState(
    "search-game-modal",
    parseAsBoolean
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "x" && !isLoading) {
        onOpenAddGameModal(true);
      }

      if (event.key === "c" && !isLoading) {
        onOpenSearchGameModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenAddGameModal, isLoading]);

  return (
    <>
      {!isLoading && (
        <footer className="w-full absolute bottom-0 flex gap-x-8 justify-end items-center pr-10 pb-4">
          <button
            type="button"
            onClick={() => onOpenAddGameModal(true)}
            className="flex gap-x-2"
          >
            <Icons.Close className="text-background size-5 rounded-full bg-white p-0.5" />
            <span className="text-white text-sm">ADD GAME</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenSearchGameModal(true)}
            className="flex gap-x-2"
          >
            <Icons.Square className="text-background size-5 rounded-full bg-white p-[3px]" />
            <span className="text-white text-sm">SEARCH GAME</span>
          </button>
        </footer>
      )}
    </>
  );
}
