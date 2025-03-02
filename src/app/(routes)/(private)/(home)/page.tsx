import { Header } from "@/components/header";
import { HomeContent } from "@/components/home-content";
import { UserNameModal } from "@/components/modals/username-modal";
export default function Home() {
  return (
    <>
      <UserNameModal />
      <main className="w-screen h-screen flex-col bg-gradient-to-r from-[#0F2027] to-[#10101E]">
        <Header />
        <HomeContent />
      </main>
    </>
  );
}
