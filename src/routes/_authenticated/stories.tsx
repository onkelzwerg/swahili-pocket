import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Check, Lock, Sparkles } from "lucide-react";
import { getVocab } from "@/lib/store";
import { buildStoryList, getStoriesRead, loadStoryIndex, type StoryListItem } from "@/lib/stories";
import { PoolPickerSheet } from "@/components/PoolPickerSheet";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/stories")({
  head: () => ({
    meta: [
      { title: T.stories.metaTitle },
      { name: "description", content: T.stories.metaDescription },
    ],
  }),
  component: StoriesPage,
});

/**
 * Geschichten-Liste (W3.3).
 *
 * Die Kernschleife der Welle: eine gesperrte Geschichte nennt die genaue Zahl
 * fehlender Wörter und führt mit einem Tipp zu genau diesen Wörtern. Wortschatz
 * lernen schaltet Inhalte frei — das ist der Grund, weiterzumachen, und er
 * steht bewusst nicht in Prozentpunkten allein da.
 */
function StoriesPage() {
  const [items, setItems] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState<string[] | null>(null);

  const load = useCallback(() => {
    void (async () => {
      const [index, vocab, read] = await Promise.all([
        loadStoryIndex(),
        getVocab(),
        getStoriesRead(),
      ]);
      setItems(buildStoryList(index, vocab, read));
      setLoading(false);
    })();
  }, []);

  useEffect(load, [load]);

  return (
    <div className="px-5 pt-8">
      <header className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">{T.stories.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.stories.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{T.stories.intro}</p>
      </header>

      {!loading && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          {T.stories.empty}
        </p>
      )}

      <ul className="flex flex-col gap-3 pb-4">
        {items.map((item) => (
          <li key={item.meta.id}>
            <StoryCard item={item} onLearnMissing={() => setMissing(item.cov.unknown)} />
          </li>
        ))}
      </ul>

      <PoolPickerSheet
        open={missing !== null}
        preselect={missing ?? undefined}
        onClose={() => setMissing(null)}
        onSaved={load}
      />
    </div>
  );
}

function StoryCard({ item, onLearnMissing }: { item: StoryListItem; onLearnMissing: () => void }) {
  const { meta, cov, unlocked, readAt } = item;
  const percent = Math.floor(cov.ratio * 100);

  if (!unlocked) {
    return (
      <div className="rounded-3xl border border-border bg-muted/40 p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl opacity-30 grayscale" aria-hidden>
            {meta.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold leading-tight text-muted-foreground">
              {meta.title}
            </h2>
            <p className="text-xs text-muted-foreground">{meta.titleDe}</p>
          </div>
          <Lock
            className="h-4 w-4 shrink-0 text-muted-foreground/60"
            aria-label={T.stories.lockedAria}
          />
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-muted-foreground/40"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {T.stories.coverage(percent)} · {T.stories.lockedProgress(cov.unknown.length)}
        </p>

        <button
          onClick={onLearnMissing}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" /> {T.stories.learnMissing}
        </button>
      </div>
    );
  }

  // Freigeschaltet: grün ab 98 %, sonst gelb — die Farbe sagt, wie flüssig
  // sich der Text lesen wird (Hu & Nation 2000).
  const comfortable = percent >= 98;
  const tone = comfortable
    ? "border-forest/40 bg-forest/10 text-forest"
    : "border-ochre/40 bg-ochre/10 text-ochre-foreground";

  return (
    <Link to="/stories/$storyId" params={{ storyId: meta.id }}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`rounded-3xl border border-border bg-card p-4 ${readAt ? "opacity-70" : ""}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden>
            {meta.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold leading-tight">{meta.title}</h2>
            <p className="text-xs text-muted-foreground">{meta.titleDe}</p>
          </div>
          {readAt && (
            <span className="inline-flex items-center gap-1 rounded-full bg-forest/15 px-2 py-1 text-[10px] font-semibold text-forest">
              <Check className="h-3 w-3" /> {T.stories.readBadge}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
            {T.stories.coverage(percent)} · {T.stories.newWords(cov.unknown.length)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <BookOpen className="h-3 w-3" /> {T.stories.words(meta.wordCount)} ·{" "}
            {T.stories.band(meta.band)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
