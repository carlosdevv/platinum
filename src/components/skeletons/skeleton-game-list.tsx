import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonGameList() {
  return (
    <div className="flex gap-4 overflow-hidden px-8 py-5 sm:px-10">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton
          key={index}
          className="console-game-art shrink-0 rounded-[14px] bg-white/10"
        />
      ))}
    </div>
  );
}
