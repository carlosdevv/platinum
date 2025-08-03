"use client";

import { CardGameResume } from "@/components/card-game-resume";
import { EmptyState } from "@/components/card-game/empty-state";
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
  const {
    gameSelected,
    gamesByMenu,
    isLoadingDbGames,
    hasGames,
  } = useGameContext();
  const { api, setApi } = useCarousel();

  const isLoading = isLoadingDbGames;
  const games = gamesByMenu;

  useEffect(() => {
    if (api && hasGames) {
      api.scrollTo(gameSelected);
    }
  }, [gameSelected, api, hasGames]);

  const currentGame = hasGames ? games[gameSelected] : null;

  return (
    <section className="mt-8 flex-1 flex flex-col">
      {/* Game Cards Carousel or Empty State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-start mb-6 -mx-8 overflow-hidden py-4">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent className="ml-8">
              <SkeletonGameList />
            </CarouselContent>
          </Carousel>
        </div>
      ) : hasGames ? (
        <div className="flex-1 flex items-center justify-start mb-6 -mx-8 overflow-hidden py-4">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent className="ml-8">
              {games.map((item, index) => (
                <CarouselItem
                  key={`${item.name}-${index}`}
                  className="pl-4 basis-auto"
                >
                  <div
                    className={cn(
                      "relative group transition-all duration-500 ease-out p-2",
                      index === gameSelected
                        ? "scale-105 z-20"
                        : "scale-95 opacity-70 hover:scale-100 hover:opacity-85"
                    )}
                  >
                    <div
                      className={cn(
                        "relative w-80 h-48 rounded-xl overflow-hidden transition-all duration-500 bg-gray-900",
                        index === gameSelected
                          ? "ring-2 ring-white/50 ring-opacity-60 shadow-2xl shadow-white/20"
                          : "hover:ring-1 hover:ring-white/20"
                      )}
                    >
                      {item.iconUrl && (
                        <Image
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          src={item.iconUrl}
                          alt={`Capa do jogo ${item.name}`}
                          fill
                          quality={100}
                          priority={index === gameSelected}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      
                      {index === gameSelected && (
                        <>
                          <div className="absolute top-3 right-3 w-2 h-2 bg-white/50 rounded-full animate-pulse shadow-lg shadow-white/50" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        </>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Game Information - Clean Layout */}
      {hasGames && (
        <div className="px-8">
          {isLoading ? (
            <SkeletonCardGameResume />
          ) : (
            <CardGameResume
              name={currentGame?.name}
              lastPlayed={currentGame?.lastPlayed ? new Date(currentGame.lastPlayed).getTime() : undefined}
              platform={currentGame?.platform}
            />
          )}
        </div>
      )}
    </section>
  );
}
