import Skeleton from "@/components/Skeleton";

export default function BookGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col h-full">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
