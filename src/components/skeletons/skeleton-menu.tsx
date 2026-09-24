import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonMenu() {
  return (
    <div className="console-filter-bar inline-flex items-center gap-2 rounded-2xl p-1.5">
      <Skeleton className="h-10 w-11 rounded-xl bg-white/10" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-16 rounded-xl bg-white/10 sm:w-20" />
      ))}
      <Skeleton className="h-10 w-11 rounded-xl bg-white/10" />
    </div>
  );
}
