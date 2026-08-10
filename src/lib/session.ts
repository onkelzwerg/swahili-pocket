import type { SessionModeId, VocabEntry } from "./types";
import { getSettings } from "./settings";
import { dueToday, getVocab } from "./store";
import { shuffle } from "./utils";
import { EXERCISE_MODES, FALLBACK_MODE } from "./exercises/registry";
import type { ExerciseMode } from "./exercises/types";
import { loadAudioIndex } from "./tts";

// Session-Builder (W2.1): entscheidet, WELCHE Karten drankommen und in
// WELCHEM Modus. Bewusst als reine Funktion (`assignModes`) plus eine dünne
// asynchrone Hülle (`buildSession`) — die Verteilungsregeln sind damit ohne
// IndexedDB und ohne React testbar.
//
// Interleaving (Rohrer & Taylor 2007): Modi mischen schlägt Blöcke desselben
// Formats. Deshalb wird pro Karte neu gewürfelt, statt die Session in
// Abschnitte zu teilen.

export interface SessionItem {
  card: VocabEntry;
  mode: SessionModeId;
}

/**
 * Wie viele fällige Karten höchstens in eine Session kommen, relativ zum
 * Tagesziel. Der Rest bleibt fällig und kommt in der nächsten Runde —
 * so bleibt das Ziel erreichbar, ohne dass wir Fälliges verstecken.
 */
export const SESSION_CAP_FACTOR = 2;

export interface AssignOptions {
  /** Kompletter Kartenbestand (Distraktoren-Quelle). */
  vocab: VocabEntry[];
  /** Steht für diese Karte vorab generiertes Audio bereit? */
  hasAudio(card: VocabEntry): boolean;
  /** Aus den Settings: `false` schaltet einen Modus ab, fehlend = an. */
  enabledModes?: Partial<Record<SessionModeId, boolean>>;
  rng?: () => number;
  /** Nur für Tests: Registry überschreiben. */
  modes?: ExerciseMode[];
}

function isEnabled(id: SessionModeId, enabled: AssignOptions["enabledModes"]): boolean {
  return enabled?.[id] !== false;
}

/**
 * Obergrenze eines Modus in dieser Session.
 * Aufgerundet auf mindestens 1: in einer Zwei-Karten-Runde soll „Tippen"
 * nicht komplett verschwinden, nur weil 40 % rechnerisch unter 1 liegen.
 */
function shareCap(mode: ExerciseMode, total: number): number {
  if (mode.maxShare === undefined) return Number.POSITIVE_INFINITY;
  return Math.max(1, Math.floor(total * mode.maxShare));
}

function pickWeighted(
  candidates: ExerciseMode[],
  card: VocabEntry,
  rng: () => number,
): ExerciseMode {
  const weights = candidates.map((m) => Math.max(0, m.weight(card)));
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return candidates[0];
  let roll = rng() * sum;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll < 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * Jeder Karte einen Übungsmodus zuweisen — gewichtete Zufallswahl über alle
 * Modi, die die Karte üben dürfen, aktiviert sind und ihren Session-Anteil
 * noch nicht ausgeschöpft haben. Greift keiner: Flip als Fallback.
 */
export function assignModes(cards: VocabEntry[], opts: AssignOptions): SessionItem[] {
  const rng = opts.rng ?? Math.random;
  const modes = opts.modes ?? EXERCISE_MODES;
  const used: Partial<Record<SessionModeId, number>> = {};
  const caps = new Map(modes.map((m) => [m.id, shareCap(m, cards.length)]));

  return cards.map((card) => {
    const ctx = { hasAudio: opts.hasAudio(card), vocab: opts.vocab };
    const candidates = modes.filter(
      (m) =>
        isEnabled(m.id, opts.enabledModes) &&
        (used[m.id] ?? 0) < (caps.get(m.id) ?? Number.POSITIVE_INFINITY) &&
        m.weight(card) > 0 &&
        m.isEligible(card, ctx),
    );
    const mode = candidates.length > 0 ? pickWeighted(candidates, card, rng).id : FALLBACK_MODE;
    used[mode] = (used[mode] ?? 0) + 1;
    return { card, mode };
  });
}

export interface BuildSessionOptions {
  /** Vorgegebene Karten statt der fälligen (z. B. Comeback-Runde). */
  cards?: VocabEntry[];
  /** Höchstzahl an Karten. Default: Tagesziel × SESSION_CAP_FACTOR. */
  limit?: number;
  rng?: () => number;
  now?: number;
}

/**
 * Fällige Karten holen, mischen, kappen und Modi zuweisen.
 * Einzige Stelle, die eine Übungsrunde zusammenstellt.
 */
export async function buildSession(opts: BuildSessionOptions = {}): Promise<SessionItem[]> {
  const now = opts.now ?? Date.now();
  const rng = opts.rng ?? Math.random;
  const [vocab, settings, audioIndex] = await Promise.all([
    getVocab(),
    getSettings(),
    loadAudioIndex().catch(() => new Set<string>()),
  ]);

  const source = opts.cards ?? dueToday(vocab, now);
  const seen = new Set<string>();
  const unique = source.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
  const limit = opts.limit ?? settings.dailyGoalCards * SESSION_CAP_FACTOR;
  const queue = shuffle(unique, rng).slice(0, Math.max(0, limit));

  return assignModes(queue, {
    vocab,
    hasAudio: (card) => audioIndex.has(card.swahili.trim()),
    enabledModes: settings.enabledModes,
    rng,
  });
}
