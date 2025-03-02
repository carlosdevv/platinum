"use client";

import { CardGameResume } from "@/components/card-game-resume";
import { SkeletonCardGameResume } from "@/components/skeletons/skeleton-card-game-resume";
import { SkeletonGameList } from "@/components/skeletons/skeleton-game-list";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useGameContext } from "@/context/useGameContext";
import { useCarousel } from "@/hooks/useCarousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect } from "react";

export function CardGame() {
  const { gameSelected, handleShowListOption, isLoadingPsnGames } =
    useGameContext();
  const { api, setApi } = useCarousel();

  useEffect(() => {
    if (api) {
      api.scrollTo(gameSelected);
    }
  }, [gameSelected, api]);

  return (
    <section className="mt-10 flex flex-col">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent className="">
          {isLoadingPsnGames ? (
            <SkeletonGameList />
          ) : (
            handleShowListOption().map((item, index) => (
              <CarouselItem
                key={item.iconUrl}
                className="basis-auto sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <div
                  className={cn(
                    "relative size-64 p-1 rounded-2xl transition-all duration-300",
                    index === gameSelected && item.hasPlatinum
                      ? "border-4 border-[#3557BD]"
                      : "border-[#F2FEF5] border-opacity-10"
                  )}
                >
                  <Image
                    className="rounded-2xl size-full object-fill"
                    src={item.iconUrl}
                    alt={`Capa do jogo ${item.name}`}
                    fill
                    quality={100}
                    priority={index === gameSelected}
                  />
                </div>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
      </Carousel>

      {isLoadingPsnGames ? (
        <SkeletonCardGameResume />
      ) : (
        <CardGameResume
          progress={handleShowListOption()[gameSelected]?.progress}
          name={handleShowListOption()[gameSelected]?.name}
          totalTrophies={handleShowListOption()[gameSelected]?.totalTrophies}
          earnedTrophies={handleShowListOption()[gameSelected]?.earnedTrophies}
          lastPlayed={handleShowListOption()[gameSelected]?.lastPlayed}
          hasPlatinum={handleShowListOption()[gameSelected]?.hasPlatinum}
        />
      )}
    </section>
  );
}
