"use client";

import { GameDataResponse } from "@/app/(services)/game/types";
import { useGetGameData } from "@/app/(services)/game/useGameService";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGameContext } from "@/context/useGameContext";
import { MenuOptions } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CardGameResume } from "./card-game-resume";
import { SkeletonCardGameResume } from "./skeleton-card-game-resume";
import { SkeletonGameList } from "./skeleton-game-list";

export function CardGame() {
  const {
    gameList,
    setGameList,
    gameSelected,
    menuSelected,
    platinumGamesList,
    setPlatinumGamesList,
  } = useGameContext();

  const { isLoading } = useGetGameData({
    onSuccess(data) {
      setGameList(data);
      setPlatinumGamesList(data.filter((game) => game.hasPlatinum));
    },
  });

  function showListOption(id: number): GameDataResponse[] {
    const listOption = {
      [Number(MenuOptions.RECENT_PLAYED)]: gameList,
      [Number(MenuOptions.PLATINUM)]: platinumGamesList,
    };

    return listOption[id];
  }

  return (
    <section className="mt-10 flex flex-col">
      <ScrollArea className="w-full overflow-x-hidden">
        <ScrollBar orientation="horizontal" />
        <div className="flex items-center pb-4 gap-6">
          {isLoading ? (
            <SkeletonGameList />
          ) : (
            showListOption(menuSelected).map((item, index) => (
              <div
                key={item.iconUrl}
                className={cn(
                  "h-64 w-64 p-1 rounded-2xl",
                  `${
                    index === gameSelected &&
                    `h-72 w-72 border-4 ${
                      item.hasPlatinum
                        ? "border-[#3557BD]"
                        : "border-[#F2FEF5] border-opacity-10"
                    }`
                  }`
                )}
              >
                <Image
                  className="rounded-2xl"
                  src={item.iconUrl}
                  alt="game"
                  width={index === gameSelected ? 288 : 256}
                  height={index === gameSelected ? 288 : 256}
                  
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {isLoading ? (
        <SkeletonCardGameResume />
      ) : (
        gameList && (
          <CardGameResume
            progress={showListOption(menuSelected)[gameSelected]?.progress}
            name={showListOption(menuSelected)[gameSelected]?.name}
            totalTrophies={
              showListOption(menuSelected)[gameSelected]?.totalTrophies
            }
            earnedTrophies={
              showListOption(menuSelected)[gameSelected]?.earnedTrophies
            }
            lastPlayed={showListOption(menuSelected)[gameSelected]?.lastPlayed}
            hasPlatinum={showListOption(menuSelected)[gameSelected]?.hasPlatinum}
          />
        )
      )}

      {/* <div className="mt-16 flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer ">
          <div className="w-5 h-5 flex items-center justify-center bg-[#F2F5FE] rounded-full">
            <Icons.Close size={16} />
          </div>
          <span className="text-white text-sm">Ver detalhes</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer ">
          <div className="w-5 h-5 flex items-center justify-center bg-[#F2F5FE] rounded-full">
            <Icons.Square size={14} />
          </div>
          <span className="text-white text-sm">Ver detalhes</span>
        </div>
      </div> */}
    </section>
  );
}
