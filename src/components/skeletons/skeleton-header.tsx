import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonHeader() {
  return (
    <header className="flex items-center justify-between px-10 py-4 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        <Skeleton className="h-4 w-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
          <Skeleton className="h-4 w-4 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-8 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
          <Skeleton className="h-4 w-4 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-8 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
          <Skeleton className="h-4 w-4 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
          <Skeleton className="h-3 w-3 rounded bg-gradient-to-br from-gray-700 to-gray-800" />
        </div>
      </div>
    </header>
  );
} 