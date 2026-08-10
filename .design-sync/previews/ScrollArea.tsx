import { ScrollArea, Separator } from "tanstack_start_ts";

const words = [
  ["rafiki", "Freund"],
  ["kitabu", "Buch"],
  ["mtoto", "Kind"],
  ["chakula", "Essen"],
  ["safari", "Reise"],
  ["nyumba", "Haus"],
  ["maji", "Wasser"],
  ["jua", "Sonne"],
  ["mvua", "Regen"],
  ["barabara", "Straße"],
];

export const VocabList = () => (
  <ScrollArea className="h-56 w-full max-w-sm rounded-xl border border-border bg-card">
    <div className="p-4">
      <h4 className="mb-3 font-display text-sm font-semibold">Msamiati wote</h4>
      {words.map(([sw, de], i) => (
        <div key={sw}>
          <div className="flex items-baseline justify-between py-2 text-sm">
            <span className="font-medium">{sw}</span>
            <span className="text-muted-foreground">{de}</span>
          </div>
          {i < words.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  </ScrollArea>
);

export const Horizontal = () => (
  <ScrollArea className="w-full max-w-sm whitespace-nowrap rounded-xl border border-border bg-card">
    <div className="flex gap-3 p-4">
      {["Begrüßungen", "Zahlen 1–20", "Nomenklassen", "Reisen", "Essen"].map((t) => (
        <div
          key={t}
          className="shrink-0 rounded-lg bg-secondary px-4 py-6 text-sm text-secondary-foreground"
        >
          {t}
        </div>
      ))}
    </div>
  </ScrollArea>
);
