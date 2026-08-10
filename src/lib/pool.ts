import type { Example, NounClass, PartOfSpeech, VocabEntry } from "./types";
import { getVocab, addVocab, newId } from "./store";
import { seedVocab } from "./seed";
import { shuffle } from "./utils";

// Re-Export für Bestandsimporte: shuffle() lebt seit P0.3 in utils.ts.
export { shuffle };

// Statischer Vokabel-Pool: wird als JSON mit der App ausgeliefert
// (public/vocab-pool.json, generiert via scripts/pool-from-csv.mjs).
// Fällt auf den Seed-Wortschatz zurück, solange die Datei fehlt.

export interface PoolEntry {
  swahili: string;
  german: string;
  partOfSpeech: PartOfSpeech;
  nounClass?: NounClass | null;
  examples: Example[];
  topics?: string[];
}

let poolCache: PoolEntry[] | null = null;
let poolPromise: Promise<PoolEntry[]> | null = null;

async function fetchPool(): Promise<PoolEntry[]> {
  try {
    const r = await fetch("/vocab-pool.json");
    if (r.ok) {
      const data = (await r.json()) as PoolEntry[];
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    /* offline oder Datei fehlt → Seed-Fallback */
  }
  return seedVocab().map((v) => ({
    swahili: v.swahili,
    german: v.german,
    partOfSpeech: v.partOfSpeech,
    nounClass: v.nounClass ?? null,
    examples: v.examples,
  }));
}

export async function loadPool(): Promise<PoolEntry[]> {
  if (poolCache) return poolCache;
  if (!poolPromise) {
    poolPromise = fetchPool().then((p) => {
      poolCache = p;
      return p;
    });
  }
  return poolPromise;
}

export interface PoolListItem extends PoolEntry {
  /** Stabiler Schlüssel innerhalb des Pools (das Wort selbst ist unique). */
  poolKey: string;
  inMyCards: boolean;
}

export async function listPool(filters: {
  query?: string;
  partOfSpeech?: PartOfSpeech;
  nounClass?: NounClass;
}): Promise<{ items: PoolListItem[]; total: number }> {
  const [pool, mine] = await Promise.all([loadPool(), getVocab()]);
  const owned = new Set(mine.map((v) => v.swahili.toLowerCase()));
  const q = filters.query?.toLowerCase();
  const items = pool
    .filter((e) => {
      if (q && !`${e.swahili} ${e.german}`.toLowerCase().includes(q)) return false;
      if (filters.partOfSpeech && e.partOfSpeech !== filters.partOfSpeech) return false;
      if (filters.nounClass && e.nounClass !== filters.nounClass) return false;
      return true;
    })
    .map((e) => ({
      ...e,
      poolKey: e.swahili.toLowerCase(),
      inMyCards: owned.has(e.swahili.toLowerCase()),
    }));
  return { items, total: items.length };
}

// Nomenklassen-Erkennung im Freitext: "M-Wa", "M/Wa", "M/MW-Klasse", "kivi" …
// Schlüssel = Query ohne Trennzeichen/Suffix "klasse", kleingeschrieben.
const NOUN_CLASS_ALIASES: Record<string, NounClass> = {
  mwa: "M-Wa",
  mmw: "M-Wa",
  mmi: "M-Mi",
  kivi: "Ki-Vi",
  n: "N",
  jima: "Ji-Ma",
  u: "U",
  pakumu: "Pa-Ku-Mu",
  ku: "Ku",
};

/** Die häufigsten Themen im Pool (für Vorschlags-Chips). */
export async function getTopTopics(n = 10): Promise<string[]> {
  const pool = await loadPool();
  const counts = new Map<string, number>();
  for (const e of pool) {
    for (const t of e.topics ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 15)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t);
}

/**
 * Passende, noch nicht gelernte Vokabeln aus dem Pool auswählen.
 * Leere Query → zufällige Auswahl. Nomenklassen-Query → Klassenfilter.
 * Sonst Scoring über Themen, Übersetzung und Beispielsätze.
 */
export async function pickFromPool(opts: { query?: string; count: number }): Promise<PoolEntry[]> {
  const [pool, mine] = await Promise.all([loadPool(), getVocab()]);
  const owned = new Set(mine.map((v) => v.swahili.toLowerCase()));
  const candidates = pool.filter((e) => !owned.has(e.swahili.toLowerCase()));

  const raw = (opts.query ?? "").trim().toLowerCase();
  if (!raw) return shuffle(candidates).slice(0, opts.count);

  const ncKey = raw.replace(/[-\s/]*klasse$/, "").replace(/[-\s/.]/g, "");
  const nc = NOUN_CLASS_ALIASES[ncKey];
  if (nc) {
    return shuffle(candidates.filter((e) => e.nounClass === nc)).slice(0, opts.count);
  }

  const scored = candidates
    .map((e) => {
      let s = 0;
      const topics = (e.topics ?? []).map((t) => t.toLowerCase());
      if (topics.some((t) => t.includes(raw) || raw.includes(t))) s += 4;
      if (e.german.toLowerCase().includes(raw) || e.swahili.toLowerCase().includes(raw)) s += 3;
      if (
        (e.examples ?? []).some(
          (x) => x.de.toLowerCase().includes(raw) || x.sw.toLowerCase().includes(raw),
        )
      )
        s += 1;
      return { e, s };
    })
    .filter((x) => x.s > 0);

  // Beste Treffer zuerst, gleichwertige zufällig gemischt (Abwechslung).
  return shuffle(scored)
    .sort((a, b) => b.s - a.s)
    .slice(0, opts.count)
    .map((x) => x.e);
}

/**
 * Gezielt bestimmte Lemmata aus dem Pool holen (W3.3): der Weg von einer
 * gesperrten Geschichte zu genau den Wörtern, die noch fehlen.
 * Reihenfolge der Anfrage bleibt erhalten; Unbekanntes fällt still raus.
 */
export async function findInPool(lemmas: string[]): Promise<PoolEntry[]> {
  const pool = await loadPool();
  const byLemma = new Map(pool.map((e) => [e.swahili.toLowerCase(), e]));
  const seen = new Set<string>();
  const found: PoolEntry[] = [];
  for (const lemma of lemmas) {
    const key = lemma.trim().toLowerCase();
    const entry = byLemma.get(key);
    if (entry && !seen.has(key)) {
      seen.add(key);
      found.push(entry);
    }
  }
  return found;
}

/**
 * Ein Wort als eigene Karte anlegen, das der Pool nicht kennt (W3.3).
 * Beim Lesen begegnen einem Formen, die es als Vokabel nicht gibt — der
 * Lernfluss soll daran nicht enden.
 */
export async function addPrivateCard(entry: {
  swahili: string;
  german: string;
  examples?: Example[];
}): Promise<{ added: boolean }> {
  const mine = await getVocab();
  if (mine.some((v) => v.swahili.toLowerCase() === entry.swahili.toLowerCase())) {
    return { added: false };
  }
  const now = Date.now();
  await addVocab({
    id: newId(),
    swahili: entry.swahili,
    german: entry.german,
    partOfSpeech: "other",
    examples: entry.examples ?? [],
    box: 1,
    nextReview: now,
    leitnerDue: now,
    createdAt: now,
    isPrivate: true,
  });
  return { added: true };
}

/** Pool-Eintrag als Lernkarte übernehmen. */
export async function addPoolEntryToCards(entry: PoolEntry): Promise<{ added: boolean }> {
  const mine = await getVocab();
  if (mine.some((v) => v.swahili.toLowerCase() === entry.swahili.toLowerCase())) {
    return { added: false };
  }
  const now = Date.now();
  const card: VocabEntry = {
    id: newId(),
    swahili: entry.swahili,
    german: entry.german,
    partOfSpeech: entry.partOfSpeech,
    nounClass: entry.nounClass ?? undefined,
    examples: entry.examples ?? [],
    box: 1,
    nextReview: now,
    // Von Anfang an gesetzt, damit ein Scheduler-Wechsel die Fälligkeit
    // neuer Karten nicht schätzen muss (siehe srs/index.ts recomputeDue).
    leitnerDue: now,
    createdAt: now,
    isPrivate: false,
  };
  await addVocab(card);
  return { added: true };
}
