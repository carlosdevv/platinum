import Footer from "@/components/footer";
import { Header } from "@/components/header";
import { HomeContent } from "@/components/home-content";
import { AddGameModal } from "@/components/modals/add-game-modal";
import { SearchGameModal } from "@/components/modals/search-game-modal";

export default function Home() {
  return (
    <>
      <AddGameModal />
      <SearchGameModal />
      <main className="w-screen h-screen flex flex-col bg-gradient-to-r from-[#0F2027] to-[#10101E] relative overflow-hidden">
        <Header />
        <div className="flex-1 overflow-hidden">
          <HomeContent />
        </div>
        <Footer />
      </main>
    </>
  );
}
