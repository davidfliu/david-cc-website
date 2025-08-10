import React from 'react';

export function LoadingState() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-zinc-200 rounded-full w-20"></div>
            </div>
            <div className="h-3 bg-zinc-200 rounded w-full mb-3"></div>
            <div className="space-y-2 mb-5">
              <div className="h-3 bg-zinc-200 rounded w-full"></div>
              <div className="h-3 bg-zinc-200 rounded w-5/6"></div>
              <div className="h-3 bg-zinc-200 rounded w-4/5"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 bg-zinc-200 rounded-xl w-32"></div>
              <div className="h-10 bg-zinc-200 rounded-xl w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="animate-pulse grid gap-4 sm:grid-cols-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-zinc-200 rounded-full w-20"></div>
          </div>
          <div className="h-3 bg-zinc-200 rounded w-full mb-3"></div>
          <div className="space-y-2 mb-5">
            <div className="h-3 bg-zinc-200 rounded w-full"></div>
            <div className="h-3 bg-zinc-200 rounded w-5/6"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 bg-zinc-200 rounded-xl w-32"></div>
            <div className="h-10 bg-zinc-200 rounded-xl w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}