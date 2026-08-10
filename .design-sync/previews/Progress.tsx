import { Progress } from "tanstack_start_ts";

export const Levels = () => (
  <div className="grid w-full max-w-sm gap-4">
    <Progress value={12} />
    <Progress value={48} />
    <Progress value={86} />
    <Progress value={100} />
  </div>
);

export const WithLabel = () => (
  <div className="grid w-full max-w-sm gap-2">
    <div className="flex items-baseline justify-between">
      <span className="text-sm font-medium">Lektion „Begrüßungen“</span>
      <span className="text-xs text-muted-foreground">17 / 24</span>
    </div>
    <Progress value={71} />
  </div>
);

export const SessionStack = () => (
  <div className="grid w-full max-w-sm gap-4 rounded-xl border border-border bg-card p-4">
    {[
      ["Begrüßungen", 100],
      ["Zahlen 1–20", 64],
      ["Nomenklassen", 20],
    ].map(([label, value]) => (
      <div key={label as string} className="grid gap-1.5">
        <span className="text-xs text-muted-foreground">{label as string}</span>
        <Progress value={value as number} />
      </div>
    ))}
  </div>
);
