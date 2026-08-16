import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getVocab } from "@/lib/store";
import { buildStoryList, getStoriesRead, loadStoryIndex } from "@/lib/stories";
import { allDialogues, buildDialogueList } from "@/lib/dialogues";
import { nounClasses } from "@/lib/seed";
import { dialogueMetaById } from "@/lib/dialogue-index";
import { activePacks, loadPackIndex, setPackActive, type PackMeta } from "@/lib/packs";
import { PackPreviewSheet } from "@/components/PackPreviewSheet";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: T.library.metaTitle },
      { name: "description", content: T.library.metaDescription },
    ],
  }),
  component: LibraryPage,
});

/**
 * Bibliothek (W3.6): der Hub für alles zum Lesen, Hören und Nachschlagen.
 *
 * Mit den Geschichten wurde die TabBar zu voll. Statt einen sechsten Tab zu
 * behalten, bündelt eine Ebene die drei Inhaltsbereiche — die Zähler machen
 * sichtbar, dass sich dahinter etwas bewegt.
 */
function LibraryPage() {
  const [stories, setStories] = useState({ unlocked: 0, total: 0 });
  // Der Dialogzähler muss dieselbe Auswahl zählen wie die Liste, sonst
  // verspricht die Kachel Inhalte, die dahinter nicht stehen.
  const [dialogues, setDialogues] = useState({
    unlocked: 0,
    playable: 0,
    total: allDialogues.length,
  });
  // Die Paketauswahl liegt hier oben, nicht in PackSection: die Zähler hängen
  // an ihr. Läge sie weiter unten, zeigte die Kachel nach dem Umschalten noch
  // die alte Zahl, bis man die Seite verlässt — es sähe aus, als hätte der
  // Schalter nicht gewirkt.
  const [active, setActive] = useState<string[] | null>(null);

  useEffect(() => {
    void activePacks().then(setActive);
  }, []);

  useEffect(() => {
    if (active === null) return;
    void (async () => {
      const [index, vocab, read, meta] = await Promise.all([
        loadStoryIndex(),
        getVocab(),
        getStoriesRead(),
        dialogueMetaById(),
      ]);
      const list = buildStoryList(index, vocab, read, active);
      setStories({ unlocked: list.filter((i) => i.unlocked).length, total: list.length });

      const visible = buildDialogueList(allDialogues, meta, vocab, active);
      setDialogues({
        unlocked: visible.filter((i) => i.unlocked).length,
        playable: visible.filter((i) => i.playable).length,
        total: visible.length,
      });
    })();
  }, [active]);

  return (
    <div className="px-5 pt-8">
      <header className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">{T.library.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.library.title}</h1>
      </header>

      <ul className="flex flex-col gap-3">
        <li>
          <Tile
            to="/stories"
            emoji="📖"
            title={T.library.stories.title}
            subtitle={T.library.stories.subtitle(stories.unlocked, stories.total)}
          />
        </li>
        <li>
          <Tile
            to="/dialogues"
            emoji="💬"
            title={T.library.dialogues.title}
            subtitle={T.library.dialogues.subtitle(
              dialogues.unlocked,
              dialogues.total,
              dialogues.playable,
            )}
          />
        </li>
        <li>
          <Tile
            to="/classes"
            emoji="🧩"
            title={T.library.grammar.title}
            subtitle={T.library.grammar.subtitle(nounClasses.length)}
          />
        </li>
      </ul>

      <PackSection active={active ?? []} onChange={setActive} />
    </div>
  );
}

/**
 * Themenpakete (W4.13).
 *
 * Der Kern-Wortschatz reicht für den Alltag. Wer über Politik, Landwirtschaft
 * oder ein Vorstellungsgespräch sprechen will, schaltet das passende Paket zu —
 * dann stehen seine Wörter im Pool zur Auswahl, und die Inhalte, die sie
 * benutzen, tauchen in den Listen auf. Ausgeschaltet verschwinden sie wieder;
 * die Karten, die man schon gezogen hat, bleiben natürlich.
 *
 * Die Karte hat zwei Ziele: der Rumpf öffnet die Vorschau auf die Wörter, der
 * Schalter rechts schaltet direkt um. Titel und Beschreibung sagen nur, worum
 * es geht — was man sich einhandelt, steht in der Wortliste.
 */
function PackSection({
  active,
  onChange,
}: {
  active: string[];
  onChange: (next: string[]) => void;
}) {
  const [packs, setPacks] = useState<PackMeta[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<PackMeta | null>(null);

  useEffect(() => {
    void loadPackIndex().then(setPacks);
  }, []);

  if (packs.length === 0) return null;

  async function toggle(id: string, on: boolean) {
    setBusy(id);
    try {
      onChange(await setPackActive(id, on));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold">{T.packs.title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{T.packs.intro}</p>

      <ul className="mt-3 flex flex-col gap-2">
        {packs.map((pack) => {
          const on = active.includes(pack.id);
          return (
            <li
              key={pack.id}
              className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
                on ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <button
                type="button"
                onClick={() => setPreview(pack)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="text-2xl">{pack.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{pack.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{pack.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {T.packs.wordCount(pack.wordCount)} · {T.packs.openPreview}
                  </p>
                </div>
              </button>
              <button
                type="button"
                disabled={busy === pack.id}
                onClick={() => void toggle(pack.id, !on)}
                aria-pressed={on}
                aria-label={T.packs.toggleAria(pack.title, on)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                  on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {on ? T.packs.on : T.packs.off}
              </button>
            </li>
          );
        })}
      </ul>

      <PackPreviewSheet
        pack={preview}
        active={preview ? active.includes(preview.id) : false}
        busy={busy !== null}
        onToggle={(id, next) => void toggle(id, next)}
        onClose={() => setPreview(null)}
      />
    </section>
  );
}

function Tile({
  to,
  emoji,
  title,
  subtitle,
}: {
  to: "/stories" | "/dialogues" | "/classes";
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link to={to}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5"
      >
        <span className="text-4xl">{emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-tight">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </motion.div>
    </Link>
  );
}
