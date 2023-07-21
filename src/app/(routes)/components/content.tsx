import { Menu } from "@/components/Menu";
import { CardGame } from "./card-game";

export function Content() {
  return (
    <section className="mt-12 flex flex-col mx-auto max-w-screen-2xl">
      <h1 className="text-white font-medium text-4xl mb-4">Games</h1>
      <div className="flex w-full items-center justify-between">
        <Menu />
      </div>
      <CardGame />
    </section>
  );
}
