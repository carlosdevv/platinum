import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCardGameResume() {
  return (
    <div aria-hidden="true" className="flex max-w-2xl flex-col gap-4 py-2">
      <div className="flex flex-wrap items-center gap-4">
        <Skeleton className="size-6 rounded-full bg-white/10" />
        <Skeleton className="h-8 w-14 rounded-md bg-white/10" />
        <Skeleton className="h-7 w-24 rounded-md bg-white/10" />
        <Skeleton className="h-7 w-20 rounded-md bg-white/10" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="h-4 w-36 bg-white/10" />
        </div>
      </div>
      <div className="w-full max-w-md space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 bg-white/10" />
          <Skeleton className="h-4 w-24 bg-white/10" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full bg-white/10" />
        <Skeleton className="h-3 w-64 max-w-full bg-white/10" />
      </div>
    </div>
  );
}
