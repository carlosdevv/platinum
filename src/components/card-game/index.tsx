"use client";

import { CardGameResume } from "@/components/card-game-resume";
import { GameCover } from "@/components/game-cover";
import { EmptyState } from "@/components/card-game/empty-state";
import { SkeletonCardGameResume } from "@/components/skeletons/skeleton-card-game-resume";
import { SkeletonGameList } from "@/components/skeletons/skeleton-game-list";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGameContext } from "@/context/useGameContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type GameTileProps = {
  name: string;
  imageUrl?: string | null;
  imageFit?: "auto" | "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom" | "left" | "right";
  selected: boolean;
  priority: boolean;
  onSelect: () => void;
};

function GameTile({ name, imageUrl, imageFit, imagePosition, selected, priority, onSelect }: GameTileProps) {
  return (
    <button
      type="button"
      aria-label={`Selecionar ${name}`}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "console-game-art group relative block shrink-0 overflow-hidden rounded-[14px] text-left transition-[height,transform] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
        !selected && "hover:-translate-y-2 hover:scale-[1.02]"
      )}
      data-selected={selected}
    >
      <GameCover
        key={imageUrl ?? "no-cover"}
        imageUrl={imageUrl}
        name={name}
        fit={imageFit}
        position={imagePosition}
        priority={priority}
        sizes="(max-width: 640px) 150px, (max-width: 1280px) 180px, 240px"
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-xs font-medium leading-snug text-white/90 drop-shadow-md sm:p-4">
        {name}
      </span>
    </button>
  );
}

export function CardGame() {
  const {
    gameSelected,
    setGameSelected,
    gamesByMenu,
    isLoadingDbGames,
    hasGames,
  } = useGameContext();
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || !hasGames) return;

    const revealSelectedCard = () => {
      const viewport = api.containerNode().parentElement;
      const slide = api.slideNodes()[gameSelected];
      const card = slide?.querySelector<HTMLElement>(".console-game-art");
      if (!viewport || !card) return;

      const viewportRect = viewport.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const slideWidth = slide.getBoundingClientRect().width;
      if (!slideWidth) return;
      const currentSnap = api.selectedScrollSnap();
      const lastSnap = api.scrollSnapList().length - 1;
      const edgeInset = 10;

      if (cardRect.right > viewportRect.right - edgeInset) {
        const steps = Math.ceil((cardRect.right - viewportRect.right + edgeInset) / slideWidth);
        api.scrollTo(Math.min(currentSnap + steps, lastSnap));
      } else if (cardRect.left < viewportRect.left + edgeInset) {
        const steps = Math.ceil((viewportRect.left + edgeInset - cardRect.left) / slideWidth);
        api.scrollTo(Math.max(currentSnap - steps, 0));
      }
    };

    revealSelectedCard();
    api.on("reInit", revealSelectedCard);
    return () => { api.off("reInit", revealSelectedCard); };
  }, [gameSelected, api, hasGames, gamesByMenu.length]);

  useEffect(() => {
    if (!api) return;
    const keepSelectionVisible = () => {
      const viewport = api.containerNode().parentElement;
      if (!viewport) return;
      const bounds = viewport.getBoundingClientRect();
      const slides = api.slideNodes();
      const selected = slides[gameSelected]?.querySelector<HTMLElement>(".console-game-art");
      const selectedBounds = selected?.getBoundingClientRect();
      if (selectedBounds && selectedBounds.left >= bounds.left && selectedBounds.right <= bounds.right) return;

      const firstFullyVisible = slides.findIndex((slide) => {
        const card = slide.querySelector<HTMLElement>(".console-game-art");
        if (!card) return false;
        const rect = card.getBoundingClientRect();
        return rect.left >= bounds.left && rect.right <= bounds.right;
      });
      if (firstFullyVisible !== -1) setGameSelected(firstFullyVisible);
    };

    api.on("settle", keepSelectionVisible);
    return () => { api.off("settle", keepSelectionVisible); };
  }, [api, gameSelected, setGameSelected]);

  const currentGame = hasGames ? gamesByMenu[gameSelected] : null;

  return (
    <section
      id="game-library"
      role="tabpanel"
      aria-label="Jogos filtrados"
      className="mt-6 w-full flex-1"
    >
      {isLoadingDbGames ? (
        <div className="mb-3 h-10 w-72 animate-pulse rounded-lg bg-white/10" />
      ) : currentGame ? (
        <h2 className="mb-3 min-h-10 max-w-[70ch] truncate px-8 text-2xl font-light tracking-wide text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.3)] sm:px-10 sm:text-3xl">
          {currentGame.name}
        </h2>
      ) : null}

      {hasGames && !isLoadingDbGames && (
        <nav aria-label="Navegação entre jogos" className="mb-3 flex items-center gap-2 px-8 sm:px-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  aria-label="Jogo anterior"
                  disabled={gameSelected === 0}
                  onClick={() => setGameSelected(gameSelected - 1)}
                  className="console-carousel-arrow"
                >
                  <ChevronLeft aria-hidden="true" className="size-4 stroke-[1.7]" />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Voltar</TooltipContent>
          </Tooltip>
          <span className="min-w-12 text-center text-[0.68rem] tracking-[0.16em] text-white/55">
            {gameSelected + 1} / {gamesByMenu.length}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  aria-label="Próximo jogo"
                  disabled={gameSelected >= gamesByMenu.length - 1}
                  onClick={() => setGameSelected(gameSelected + 1)}
                  className="console-carousel-arrow"
                >
                  <ChevronRight aria-hidden="true" className="size-4 stroke-[1.7]" />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Avançar</TooltipContent>
          </Tooltip>
        </nav>
      )}

      {isLoadingDbGames ? (
        <SkeletonGameList />
      ) : hasGames ? (
        <Carousel className="w-full px-4 sm:px-6" opts={{ align: "start", containScroll: false }} setApi={setApi}>
          <CarouselContent className="ml-0 py-5 pr-4">
            {gamesByMenu.map((item, index) => (
              <CarouselItem key={`${item.name}-${index}`} className="flex basis-auto items-center pl-4">
                <GameTile
                  name={item.name}
                  imageUrl={item.iconUrl}
                  imageFit={"imageFit" in item ? item.imageFit as GameTileProps["imageFit"] : "auto"}
                  imagePosition={"imagePosition" in item ? item.imagePosition as GameTileProps["imagePosition"] : "center"}
                  selected={index === gameSelected}
                  priority={index === gameSelected}
                  onSelect={() => setGameSelected(index)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <EmptyState />
      )}

      {hasGames && (
        <>
          <div className="mt-5 px-8 sm:px-10">
            {isLoadingDbGames ? (
              <SkeletonCardGameResume />
            ) : (
              <CardGameResume
                name={currentGame?.name}
                lastPlayed={currentGame?.lastPlayed ? new Date(currentGame.lastPlayed).getTime() : undefined}
                platform={currentGame?.platform}
                showTitle={false}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
