import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { allDialogues, isPlayable } from "@/lib/dialogues";
import { dialogueMetaById, type DialogueMeta } from "@/lib/dialogue-index";
import { activePacks, isContentAvailable } from "@/lib/packs";
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
 */
function DialoguesPage() {
  const [meta, setMeta] = useState<Map<string, DialogueMeta> | null>(null);
  const [packs, setPacks] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const [byId, on] = await Promise.all([dialogueMetaById(), activePacks()]);
      setPacks(on);
      setMeta(byId);
    })();
  }, []);

  // Solange der Index nicht da ist, alles zeigen — eine Liste, die beim Laden
  // erst leer ist und dann Kacheln nachschiebt, wirkt kaputt.
  const visible = meta
    ? allDialogues.filter((d) => isContentAvailable(meta.get(d.id)?.requiresPacks, packs))
    : allDialogues;

  return (
    <div className="px-5 pt-8">
      <header className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">{T.dialogues.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.dialogues.title}</h1>
      </header>

      <ul className="grid grid-cols-2 gap-3 pb-4">
        {visible.map((d) => (
          <li key={d.id}>
            <Link to="/dialogues/$dialogueId" params={{ dialogueId: d.id }}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="flex h-full w-full flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left"
              >
                <span className="text-3xl">{d.emoji}</span>
                <div className="min-w-0">
                  <h2 className="font-display text-base font-semibold leading-tight">{d.title}</h2>
                  <p className="text-[11px] text-muted-foreground">{d.titleDe}</p>
                </div>
                {isPlayable(d) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <Sparkles className="h-2.5 w-2.5" /> {T.dialogues.playableBadge}
                  </span>
                )}
              </motion.div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
