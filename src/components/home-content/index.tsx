"use client";

import { Menu } from "@/components/menu";
import { SteamOnboarding } from "@/components/steam-onboarding";

export function HomeContent() {
  return (
    <div className="flex flex-col gap-7 pt-[clamp(3.5rem,10vh,8rem)] sm:gap-9">
      <div>
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-white/45">
          Biblioteca
        </p>
        <h1 className="text-5xl font-light tracking-[-0.035em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.28)] sm:text-6xl">
          Games
        </h1>
      </div>

      <SteamOnboarding />

      <div><Menu /></div>
    </div>
  );
}
