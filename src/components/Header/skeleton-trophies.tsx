import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTrophies() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-6 rounded-md" />
      ))}
    </div>
  );
}
