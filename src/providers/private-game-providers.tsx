"use client";

import { GameProvider } from "@/context/useGameContext";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

export function PrivateGameProviders({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <GameProvider>{children}</GameProvider>
    </NuqsAdapter>
  );
}
