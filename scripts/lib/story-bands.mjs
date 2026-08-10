/**
 * Häufigkeitsbänder für die Geschichten-Pipeline (W3.2).
 *
 * Der Plan wollte die Bandzuordnung als Spalte aus der Pool-CSV ziehen. Die
 * gibt es nicht: der Supabase-Export von `shared_vocab` führt keine Häufigkeit,
 * und `public/vocab-pool.json` ist alphabetisch sortiert — "Reihenfolge im
 * Pool" als Fallback wäre also eine Sortierung nach Anfangsbuchstabe.
 *
 * Stattdessen wird die Häufigkeit aus dem Material abgeleitet, das der Pool
 * schon mitbringt: ~2.400 kuratierte Beispielsätze. Wie oft ein Wort dort
 * vorkommt, ist ein echtes Korpus-Signal — die Rangliste beginnt mit
 * ni, sana, kwa, na, leo, kila …, was sich mit jeder Grundwortschatzliste deckt.
 *
 * Eine Heuristik bleibt es trotzdem, aus zwei Gründen:
 *   1. Verben stehen im Pool als Infinitiv (`kula`), im Satz aber konjugiert
 *      (`ninakula`). Deshalb zählen für Verben zusätzlich alle Token, die auf
 *      den Stamm enden. Das trifft gelegentlich daneben (`-isha`, `-lia` sind
 *      auch Ableitungssuffixe), verschiebt aber nur den Rang, nichts Inhaltliches.
 *   2. 160 Einträge kommen in keinem Beispielsatz vor; sie landen mit Zähler 0
 *      alphabetisch am Ende — also im letzten Band, wo seltene Wörter hingehören.
 */

/** Bandgrenzen als Rang der letzten Vokabel (Plan W3.2). */
export const BAND_LIMITS = [150, 350, 600];

/** Stämme unter dieser Länge werden nicht als Suffix gesucht (zu viele Zufallstreffer). */
const MIN_STEM = 3;

const TOKEN_RE = /[a-zà-ÿ]+(?:'[a-zà-ÿ]+)*/gi;

function tokenize(text) {
  return (text.toLowerCase().match(TOKEN_RE) ?? []);
}

/** Alle Token aller Beispielsätze des Pools. */
function corpusTokens(pool) {
  const tokens = [];
  for (const entry of pool) {
    for (const ex of entry.examples ?? []) {
      if (ex?.sw) tokens.push(...tokenize(ex.sw));
    }
  }
  return tokens;
}

/**
 * Häufigkeitsrang aller Pool-Vokabeln, häufigste zuerst.
 * Gleichstand wird alphabetisch aufgelöst, damit der Lauf reproduzierbar ist.
 */
export function rankPool(pool) {
  const tokens = corpusTokens(pool);
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);

  const scored = pool.map((entry) => {
    const word = entry.swahili.toLowerCase();
    let score = counts.get(word) ?? 0;
    if (entry.partOfSpeech === "verb" && word.startsWith("ku") && !word.includes(" ")) {
      const stem = word.slice(2);
      if (stem.length >= MIN_STEM) {
        for (const t of tokens) if (t.length > stem.length && t.endsWith(stem)) score++;
      }
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score || a.entry.swahili.localeCompare(b.entry.swahili, "sw"));
  return scored.map((s) => s.entry);
}

/** Band 1..4 für einen Rang (0-basiert). */
export function bandForRank(rank) {
  for (let i = 0; i < BAND_LIMITS.length; i++) {
    if (rank < BAND_LIMITS[i]) return i + 1;
  }
  return BAND_LIMITS.length + 1;
}

/**
 * Der erlaubte Wortschatz eines Bandes: alle Lemmata **bis einschließlich**
 * dieses Bandes. Ein Band-3-Text darf selbstverständlich `ni` und `na`
 * benutzen — die Bänder sind kumulativ, nicht disjunkt.
 */
export function allowedLemmas(pool, band) {
  const ranked = rankPool(pool);
  const limit = band > BAND_LIMITS.length ? ranked.length : BAND_LIMITS[band - 1];
  return new Set(ranked.slice(0, limit).map((e) => e.swahili.toLowerCase()));
}

/** Pool-Eintrag je Lemma (kleingeschrieben) — für Übersetzungen im Prompt. */
export function poolByLemma(pool) {
  const map = new Map();
  for (const e of pool) map.set(e.swahili.toLowerCase(), e);
  return map;
}
