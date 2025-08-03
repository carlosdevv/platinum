"use client";

import { Menu } from "@/components/menu";
import { SkeletonMenu } from "@/components/skeletons/skeleton-menu";
import { useGameContext } from "@/context/useGameContext";

export function HomeContent() {
  const { isLoadingDbGames } = useGameContext();

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-white font-light text-6xl ps5-text-glow tracking-wide">
          Games
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60" />
      </div>
      
      <div className="mt-2">
        {isLoadingDbGames ? <SkeletonMenu /> : <Menu />}
      </div>
    </div>
  );
}
