import type { VocabEntry } from "../types";

/** Minimale Testkarte; alles Weitere per Patch. */
export function makeCard(patch: Partial<VocabEntry> = {}): VocabEntry {
  const createdAt = patch.createdAt ?? Date.parse("2026-01-01T08:00:00Z");
  return {
    id: patch.id ?? "card-1",
    swahili: "mtoto",
    german: "Kind",
    partOfSpeech: "noun",
    examples: [],
    box: 1,
    nextReview: createdAt,
    createdAt,
    ...patch,
  };
}
