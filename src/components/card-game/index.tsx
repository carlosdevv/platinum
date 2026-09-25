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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { parseAsBoolean, useQueryState } from "nuqs";

type GameTileProps = {
  name: string;
  tags?: Array<{ tag: { id: string; name: string; color: string } }>;
  imageUrl?: string | null;
  imageFit?: "auto" | "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom" | "left" | "right";
  selected: boolean;
  priority: boolean;
  onSelect: () => void;
};

function GameTile({ name, tags, imageUrl, imageFit, imagePosition, selected, priority, onSelect }: GameTileProps) {
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
      {Boolean(tags?.length) && (
        <span className="pointer-events-none absolute right-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap justify-end gap-1">
          {tags!.slice(0, 2).map(({ tag }) => {
            const color = tag.color || "#3B82F6";
            return (
              <span
                key={tag.id}
                className="max-w-24 truncate rounded-full border px-1.5 py-1 text-[9px] font-medium leading-none backdrop-blur-md"
                style={{ color, borderColor: `${color}88`, backgroundColor: `${color}30` }}
              >
                {tag.name}
              </span>
            );
          })}
          {tags!.length > 2 && <span className="rounded-full border border-white/20 bg-black/40 px-1.5 py-1 text-[9px] leading-none text-white/75">+{tags!.length - 2}</span>}
        </span>
      )}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-xs font-medium leading-snug text-white/90 drop-shadow-md sm:p-4">
        {name}
      </span>
    </button>
  );
}

export function CardGame() {
  const [, setAddGameOpen] = useQueryState("add-game-modal", parseAsBoolean.withDefault(false));
  const {
    gameSelected,
    setGameSelected,
    gamesByMenu,
    isLoadingDbGames,
    hasGames,
    page,
    pageSize,
    totalGames,
    nextPage,
    previousPage,
    isFetchingDbGames,
    gamesError,
    fetchDbGames,
    menuSelected,
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
  const globalIndex = page * pageSize + gameSelected;
  const goBack = () => gameSelected > 0 ? setGameSelected(gameSelected - 1) : previousPage();
  const goForward = () => gameSelected < gamesByMenu.length - 1 ? setGameSelected(gameSelected + 1) : nextPage();

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
        <h2 className="mb-3 min-h-10 max-w-[70ch] truncate text-2xl font-light tracking-wide text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.3)] sm:text-3xl">
          {currentGame.name}
        </h2>
      ) : null}

      {hasGames && !isLoadingDbGames && (
        <nav aria-label="Navegação entre jogos" className="mb-3 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  aria-label="Jogo anterior"
                  disabled={isFetchingDbGames || globalIndex === 0}
                  onClick={goBack}
                  className="console-carousel-arrow"
                >
                  <ChevronLeft aria-hidden="true" className="size-4 stroke-[1.7]" />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Voltar</TooltipContent>
          </Tooltip>
          <span className="min-w-12 text-center text-[0.68rem] tracking-[0.16em] text-white/55">
            {globalIndex + 1} / {totalGames}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <button
                  type="button"
                  aria-label="Próximo jogo"
                  disabled={isFetchingDbGames || globalIndex >= totalGames - 1}
                  onClick={goForward}
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

      <div className="flex w-full items-center gap-4">
        <button
          type="button"
          aria-label="Adicionar jogo"
          disabled={isFetchingDbGames}
          onClick={() => setAddGameOpen(true)}
          className="console-game-art group flex shrink-0 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-[14px] border border-dashed border-white/25 bg-white/[0.045] text-white/70 backdrop-blur-lg transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex size-14 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-colors group-hover:bg-white/15">
            <Plus className="size-7" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.18em]">Adicionar jogo</span>
        </button>

        <div aria-hidden="true" className="h-[min(18rem,30vh)] w-px shrink-0 bg-gradient-to-b from-transparent via-white/25 to-transparent" />

        <div className="min-w-0 flex-1">
          {isLoadingDbGames ? (
            <SkeletonGameList />
          ) : gamesError ? (
            <EmptyState filter={menuSelected} error={gamesError} onRetry={() => void fetchDbGames()} />
          ) : hasGames ? (
            <Carousel key={`${page}-${totalGames}`} className="w-full px-2" opts={{ align: "start", containScroll: false }} setApi={setApi}>
              <CarouselContent className="ml-0 px-2 py-5 pr-4">
                {gamesByMenu.map((item, index) => (
                  <CarouselItem key={item.id} className="flex basis-auto items-center pl-4 first:pl-0">
                    <GameTile
                      name={item.name}
                      tags={item.tags}
                      imageUrl={item.iconUrl}
                      imageFit={item.imageFit as GameTileProps["imageFit"]}
                      imagePosition={item.imagePosition as GameTileProps["imagePosition"]}
                      selected={index === gameSelected}
                      priority={index === gameSelected}
                      onSelect={() => setGameSelected(index)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <EmptyState filter={menuSelected} onRetry={() => void fetchDbGames()} />
          )}
        </div>
      </div>

      {hasGames && (
        <>
          <div className={cn("mt-5", isFetchingDbGames && "pointer-events-none opacity-50")}>
            {isLoadingDbGames ? (
              <SkeletonCardGameResume />
            ) : (
                <CardGameResume
                name={currentGame?.name}
                lastPlayed={currentGame?.lastPlayed ? new Date(currentGame.lastPlayed).getTime() : undefined}
                platform={currentGame?.platform}
                hasPlatinum={currentGame?.hasPlatinum}
                progress={currentGame?.progress}
                earnedAchievements={currentGame?.earnedAchievements}
                totalAchievements={currentGame?.totalAchievements}
                lastAchievementName={currentGame?.lastAchievementName}
                lastAchievementAt={currentGame?.lastAchievementAt ? new Date(currentGame.lastAchievementAt).getTime() : undefined}
                achievementStatus={currentGame?.achievementStatus}
                source={currentGame?.externalGameId ? "steam" : currentGame?.source}
                status={currentGame?.status}
                tags={currentGame?.tags}
                showTitle={false}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
