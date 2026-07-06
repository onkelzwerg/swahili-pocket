import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getVocab } from "@/lib/store";
import { VocabListPage } from "@/components/VocabList";
import { T } from "@/config/translations";
import type { VocabEntry } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/words/today")({
  head: () => ({
    meta: [
      { title: T.wordsToday.metaTitle },
      { name: "description", content: T.wordsToday.metaDescription },
    ],
  }),
  component: WordsTodayPage,
});

function sameLocalDay(ts: number, ref: Date) {
  const d = new Date(ts);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

function WordsTodayPage() {
  const [list, setList] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVocab().then((v) => {
      setList(v);
      setLoading(false);
    });
  }, []);

  const today = new Date();
  const items = list
    .filter((e) => {
      const ts = e.updatedAt ?? e.createdAt;
      return sameLocalDay(ts, today);
    })
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt));

  return (
    <VocabListPage
      title={T.wordsToday.title}
      subtitle={T.wordsToday.subtitle}
      items={items}
      loading={loading}
      emptyTitle={T.wordsToday.empty}
      emptyHint={
        <Link to="/review" className="text-primary underline">
          {T.wordsToday.startCta}
        </Link>
      }
      meta={(e) => {
        const ts = e.updatedAt ?? e.createdAt;
        const d = new Date(ts);
        const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
        return T.wordsToday.meta(time);
      }}
    />
  );
}
