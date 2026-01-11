'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
  );
}

export function ModelPanelSkeleton() {
  return (
    <div className="bg-gray-900/80 rounded-xl border border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16 ml-auto" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function JudgePanelSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-8 h-8" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <div className="pl-4 space-y-1">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
