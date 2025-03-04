"use client";

import { platinumTrophy } from "@/components/icons";
import { SkeletonTrophies } from "@/components/skeletons/skeleton-trophies";
import { useGameContext } from "@/context/useGameContext";
import Image from "next/image";

export function TrophyInfo() {
  const {
    platinumGames,
    isLoadingPsnGames,
    isLoadingSteamGames,
    psnGames,
    steamGames,
    dbGames,
  } = useGameContext();

  return (
    <>
      {isLoadingPsnGames || isLoadingSteamGames ? (
        <SkeletonTrophies />
      ) : (
        platinumGames && (
          <div className="flex items-center gap-4">
            <div className="flex items-end gap-2">
              <Image
                src={platinumTrophy}
                alt="platinumTrophy"
                width={20}
                height={20}
              />
              <h4 className="text-white font-semibold">
                {platinumGames.length}
              </h4>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-semibold text-center text-background text-xs py-0.5 w-[35px] bg-white rounded">
                PS5
              </span>
              <span>
                {psnGames.length +
                  dbGames.filter((game) => game.platform === "PS5").length}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-semibold text-center text-background text-xs py-0.5 w-[35px] bg-white rounded">
                PC
              </span>
              <span>
                {steamGames.length +
                  dbGames.filter((game) => game.platform === "PC").length}
              </span>
            </div>
          </div>
        )
      )}
    </>
  );
}
