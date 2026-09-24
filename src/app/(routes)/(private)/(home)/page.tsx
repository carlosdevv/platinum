import { CardGame } from "@/components/card-game";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HomeContent } from "@/components/home-content";
import { AddGameModal } from "@/components/modals/add-game-modal";
import { RemoveGameModal } from "@/components/modals/remove-game-modal";
import { SearchGameModal } from "@/components/modals/search-game-modal";
import { UpdateGameModal } from "@/components/modals/update-game-modal";
import { Floating3DParticles } from "@/components/ui/floating-3d-particles";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddGameModal />
      <RemoveGameModal />
      <UpdateGameModal />
      <SearchGameModal />
      <main className="console-stage relative flex min-h-dvh flex-col overflow-x-clip text-white">
        <div className="console-atmosphere" aria-hidden="true">
          <div className="console-atmosphere__beam" />
          <Floating3DParticles className="hidden md:block" quantity={50} color="#fff0d8" size={13} opacity={0.66} drift={0.14} depth={0.35} />
        </div>

        <TooltipProvider delayDuration={250}>
          <div className="relative z-10 flex min-h-dvh flex-col">
            <Header />
            <div className="flex w-full flex-1 flex-col px-4 pb-6 sm:px-8 lg:px-12">
              <HomeContent />
              <CardGame />
            </div>
            <Footer />
          </div>
        </TooltipProvider>
      </main>
    </Suspense>
  );
}
