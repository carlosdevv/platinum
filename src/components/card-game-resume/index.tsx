import { platinumTrophy } from "@/components/icons";
import Image from "next/image";

type CardGameResumeProps = {
  name?: string;
  lastPlayed?: number;
  platform?: string;
  showTitle?: boolean;
  hasPlatinum?: boolean;
  progress?: number | null;
  earnedAchievements?: number | null;
  totalAchievements?: number | null;
  lastAchievementName?: string | null;
  lastAchievementAt?: number;
  achievementStatus?: string;
  source?: string;
  status?: string;
  tags?: Array<{ tag: { id: string; name: string } }>;
};

export function CardGameResume({
  name,
  lastPlayed,
  platform,
  showTitle = true,
  hasPlatinum = false,
  progress,
  earnedAchievements,
  totalAchievements,
  lastAchievementName,
  lastAchievementAt,
  achievementStatus,
  source,
  status = "completed",
  tags = [],
}: CardGameResumeProps) {
  function convertTimePlayed(time: number) {
    const date = new Date(time);

    const dateFormated = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "numeric",
    }).format(date);

    return dateFormated;
  }

  if (!name) return null;

  return (
    <div className="flex flex-col gap-4 py-2">
      {showTitle && (
        <h2 className="text-3xl font-light tracking-wide text-white ps5-text-glow">
          {name}
        </h2>
      )}
      
      {/* Game Details */}
      <div className="flex flex-wrap items-center gap-5 text-white/80">
        {hasPlatinum && <div className="flex items-center gap-2">
          <Image 
            src={platinumTrophy} 
            alt="trophy" 
            width={20} 
            height={20} 
            className="opacity-80"
          />
        </div>}
        
        {/* Platform Badge */}
        <div className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-white text-sm font-medium">
            {platform?.includes("Steam") || platform === "PC" ? "PC" : platform || "Console"}
          </span>
        </div>
        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">
          {status === "playing" ? "Jogando" : status === "not_started" ? "Não iniciado" : "Concluído"}
        </span>
        {tags.map(({ tag }) => <span key={tag.id} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">{tag.name}</span>)}
        
        {/* Last Played */}
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">
            Última vez jogado
          </span>
          <span className="text-white text-sm font-light">
            {lastPlayed ? convertTimePlayed(lastPlayed) : "Não informado"}
          </span>
        </div>

      </div>
      {source === "steam" && (
        <div className="w-full max-w-md space-y-2 text-sm text-white/80">
          {achievementStatus === "ready" && progress !== null && progress !== undefined ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <span>Conquistas</span>
                <span className="tabular-nums">{earnedAchievements ?? 0}/{totalAchievements ?? 0} · {progress}%</span>
              </div>
              <div role="progressbar" aria-label="Progresso das conquistas" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-white/80" style={{ width: `${progress}%` }} />
              </div>
              {lastAchievementName && <p className="text-xs text-white/60">Última conquista: {lastAchievementName}{lastAchievementAt ? ` · ${convertTimePlayed(lastAchievementAt)}` : ""}</p>}
            </>
          ) : (
            <p className="text-xs text-white/60">
              {achievementStatus === "pending" ? "Conquistas ainda não sincronizadas" :
                achievementStatus === "private" ? "Conquistas indisponíveis. Confira a privacidade dos detalhes dos jogos na Steam." :
                achievementStatus === "unavailable" ? "Este jogo não tem conquistas disponíveis na Steam." :
                "Não foi possível atualizar as conquistas agora."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
