import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getVocab } from "@/lib/store";
import { VocabListPage } from "@/components/VocabList";
import { T } from "@/config/translations";
import type { VocabEntry } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/words/mastered")({
  head: () => ({
    meta: [
      { title: T.wordsMastered.metaTitle },
      { name: "description", content: T.wordsMastered.metaDescription },
    ],
  }),
  component: WordsMasteredPage,
});

function WordsMasteredPage() {
  const [list, setList] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVocab().then((v) => {
      setList(v);
      setLoading(false);
    });
  }, []);

  const items = list
    .filter((e) => e.box === 5)
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));

  return (
    <VocabListPage
      title={T.wordsMastered.title}
      subtitle={T.wordsMastered.subtitle}
      items={items}
      loading={loading}
      emptyTitle={T.wordsMastered.empty}
      emptyHint={
        <span>
          {T.wordsMastered.hintPrefix}
          <Link to="/review" className="text-primary underline">
            {T.wordsMastered.practiceCta}
          </Link>
        </span>
      }
      meta={(e) => T.wordsMastered.meta(e.box)}
    />
  );
}
