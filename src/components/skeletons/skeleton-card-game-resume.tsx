import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCardGameResume() {
  return (
    <div className="flex items-center gap-5 py-2">
      <Skeleton className="size-6 rounded-full bg-white/10" />
      <Skeleton className="h-8 w-12 rounded-md bg-white/10" />
      <Skeleton className="h-8 w-40 rounded-md bg-white/10" />
    </div>
  );
}
