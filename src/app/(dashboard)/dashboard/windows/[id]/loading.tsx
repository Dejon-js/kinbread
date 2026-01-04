import { Skeleton } from "@/components/ui/skeleton";

export default function WindowDetailLoading() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Skeleton className="h-6 w-24 mb-6" />
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
