import { Separator } from "tanstack_start_ts";

export const Horizontal = () => (
  <div className="w-full max-w-sm">
    <div className="space-y-1">
      <h4 className="font-display text-sm font-semibold">Msamiati</h4>
      <p className="text-sm text-muted-foreground">Dein Wortschatz auf einen Blick.</p>
    </div>
    <Separator className="my-4" />
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>Pool</span>
      <Separator orientation="vertical" />
      <span>Fällig</span>
      <Separator orientation="vertical" />
      <span>Gemeistert</span>
    </div>
  </div>
);

export const InList = () => (
  <div className="w-full max-w-sm rounded-xl border border-border bg-card">
    {["Begrüßungen", "Zahlen 1–20", "Nomenklassen"].map((label, i, a) => (
      <div key={label}>
        <div className="px-4 py-3 text-sm">{label}</div>
        {i < a.length - 1 && <Separator />}
      </div>
    ))}
  </div>
);
