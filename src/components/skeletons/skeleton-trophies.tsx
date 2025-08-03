import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTrophies() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="flex items-end gap-2">
        <Skeleton className="size-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
        <Skeleton className="h-4 w-4 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
      </div>
      <div className="flex items-end gap-2">
        <Skeleton className="h-6 w-8 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        <Skeleton className="h-4 w-4 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
      </div>
      <div className="flex items-end gap-2">
        <Skeleton className="h-6 w-8 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        <Skeleton className="h-4 w-4 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
      </div>
    </div>
  );
}
