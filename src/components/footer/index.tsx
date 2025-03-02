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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "x" && !isLoading) {
        onOpenAddGameModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenAddGameModal, isLoading]);

  return (
    <footer className="w-full absolute bottom-0 flex justify-end items-center pr-10 pb-4">
      {!isLoading && (
        <button
          type="button"
          onClick={() => onOpenAddGameModal(true)}
          className="flex gap-x-2"
        >
          <Icons.Close className="text-background size-5 rounded-full bg-white p-0.5" />
          <span className="text-white text-sm">ADD GAME</span>
        </button>
      )}
    </footer>
  );
}
