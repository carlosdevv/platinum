"use client";

import platinumTrophy from "@/assets/icons/platina-trophy.svg";
import { useGameContext } from "@/context/useGameContext";
import Image from "next/image";

export function TrophyInfo() {
  const { isLoadingDbGames, counts } = useGameContext();

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Image
          src={platinumTrophy}
          alt="Platinum Trophy"
          width={20}
          height={20}
        />
        <span className={`text-white ps5-text-glow ${isLoadingDbGames ? "animate-pulse" : ""}`}>
          {isLoadingDbGames ? 0 : counts.platinum}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white ps5-text-glow">
          Console <span className={isLoadingDbGames ? "animate-pulse" : ""}>{isLoadingDbGames ? 0 : counts.console}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white ps5-text-glow">
          PC <span className={isLoadingDbGames ? "animate-pulse" : ""}>{isLoadingDbGames ? 0 : counts.pc}</span>
        </span>
      </div>
    </div>
  );
}
