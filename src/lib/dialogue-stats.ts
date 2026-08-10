import { get, set } from "idb-keyval";

// Fortschritt im Rollenspiel-Modus der Dialoge (W3.4).
//
// Eigener kleiner Zählerspeicher statt Review-Log — nach dem Muster von
// trainer-stats.ts. Ein Dialogzug ist keine Karte: er hat keine Box, keine
// Fälligkeit und keinen `cardId`, den das Log verlangt. Ihn dort mit
// Platzhalterwerten einzutragen würde die Auswertungen verwässern, statt sie
// zu bereichern.

const K_DIALOGUES = "dialogues:played";

export interface DialogueRun {
  /** Zeitpunkt des Abschlusses. */
  ts: number;
  /** Beim ersten Versuch richtig beantwortete Entscheidungspunkte. */
  firstTry: number;
  /** Entscheidungspunkte insgesamt. */
  total: number;
}

/** dialogueId → bester Durchlauf. */
export type DialogueStats = Record<string, DialogueRun>;

let cache: DialogueStats | null = null;

export function normalizeDialogueStats(raw: unknown): DialogueStats {
  if (!raw || typeof raw !== "object") return {};
  const out: DialogueStats = {};
  for (const [id, run] of Object.entries(raw as Record<string, Partial<DialogueRun>>)) {
    if (typeof run?.total !== "number" || typeof run?.firstTry !== "number") continue;
    out[id] = { ts: run.ts ?? 0, firstTry: run.firstTry, total: run.total };
  }
  return out;
}

export async function getDialogueStats(): Promise<DialogueStats> {
  cache ??= normalizeDialogueStats(await get(K_DIALOGUES).catch(() => null));
  return cache;
}

export async function writeDialogueStats(stats: DialogueStats): Promise<DialogueStats> {
  cache = normalizeDialogueStats(stats);
  await set(K_DIALOGUES, cache).catch(() => {});
  return cache;
}

/**
 * Einen Durchlauf verbuchen. Nur das bessere Ergebnis bleibt stehen —
 * ein zweiter, schlechterer Versuch soll die erste fehlerfreie Runde nicht
 * wieder wegnehmen.
 */
export async function recordDialogueRun(
  id: string,
  run: Omit<DialogueRun, "ts">,
  now = Date.now(),
): Promise<DialogueStats> {
  const stats = await getDialogueStats();
  const previous = stats[id];
  if (previous && previous.firstTry >= run.firstTry) return stats;
  return writeDialogueStats({ ...stats, [id]: { ts: now, ...run } });
}

/** Nur für Tests: Modul-Cache leeren. */
export function resetDialogueStatsCache() {
  cache = null;
}
