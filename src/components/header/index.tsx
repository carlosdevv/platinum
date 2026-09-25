"use client";

import { HeaderAvatar } from "@/components/header/header-avatar";
import { TrophyInfo } from "@/components/header/trophy-info";
import { Icons } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGameContext } from "@/context/useGameContext";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

function getCurrentHour() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Header() {
  const [currentHour, setCurrentHour] = useState<string | null>(null);
  const {
    isSyncingSteam,
    syncSteamGames,
    steamConnection,
    isLoadingConnection,
    setSteamOnboardingOpen,
    openAddGameModal,
  } = useGameContext();

  useEffect(() => {
    const updateHour = () => setCurrentHour(getCurrentHour());
    updateHour();
    const interval = window.setInterval(updateHour, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-10 py-4">
      {/* Left side - Wi-Fi and time */}
      <div className="flex items-center gap-4">
        <Icons.Wifi className="text-white size-5 ps5-text-glow" />
        <h3 className="text-white font-semibold ps5-text-glow">
          {currentHour ?? "--:--"}
        </h3>

        {steamConnection && <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={syncSteamGames}
                disabled={isSyncingSteam}
                aria-label={isSyncingSteam ? "Sincronizando biblioteca Steam" : "Sincronizar biblioteca Steam"}
                className={cn(
                  "group flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-all duration-300",
                  "text-gray-50 hover:text-white",
                  isSyncingSteam && "cursor-not-allowed opacity-70",
                  !isSyncingSteam && "hover:scale-105 active:scale-95",
                )}
              >
                {isSyncingSteam ? <Icons.Loader className="size-4 animate-spin" /> : <Icons.RefreshCw className="size-4 transition-transform duration-500 group-hover:rotate-180" />}
                <span className="text-sm font-medium">{isSyncingSteam ? "Sincronizando..." : "Sincronizar"}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {steamConnection.lastSyncedAt ? `Última sincronização: ${new Date(steamConnection.lastSyncedAt).toLocaleString("pt-BR")}` : "Sincronizar biblioteca Steam"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label="Sobre jogos compartilhados da Steam" onClick={openAddGameModal} className="ml-1 inline-flex size-8 translate-y-px cursor-pointer items-center justify-center self-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white">
                <Info aria-hidden="true" className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              Jogos compartilhados pela Família Steam podem não aparecer na sincronização. Se faltar algum, adicione-o pelo catálogo para tentar importar as conquistas disponíveis.
            </TooltipContent>
          </Tooltip>
        </div>}
        {!steamConnection && !isLoadingConnection && (
          <button type="button" onClick={() => setSteamOnboardingOpen(true)} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            Conectar Steam
          </button>
        )}
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
