import type { DialogueChoice } from "./types";

// Erzeugte Dialogdaten unter public/dialogues/ (scripts/generate-dialogues.mjs):
// der Listen-Index und die Glossardatei je Dialog.
//
// Der Dialogtext selbst steht in seed.ts und dialogues-extra.ts und ist Teil
// des Bündels. Was hier dazukommt, ist alles, was aus den Glossaren abgeleitet
// wird: die Lemmata für die Abdeckung, der Paketbedarf und ob der Dialog
// vollständig vertont ist. Getrennt gehalten, weil es erzeugt wird — was der
// Validator schreibt, pflegt niemand von Hand.

export interface DialogueMeta {
  id: string;
  title: string;
  titleDe: string | null;
  level: string | null;
  /** Alle verlangten Lemmata (ohne Eigennamen) — Basis der Abdeckung. */
  lemmas: string[];
  /** Themenpakete, ohne die der Dialog nicht erreichbar ist (W4.13). */
  requiresPacks?: string[];
  turnCount: number;
  wordCount: number;
  /** Entscheidungspunkte fürs Rollenspiel; 0 = nur zum Lesen und Hören. */
  choicePoints: number;
  playableSpeakers: string[];
  /** Nur wahr, wenn **jede** Zeile eine Aufnahme hat. */
  hasAudio: boolean;
}

interface DialogueIndex {
  version: 1;
  dialogues: DialogueMeta[];
}

let indexPromise: Promise<DialogueMeta[]> | null = null;

/**
 * Leer, solange die Datei fehlt — die Dialogliste muss auch dann funktionieren.
 * Sie fällt in dem Fall auf den Bestand aus den TS-Quellen zurück und zeigt
 * eben keine Abdeckung an.
 */
export function loadDialogueIndex(): Promise<DialogueMeta[]> {
  if (!indexPromise) {
    indexPromise = fetch("/dialogues/index.json")
      .then((r) => (r.ok ? (r.json() as Promise<DialogueIndex>) : null))
      .then((data) => data?.dialogues ?? [])
      .catch(() => []);
  }
  return indexPromise;
}

export async function dialogueMetaById(): Promise<Map<string, DialogueMeta>> {
  return new Map((await loadDialogueIndex()).map((d) => [d.id, d]));
}

// ---------------------------------------------------------------------------
// Glossardatei je Dialog
// ---------------------------------------------------------------------------

/**
 * Ein Glossareintrag — deckungsgleich mit `StoryGloss`, weil derselbe
 * Validator-Kern beide schreibt und dasselbe Sheet beide anzeigt.
 */
export interface DialogueGloss {
  /** Grundform, unter der das Wort im Wortschatz zählt. */
  lemma: string;
  de: string;
  /** Eigenname — keine Vokabel, zählt nicht in die Abdeckung. */
  proper?: boolean;
  /** Geschlossene Wortklasse — Grammatik-Gym statt Karteikarte. */
  structure?: boolean;
}

/** public/dialogues/<id>.json — Glossar und Entscheidungspunkte eines Dialogs. */
export interface DialogueData {
  id: string;
  lemmas: string[];
  /** Token (kleingeschrieben) → Glossareintrag. Deckt jedes Token jeder Zeile ab. */
  glosses: Record<string, DialogueGloss>;
  /** Zug-Index (als String) → Antwortoptionen. Leer, solange keine gepflegt sind. */
  choices: Record<string, DialogueChoice[]>;
}

const dataCache = new Map<string, Promise<DialogueData | null>>();

/**
 * Glossar eines Dialogs laden. `null`, wenn die Datei fehlt — die Detailseite
 * zeigt dann eben nicht antippbare Wörter statt gar keinen Dialog.
 */
export function loadDialogueData(id: string): Promise<DialogueData | null> {
  let p = dataCache.get(id);
  if (!p) {
    // Die Id kommt aus dem Bestand, nie aus freier Nutzereingabe — trotzdem
    // encodieren, damit die URL auch bei kaputtem Index gültig bleibt.
    p = fetch(`/dialogues/${encodeURIComponent(id)}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<DialogueData>) : null))
      .then((data) => (data && typeof data.glosses === "object" ? data : null))
      .catch(() => null);
    dataCache.set(id, p);
  }
  return p;
}

/** Nur für Tests: geladene Dateien vergessen. */
export function resetDialogueIndexCache(): void {
  indexPromise = null;
  dataCache.clear();
}
