import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { getVocab } from "@/lib/store";
import { allDialogues, buildDialogueList, type DialogueListItem } from "@/lib/dialogues";
import { dialogueMetaById } from "@/lib/dialogue-index";
import { activePacks } from "@/lib/packs";
import { PoolPickerSheet } from "@/components/PoolPickerSheet";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/dialogues")({
  head: () => ({
    meta: [
      { title: T.dialogues.metaTitle },
      { name: "description", content: T.dialogues.metaDescription },
    ],
  }),
  component: DialoguesPage,
});

/**
 * Dialogliste. Seit W3.4 führt jede Kachel auf eine eigene Route statt in ein
 * Overlay — Dialoge sind damit verlinkbar (Bibliothek, Lesezeichen, Zurück-Taste).
 *
 * Seit W4.13 blendet sie Dialoge aus, deren Themenpaket nicht eingeschaltet
 * ist. Nicht gesperrt, sondern gar nicht: ihre Wörter liegen außerhalb des
 * aktiven Wortschatzes, sie könnten die Freischaltschwelle also nie erreichen.
 *
 * Seit W4.4 gilt für den Rest dieselbe Kernschleife wie bei den Geschichten:
 * freigeschaltet ist, was man zu 95 % versteht, und eine gesperrte Kachel nennt
 * die genaue Zahl fehlender Wörter und führt mit einem Tipp zu genau diesen.
 */
function DialoguesPage() {
  const [items, setItems] = useState<DialogueListItem[] | null>(null);
  const [missing, setMissing] = useState<string[] | null>(null);

  const load = useCallback(() => {
    void (async () => {
      const [byId, vocab, packs] = await Promise.all([
        dialogueMetaById(),
        getVocab(),
        activePacks(),
      ]);
      setItems(buildDialogueList(allDialogues, byId, vocab, packs));
    })();
  }, []);

  useEffect(load, [load]);

  return (
    <div className="px-5 pt-8">
      <header className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">{T.dialogues.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.dialogues.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{T.dialogues.intro}</p>
      </header>

      <ul className="grid grid-cols-2 gap-3 pb-4">
        {(items ?? []).map((item) => (
          <li key={item.dialogue.id}>
            <DialogueCard item={item} onLearnMissing={() => setMissing(item.cov.unknown)} />
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

function DialogueCard({
  item,
  onLearnMissing,
}: {
  item: DialogueListItem;
  onLearnMissing: () => void;
}) {
  const { dialogue, cov, unlocked, playable } = item;
  const percent = Math.floor(cov.ratio * 100);

  if (!unlocked) {
    return (
      <div className="flex h-full w-full flex-col items-start gap-2 rounded-2xl border border-border bg-muted/40 p-4 text-left">
        <div className="flex w-full items-start justify-between gap-2">
          <span className="text-3xl opacity-30 grayscale" aria-hidden>
            {dialogue.emoji}
          </span>
          <Lock
            className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
            aria-label={T.coverage.lockedAria}
          />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold leading-tight text-muted-foreground">
            {dialogue.title}
          </h2>
          <p className="text-[11px] text-muted-foreground">{dialogue.titleDe}</p>
        </div>

        <div className="mt-auto w-full pt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-muted-foreground/40"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] font-medium leading-tight text-muted-foreground">
            {T.coverage.known(percent)} · {T.coverage.lockedProgress(cov.unknown.length)}
          </p>
          <button
            type="button"
            onClick={onLearnMissing}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground active:scale-95"
          >
            <Sparkles className="h-3 w-3" /> {T.coverage.learnMissing}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link to="/dialogues/$dialogueId" params={{ dialogueId: dialogue.id }}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="flex h-full w-full flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left"
      >
        <span className="text-3xl">{dialogue.emoji}</span>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold leading-tight">{dialogue.title}</h2>
          <p className="text-[11px] text-muted-foreground">{dialogue.titleDe}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {playable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Sparkles className="h-2.5 w-2.5" /> {T.dialogues.playableBadge}
            </span>
          )}
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {T.coverage.known(percent)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
