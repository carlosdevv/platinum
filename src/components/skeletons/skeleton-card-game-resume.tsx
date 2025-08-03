import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCardGameResume() {
  return (
    <div className="flex flex-col mt-10 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="size-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
        <Skeleton className="h-12 w-96 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800" />
        <Skeleton className="h-6 w-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-800" />
      </div>
      <div className="mt-8 flex items-center gap-16">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
          <Skeleton className="h-8 w-48 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        </div>
      </div>
    </div>
  );
}
