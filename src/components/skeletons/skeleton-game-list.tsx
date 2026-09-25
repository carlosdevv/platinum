import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonGameList() {
  return (
    <div className="flex gap-4 overflow-hidden py-5">
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton
          key={index}
          data-selected={index === 0}
          className="console-game-art shrink-0 rounded-[14px] bg-white/10"
        />
      ))}
    </div>
  );
}
