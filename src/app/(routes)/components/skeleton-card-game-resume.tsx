import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCardGameResume() {
  return (
    <div className="flex flex-col gap-8 max-w-full w-full mt-10">
      <Skeleton className="h-10 w-96 rounded-3xl" />
      <Skeleton className="h-10 w-96 rounded-3xl" />
    </div>
  );
}
