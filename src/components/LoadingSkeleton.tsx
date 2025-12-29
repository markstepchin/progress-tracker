export function CheckInListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 rounded bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-100" />
            </div>
            <div className="flex gap-2">
              <div className="h-16 w-16 rounded-lg bg-zinc-200" />
              <div className="h-16 w-16 rounded-lg bg-zinc-200" />
              <div className="h-16 w-16 rounded-lg bg-zinc-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckInDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded bg-zinc-200" />
        <div className="h-5 w-24 rounded bg-zinc-100" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="aspect-[4/5] rounded-lg bg-zinc-200" />
        <div className="aspect-[4/5] rounded-lg bg-zinc-200" />
        <div className="aspect-[4/5] rounded-lg bg-zinc-200" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-zinc-100" />
        <div className="h-4 w-3/4 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-4">
        <div className="h-10 flex-1 rounded-lg bg-zinc-200" />
        <div className="h-10 flex-1 rounded-lg bg-zinc-200" />
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 h-5 w-32 rounded bg-zinc-200" />
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-[4/5] rounded-lg bg-zinc-100" />
            <div className="aspect-[4/5] rounded-lg bg-zinc-100" />
            <div className="aspect-[4/5] rounded-lg bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
