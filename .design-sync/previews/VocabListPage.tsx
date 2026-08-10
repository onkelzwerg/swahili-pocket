import { VocabListPage, Badge } from "tanstack_start_ts";

// VocabListPage is a whole screen: back link, header, and the vocab list. The
// back link is a TanStack Router <Link>, so the router context comes from
// cfg.provider (DsPreviewProviders).
const entry = (
  id: string,
  swahili: string,
  german: string,
  nounClass: string,
  box: number,
) => ({
  id,
  swahili,
  german,
  partOfSpeech: "noun" as const,
  nounClass: nounClass as never,
  examples: [{ sw: `${swahili} ni nzuri.`, de: `${german} ist schön.` }],
  box: box as never,
  nextReview: Date.now() + 86400000,
  createdAt: Date.now() - 86400000 * 30,
});

const items = [
  entry("1", "rafiki", "Freund, Freundin", "N", 3),
  entry("2", "kitabu", "Buch", "Ki-Vi", 2),
  entry("3", "mtoto", "Kind", "M-Wa", 5),
  entry("4", "chakula", "Essen", "Ki-Vi", 1),
  entry("5", "safari", "Reise", "N", 4),
];

export const Filled = () => (
  <VocabListPage
    title="Msamiati"
    subtitle="128 Vokabeln in deinem Pool"
    items={items}
    loading={false}
    emptyTitle="Noch keine Vokabeln"
    meta={(e) => <Badge variant="secondary">Box {e.box}</Badge>}
  />
);

export const Loading = () => (
  <VocabListPage
    title="Msamiati"
    subtitle="Wird geladen…"
    items={[]}
    loading
    emptyTitle="Noch keine Vokabeln"
  />
);

export const Empty = () => (
  <VocabListPage
    title="Gemeisterte Wörter"
    subtitle="Noch nichts gemeistert"
    items={[]}
    loading={false}
    emptyTitle="Noch keine gemeisterten Wörter"
    emptyHint="Wiederhole eine Vokabel mit sieben Tagen Abstand, um sie zu meistern."
  />
);
