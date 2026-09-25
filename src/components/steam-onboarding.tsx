"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGameContext } from "@/context/useGameContext";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Gamepad2, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function SteamOnboarding() {
  const { data: session } = useSession();
  const {
    steamConnection,
    isLoadingConnection,
    syncSteamGames,
    setMenuSelected,
    steamOnboardingOpen,
    setSteamOnboardingOpen,
  } = useGameContext();
  const autoSyncStarted = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || isLoadingConnection || steamConnection) return;
    const key = `platinum-steam-onboarding-${session.user.id}`;
    if (window.localStorage.getItem(key)) return;
    let active = true;
    queueMicrotask(() => { if (active) setSteamOnboardingOpen(true); });
    return () => { active = false; };
  }, [session?.user?.id, isLoadingConnection, steamConnection, setSteamOnboardingOpen]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("steam");
    if (isLoadingConnection) return;
    if (!result && steamConnection && !autoSyncStarted.current &&
        (!steamConnection.lastSyncedAt || Date.now() - new Date(steamConnection.lastSyncedAt).getTime() > 24 * 60 * 60 * 1000)) {
      autoSyncStarted.current = true;
      setMenuSelected("todos");
      void syncSteamGames();
      return;
    }
    if (!result) return;
    url.searchParams.delete("steam");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    if (result === "connected" && steamConnection) {
      autoSyncStarted.current = true;
      setMenuSelected("todos");
      void syncSteamGames().then(() => setMenuSelected("todos"));
    } else if (result === "connection-save-failed") {
      toast.error("A Steam confirmou sua conta, mas não conseguimos salvar a conexão. Tente novamente.");
    } else {
      toast.error("Não foi possível conectar à Steam. Tente novamente.");
    }
  }, [isLoadingConnection, steamConnection, syncSteamGames, setMenuSelected]);

  const dismiss = () => {
    if (session?.user?.id) window.localStorage.setItem(`platinum-steam-onboarding-${session.user.id}`, "dismissed");
    setSteamOnboardingOpen(false);
  };

  if (isLoadingConnection || steamConnection) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-white/6 px-4 py-3 text-sm text-white/80">
        <Gamepad2 aria-hidden="true" className="size-5 text-white/75" />
        <span className="flex-1">Conecte sua Steam para importar jogos e conquistas automaticamente.</span>
        <button type="button" onClick={() => setSteamOnboardingOpen(true)} className="cursor-pointer rounded-lg border border-white/30 px-3 py-1.5 text-white hover:bg-white/10">
          Conectar Steam
        </button>
      </div>

      <Dialog open={steamOnboardingOpen} onOpenChange={(next) => next ? setSteamOnboardingOpen(true) : dismiss()}>
        <DialogContent variant="glass" className="sm:max-w-lg">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-2xl font-light">Conecte sua Steam</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-white/65">
              Você será redirecionado para o site oficial da Steam para confirmar sua identidade. O login acontece por lá, fora do app.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4 space-y-3 px-4 pt-4">
            <div className="flex gap-3 rounded-xl border border-white/10 bg-white/4.5 p-4 backdrop-blur-xl">
              <Gamepad2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-white/75" />
              <div>
                <p className="text-sm font-medium text-white/85">Quais dados são usados?</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Recebemos seu SteamID e consultamos os dados que a Steam disponibiliza da sua biblioteca: jogos que você já jogou, tempo de jogo e conquistas. Eles são usados para montar sua biblioteca no Platinum.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-emerald-200/10 bg-emerald-100/[0.035] p-4">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-100/70" />
              <p className="text-xs leading-relaxed text-white/65">
                <span className="font-medium text-white/80">Sua senha não passa pelo Platinum.</span> Não solicitamos nem armazenamos sua senha, e-mail ou dados de pagamento da Steam. A autenticação é feita diretamente nos servidores da Steam.
              </p>
            </div>
            <p className="px-1 text-xs leading-relaxed text-white/50">
              Para importar jogos e conquistas, os detalhes de jogos precisam estar visíveis nas configurações de privacidade da Steam. Se preferir, você pode continuar usando o app e adicionar jogos manualmente.
            </p>
          </div>
          <DialogFooter className="w-full flex-row justify-between px-4 pb-4 pt-4 sm:justify-between sm:space-x-0">
            <button type="button" onClick={dismiss} className="mr-auto cursor-pointer px-3 py-2 text-sm text-white/65 hover:text-white">Agora não</button>
            <a href="/api/steam/connect" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-linear-to-br from-white/15 to-white/6 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/15 backdrop-blur-xl transition-colors hover:border-white/40 hover:from-white/20 hover:to-white/10">
              Continuar para a Steam <ArrowUpRight className="size-4" />
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
