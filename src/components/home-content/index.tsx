import { CardGame } from "@/components/card-game";
import { Menu } from "@/components/menu";

export function HomeContent() {
  return (
    <section className="mt-12 flex flex-col mx-auto max-w-screen-2xl px-4">
      <h1 className="text-white font-medium text-4xl mb-4">Games</h1>
      <div className="flex w-full items-center justify-between">
        <Menu />
      </div>
      <CardGame />
    </section>
  );
}
