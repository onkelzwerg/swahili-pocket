import { Skeleton } from "tanstack_start_ts";

export const VocabRow = () => (
  <div className="grid w-full max-w-sm gap-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    ))}
  </div>
);

export const CardPlaceholder = () => (
  <div className="grid w-full max-w-sm gap-3 rounded-xl border border-border bg-card p-4">
    <Skeleton className="h-5 w-1/2" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <Skeleton className="h-9 w-full rounded-md" />
  </div>
);

export const Shapes = () => (
  <div className="flex items-end gap-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <Skeleton className="h-12 w-24 rounded-md" />
    <Skeleton className="h-3 w-32" />
  </div>
);
