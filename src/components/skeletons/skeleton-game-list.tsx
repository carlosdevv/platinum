import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonGameList() {
  return (
    <div className="flex items-center gap-8 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="relative">
          <Skeleton className="w-48 h-48 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-transparent to-black/20" />
        </div>
      ))}
    </div>
  );
}
