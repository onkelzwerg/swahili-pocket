import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { listPool, addPoolEntryToCards, type PoolListItem } from "@/lib/pool";
import { SpeakButton } from "@/components/SpeakButton";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";
import type { NounClass, PartOfSpeech } from "@/lib/types";

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
const PAGE = 50;

export function PoolTab() {
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [pos, setPos] = useState<PartOfSpeech | "alle">("alle");
  const [cls, setCls] = useState<NounClass | "alle">("alle");
  const [limit, setLimit] = useState(PAGE);
  const [localAdded, setLocalAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setLimit(PAGE);
  }, [debouncedQ, pos, cls]);

  const filters = useMemo(
    () => ({
      query: debouncedQ || undefined,
      partOfSpeech: pos === "alle" ? undefined : pos,
      nounClass: cls === "alle" ? undefined : cls,
    }),
    [debouncedQ, pos, cls],
  );

  const query = useQuery({
    queryKey: ["pool-vocab", filters],
    queryFn: () => listPool(filters),
  });

  const addMut = useMutation({
    mutationFn: (entry: PoolListItem) => addPoolEntryToCards(entry),
    onSuccess: (res, entry) => {
      if (res.added) {
        toast.success(T.lexicon.pool.addedToast);
        setLocalAdded((s) => new Set(s).add(entry.poolKey));
        qc.invalidateQueries({ queryKey: ["pool-vocab"] });
      } else {
        toast.info(T.lexicon.pool.alreadyInCards);
        setLocalAdded((s) => new Set(s).add(entry.poolKey));
      }
    },
    onError: (e: Error) => toast.error(T.lexicon.pool.addError, { description: e.message }),
  });

  const allItems = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const items = allItems.slice(0, limit);
  const hasMore = items.length < total;

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T.lexicon.pool.searchPlaceholder(
            APP_CONFIG.targetLanguage,
            APP_CONFIG.nativeLanguage,
          )}
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

      <p className="mb-3 text-xs font-medium text-muted-foreground">
        {query.isLoading ? T.common.loadingShort : T.lexicon.pool.totalInPool(total)}
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((e) => {
          const owned = e.inMyCards || localAdded.has(e.poolKey);
          const isAdding = addMut.isPending && addMut.variables?.poolKey === e.poolKey;
          return (
            <li key={e.poolKey} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-semibold">{e.swahili}</h3>
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
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SpeakButton text={e.swahili} size="sm" />
                  <button
                    onClick={() => !owned && addMut.mutate(e)}
                    disabled={owned || isAdding}
                    className={`inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors ${
                      owned
                        ? "bg-forest/15 text-forest"
                        : "bg-primary text-primary-foreground active:scale-95"
                    } disabled:opacity-70`}
                    aria-label={
                      owned ? T.lexicon.pool.alreadyInCardsAria : T.lexicon.pool.addToCardsAria
                    }
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : owned ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {owned ? T.lexicon.pool.inCards : T.lexicon.pool.addAsCard}
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
          );
        })}
        {!query.isLoading && items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {T.lexicon.pool.empty}
          </li>
        )}
      </ul>

      {hasMore && (
        <button
          onClick={() => setLimit((l) => l + PAGE)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold"
        >
          {T.lexicon.pool.loadMore(items.length, total)}
        </button>
      )}
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
  variant?: "primary" | "ochre";
}) {
  const activeCls =
    variant === "ochre" ? "bg-ochre text-ochre-foreground" : "bg-primary text-primary-foreground";
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
