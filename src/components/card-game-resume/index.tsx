import { platinumTrophy } from "@/components/icons";
import { FetchPsnGamesResponse } from "@/services/game/types";
import Image from "next/image";

type CardGameResumeProps = Pick<
  FetchPsnGamesResponse,
  | "name"
  | "progress"
  | "totalTrophies"
  | "earnedTrophies"
  | "lastPlayed"
  | "hasPlatinum"
>;

export function CardGameResume({
  name,
  progress,
  totalTrophies,
  earnedTrophies,
  lastPlayed,
  hasPlatinum,
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
        {hasPlatinum && (
          <Image src={platinumTrophy} alt="trophy" width={32} height={32} />
        )}
        <h1 className="text-5xl font-light text-white">{name}</h1>
      </div>
      <div className="mt-8 grid-cols-3 w-auto gap-16 flex items-center">
        <div className="flex flex-col gap-2">
          <span className="text-slate-300 text-xs">Last played</span>
          <span className="text-white text-2xl">
            {convertTimePlayed(lastPlayed)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-slate-300 text-xs">Progress</span>
          <span className="text-white text-4xl">{progress || 0}%</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-slate-300 text-xs">Trophies</span>
          <span className="text-white text-4xl">
            {earnedTrophies || 0}/{totalTrophies || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
