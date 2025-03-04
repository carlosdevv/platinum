import { platinumTrophy } from "@/components/icons";
import { FetchPsnGamesResponse } from "@/services/game/types";
import Image from "next/image";

type CardGameResumeProps = Pick<
  FetchPsnGamesResponse,
  "name" | "lastPlayed" | "platform"
>;

export function CardGameResume({
  name,
  lastPlayed,
  platform,
}: CardGameResumeProps) {
  function convertTimePlayed(time: number) {
    const date = new Date(time);

    const dateFormated = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
    }).format(date);

    return dateFormated;
  }

  return (
    <div className="flex flex-col mt-10">
      <div className="flex items-center gap-4">
        <Image src={platinumTrophy} alt="trophy" width={32} height={32} />
        <h1 className="text-5xl font-light text-white">{name}</h1>
        <span className="bg-white text-background text-sm font-semibold rounded-md px-2 py-0.5">
          {platform.includes("Steam") || platform === "PC" ? "PC" : "PS5"}
        </span>
      </div>
      <div className="mt-8 grid-cols-3 w-auto gap-16 flex items-center">
        <div className="flex flex-col gap-2">
          <span className="text-slate-300 text-xs">Last played</span>
          <span className="text-white text-2xl">
            {convertTimePlayed(lastPlayed)}
          </span>
        </div>
      </div>
    </div>
  );
}
