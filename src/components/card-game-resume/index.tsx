import { platinumTrophy } from "@/components/icons";
import Image from "next/image";

type CardGameResumeProps = {
  name?: string;
  lastPlayed?: number;
  platform?: string;
};

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

  if (!name) return null;

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Game Title */}
      <h1 className="text-white text-4xl font-light tracking-wide ps5-text-glow">
        {name}
      </h1>
      
      {/* Game Details */}
      <div className="flex items-center gap-6">
        {/* Trophy Icon */}
        <div className="flex items-center gap-2">
          <Image 
            src={platinumTrophy} 
            alt="trophy" 
            width={20} 
            height={20} 
            className="opacity-80"
          />
        </div>
        
        {/* Platform Badge */}
        <div className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-white text-sm font-medium">
            {platform?.includes("Steam") || platform === "PC" ? "PC" : "PS5"}
          </span>
        </div>
        
        {/* Last Played */}
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">
            Last played
          </span>
          <span className="text-white text-sm font-light">
            {lastPlayed ? convertTimePlayed(lastPlayed) : "Never"}
          </span>
        </div>

      </div>
    </div>
  );
}

