import { Header } from "@/components/Header";
import { Content } from "./components/content";
import { UserNameModal } from "./components/username-modal";

export default function Home() {
  return (
    <>
      <UserNameModal />
      <main className="w-screen h-screen flex-col bg-gradient-to-r from-[#0F2027] to-[#10101E]">
        <Header />
        <Content />
      </main>
    </>
  );
}
