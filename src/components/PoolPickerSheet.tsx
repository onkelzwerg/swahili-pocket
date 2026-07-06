import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { pickFromPool, addPoolEntryToCards, getTopTopics, type PoolEntry } from "@/lib/pool";
import { BottomSheet } from "@/components/BottomSheet";
import { T } from "@/config/translations";

/**
 * Lernkarten gezielt aus dem Pool ziehen: Anzahl per Slider (5–20),
 * Bereich als Freitext (Thema, Suchwort oder Nomenklasse) oder Themen-Chip.
 */
export function PoolPickerSheet({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [topics, setTopics] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<PoolEntry[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) void getTopTopics(10).then(setTopics);
  }, [open]);

  function reset() {
    setSuggestions([]);
    setSelected(new Set());
    setSearched(false);
  }

  function handleClose() {
    reset();
    setTopic("");
    onClose();
  }

  async function generate() {
    setBusy(true);
    try {
      const items = await pickFromPool({ query: topic, count });
      setSuggestions(items);
      setSelected(new Set(items.map((_, i) => i)));
      setSearched(true);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const items = suggestions.filter((_, i) => selected.has(i));
    if (items.length === 0) {
      toast.error(T.poolPicker.toasts.noneSelected);
      return;
    }
    setBusy(true);
    try {
      let added = 0;
      for (const item of items) {
        const res = await addPoolEntryToCards(item);
        if (res.added) added++;
      }
      toast.success(T.poolPicker.toasts.saved(added));
      handleClose();
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  function toggle(i: number) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }

  const footer =
    suggestions.length > 0 ? (
      <>
        <button
          onClick={reset}
          className="rounded-full border border-border bg-card py-3 text-sm font-semibold"
        >
          {T.poolPicker.discard}
        </button>
        <button
          disabled={busy || selected.size === 0}
          onClick={() => void save()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {T.poolPicker.saveCount(selected.size)}
        </button>
      </>
    ) : undefined;

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      eyebrow={T.poolPicker.eyebrow}
      title={T.poolPicker.title}
      footer={footer}
    >
      {suggestions.length === 0 ? (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">
              {T.poolPicker.topicLabel}
            </span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={T.poolPicker.topicPlaceholder}
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(topic === t ? "" : t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    topic === t
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">
              {T.poolPicker.count(count)}
            </span>
            <input
              type="range"
              min={5}
              max={20}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </label>

          {searched && (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              {T.poolPicker.empty}
            </p>
          )}

          <button
            disabled={busy}
            onClick={() => void generate()}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {T.poolPicker.loadCta}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {T.poolPicker.selectionHint(selected.size, suggestions.length)}
          </p>
          <ul className="flex flex-col gap-2">
            {suggestions.map((s, i) => {
              const on = selected.has(i);
              return (
                <li key={s.swahili}>
                  <button
                    onClick={() => toggle(i)}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                      on ? "border-primary bg-primary/5" : "border-border bg-card opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base font-semibold">{s.swahili}</h3>
                        <p className="text-xs text-muted-foreground">{s.german}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">
                          {s.partOfSpeech}
                        </span>
                        {s.nounClass && (
                          <span className="rounded-full bg-ochre/30 px-2 py-0.5 text-[10px] font-semibold text-ochre-foreground">
                            {s.nounClass}
                          </span>
                        )}
                      </div>
                    </div>
                    {s.examples[0] && (
                      <p className="mt-2 border-t border-border/60 pt-2 text-xs">
                        <span className="font-medium">{s.examples[0].sw}</span>
                        <span className="text-muted-foreground"> — {s.examples[0].de}</span>
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </BottomSheet>
  );
}
