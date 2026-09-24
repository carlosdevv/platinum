"use client";

import {
  gameArtworkCandidates,
  isOptimizedGameArtwork,
  resolvedImageFit,
  type GameImageFit,
  type GameImagePosition,
} from "@/lib/game-artwork";
import Image from "next/image";
import { useState } from "react";

type GameCoverProps = {
  imageUrl?: string | null;
  name: string;
  fit?: GameImageFit;
  position?: GameImagePosition;
  priority?: boolean;
  sizes: string;
};

export function GameCover({
  imageUrl,
  name,
  fit = "auto",
  position = "center",
  priority = false,
  sizes,
}: GameCoverProps) {
  const [attempt, setAttempt] = useState(0);
  const candidates = gameArtworkCandidates(imageUrl);
  const source = candidates[attempt];

  if (!source) {
    return (
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#514b55_0%,#242939_48%,#101722_100%)] p-5">
        <span className="text-[0.6rem] font-semibold tracking-[0.32em] text-white/55">PLATINUM</span>
      </div>
    );
  }

  return (
    <Image
      src={source}
      alt={`Capa de ${name}`}
      fill
      priority={priority && attempt === 0}
      sizes={sizes}
      unoptimized={!isOptimizedGameArtwork(source)}
      onError={() => setAttempt((current) => current + 1)}
      className="object-contain"
      style={{ objectFit: resolvedImageFit(source, fit), objectPosition: position }}
    />
  );
}
