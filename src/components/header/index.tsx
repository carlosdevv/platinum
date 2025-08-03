"use client";

import { HeaderAvatar } from "@/components/header/header-avatar";
import { TrophyInfo } from "@/components/header/trophy-info";
import { Icons } from "@/components/icons";
import { SkeletonHeader } from "@/components/skeletons/skeleton-header";
import { useGameContext } from "@/context/useGameContext";
import { cn } from "@/lib/utils";

function getCurrentHour() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Header() {
  const {
    isLoadingDbGames,
    isSyncingSteam,
    syncSteamGames,
    syncProgress,
    syncMessage,
  } = useGameContext();

  if (isLoadingDbGames) {
    return <SkeletonHeader />;
  }

  return (
    <header className="flex items-center justify-between px-10 py-4">
      {/* Left side - Wi-Fi and time */}
      <div className="flex items-center gap-4">
        <Icons.Wifi className="text-white size-5 ps5-text-glow" />
        <h3 className="text-white font-semibold ps5-text-glow">
          {getCurrentHour()}
        </h3>

        {/* Sync Button */}
        <div className="relative">
          <button
            onClick={syncSteamGames}
            disabled={isSyncingSteam}
            className={cn(
              "group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
              "text-gray-50 hover:text-white",
              isSyncingSteam
                ? "cursor-not-allowed opacity-70"
                : "hover:scale-105 active:scale-95"
            )}
          >
            {isSyncingSteam ? (
              <Icons.Loader className="size-4 animate-spin" />
            ) : (
              <Icons.RefreshCw className="size-4 group-hover:rotate-180 transition-transform duration-500" />
            )}
            <span className="text-sm font-medium">
              {isSyncingSteam ? "Syncing..." : "Sync"}
            </span>
          </button>

          {/* Progress Bar */}
          {isSyncingSteam && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 min-w-[200px] shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Loader className="size-3 animate-spin text-blue-400" />
                  <span className="text-xs text-white/80 font-medium">
                    {syncMessage}
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-white/60">{syncProgress}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center - Trophy statistics */}
      <TrophyInfo />

      {/* Right side - User profile and sync button */}
      <div className="flex items-center gap-4">
        <HeaderAvatar />
      </div>
    </header>
  );
}
