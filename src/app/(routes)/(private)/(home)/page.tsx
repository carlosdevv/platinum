import { CardGame } from "@/components/card-game";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HomeContent } from "@/components/home-content";
import { AddGameModal } from "@/components/modals/add-game-modal";
import { RemoveGameModal } from "@/components/modals/remove-game-modal";
import { SearchGameModal } from "@/components/modals/search-game-modal";
import { UpdateGameModal } from "@/components/modals/update-game-modal";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddGameModal />
      <RemoveGameModal />
      <UpdateGameModal />
      <SearchGameModal />
      <main className="w-screen h-screen flex flex-col ps5-gradient relative overflow-hidden">
        {/* Floating orbs for enhanced atmosphere */}
        <div className="floating-orbs" />
        
        {/* Main content container */}
        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <div className="flex-1 overflow-hidden px-8 pb-8">
            <HomeContent />
            <CardGame />
          </div>
          <Footer />
        </div>
      </main>
    </Suspense>
  );
}
