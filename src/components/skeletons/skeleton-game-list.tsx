import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonGameList() {
  return (
    <div className="flex items-center gap-8">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="size-64 rounded-2xl" />
      ))}
    </div>
  );
}
