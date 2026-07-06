import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { getVocab, deleteVocab } from "@/lib/store";
import { isMonosyllabicVerb } from "@/lib/seed";
import { SpeakButton } from "@/components/SpeakButton";
import { T } from "@/config/translations";
import type { NounClass, PartOfSpeech, VocabEntry } from "@/lib/types";

const POS: (PartOfSpeech | "alle")[] = ["alle", "noun", "verb", "adjective", "adverb", "other"];
const CLASSES: (NounClass | "alle")[] = [
  "alle",
  "M-Wa",
  "M-Mi",
  "Ki-Vi",
  "N",
  "Ji-Ma",
  "U",
  "Pa-Ku-Mu",
  "Ku",
];
const BOXES: ("alle" | 1 | 2 | 3 | 4 | 5)[] = ["alle", 1, 2, 3, 4, 5];
const SOURCES: ("alle" | "pool" | "eigene")[] = ["alle", "pool", "eigene"];

export function CardsTab() {
  const [list, setList] = useState<VocabEntry[]>([]);
  const [q, setQ] = useState("");
  const [pos, setPos] = useState<PartOfSpeech | "alle">("alle");
  const [cls, setCls] = useState<NounClass | "alle">("alle");
  const [box, setBox] = useState<"alle" | 1 | 2 | 3 | 4 | 5>("alle");
  const [source, setSource] = useState<"alle" | "pool" | "eigene">("alle");

  useEffect(() => {
    getVocab().then(setList);
  }, []);

  const filtered = useMemo(() => {
    return list.filter((e) => {
      if (q && !`${e.swahili} ${e.german}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (pos !== "alle" && e.partOfSpeech !== pos) return false;
      if (cls !== "alle" && e.nounClass !== cls) return false;
      if (box !== "alle" && e.box !== box) return false;
      if (source === "eigene" && !e.isPrivate) return false;
      if (source === "pool" && e.isPrivate) return false;
      return true;
    });
  }, [list, q, pos, cls, box, source]);

  const boxCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    for (const e of list) if (e.box >= 1 && e.box <= 5) counts[e.box as 1 | 2 | 3 | 4 | 5]++;
    return counts;
  }, [list]);

  async function handleDelete(id: string) {
    await deleteVocab(id);
    setList((l) => l.filter((e) => e.id !== id));
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T.lexicon.cards.searchPlaceholder}
          className="w-full rounded-full border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <FilterRow>
        {POS.map((p) => (
          <Chip key={p} active={pos === p} onClick={() => setPos(p)}>
            {p === "alle" ? T.lexicon.filters.allPos : p}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow>
        {CLASSES.map((c) => (
          <Chip key={c} active={cls === c} onClick={() => setCls(c)} variant="ochre">
            {c === "alle" ? T.lexicon.filters.allNgeli : c}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow>
        {BOXES.map((b) => (
          <Chip key={b} active={box === b} onClick={() => setBox(b)} variant="forest">
            {b === "alle" ? T.lexicon.filters.allBoxes : T.lexicon.filters.box(b, boxCounts[b])}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow>
        {SOURCES.map((s) => (
          <Chip key={s} active={source === s} onClick={() => setSource(s)} variant="ochre">
            {s === "alle"
              ? T.lexicon.filters.allSources
              : s === "pool"
                ? T.lexicon.filters.pool
                : T.lexicon.filters.own}
          </Chip>
        ))}
      </FilterRow>

      <p className="mb-3 text-xs font-medium text-muted-foreground">
        {T.lexicon.cards.count(filtered.length)}
      </p>

      <ul className="flex flex-col gap-3">
        {filtered.map((e) => (
          <li key={e.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-semibold">{e.swahili}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {T.lexicon.cards.boxBadge(e.box)}
                  </span>
                  {e.box < 5 &&
                    (() => {
                      const days = Math.ceil((e.nextReview - Date.now()) / 86_400_000);
                      const isDue = days <= 0;
                      const label = isDue
                        ? T.lexicon.cards.dueNow
                        : days === 1
                          ? T.lexicon.cards.dueTomorrow
                          : T.lexicon.cards.dueInDays(days);
                      const cls = isDue
                        ? "bg-destructive/10 text-destructive"
                        : "bg-secondary text-secondary-foreground";
                      return (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
                        >
                          {label}
                        </span>
                      );
                    })()}
                  {e.isPrivate && (
                    <span className="rounded-full bg-ochre px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ochre-foreground">
                      {T.lexicon.cards.ownBadge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{e.german}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                    {e.partOfSpeech}
                  </span>
                  {e.nounClass && (
                    <span className="rounded-full bg-ochre/30 px-2 py-0.5 text-[11px] font-medium text-ochre-foreground">
                      {e.nounClass}
                    </span>
                  )}
                  {e.partOfSpeech === "verb" && isMonosyllabicVerb(e.swahili) && (
                    <span className="rounded-full bg-forest/20 px-2 py-0.5 text-[11px] font-semibold text-forest">
                      {T.lexicon.cards.monosyllabic}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <SpeakButton text={e.swahili} size="sm" />
                <button
                  onClick={() => handleDelete(e.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={T.lexicon.cards.deleteAria}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {e.examples?.[0] && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {e.examples.map((ex, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{ex.sw}</p>
                      <p className="text-xs text-muted-foreground">{ex.de}</p>
                    </div>
                    <SpeakButton text={ex.sw} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {T.lexicon.cards.empty}
          </li>
        )}
      </ul>
    </div>
  );
}

function FilterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  variant?: "primary" | "ochre" | "forest";
}) {
  const activeCls =
    variant === "ochre"
      ? "bg-ochre text-ochre-foreground"
      : variant === "forest"
        ? "bg-forest text-background"
        : "bg-primary text-primary-foreground";
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? `${activeCls} border-transparent` : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
