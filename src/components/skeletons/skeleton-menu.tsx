import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonMenu() {
  return (
    <section className="flex items-center gap-12 animate-pulse">
      <Skeleton className="h-8 w-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-800" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton 
          key={index} 
          className="h-8 w-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" 
        />
      ))}
      <Skeleton className="h-8 w-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-800" />
    </section>
  );
} 