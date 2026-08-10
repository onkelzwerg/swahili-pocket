import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getVocab } from "@/lib/store";
import { buildStoryList, getStoriesRead, loadStoryIndex } from "@/lib/stories";
import { allDialogues, isPlayable } from "@/lib/dialogues";
import { nounClasses } from "@/lib/seed";
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

  useEffect(() => {
    void (async () => {
      const [index, vocab, read] = await Promise.all([
        loadStoryIndex(),
        getVocab(),
        getStoriesRead(),
      ]);
      const list = buildStoryList(index, vocab, read);
      setStories({ unlocked: list.filter((i) => i.unlocked).length, total: list.length });
    })();
  }, []);

  const playable = allDialogues.filter(isPlayable).length;

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
            subtitle={T.library.dialogues.subtitle(playable, allDialogues.length)}
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
    </div>
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
