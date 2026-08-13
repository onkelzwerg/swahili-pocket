// Listen-Index der Dialoge (public/dialogues/index.json, erzeugt von
// scripts/generate-dialogues.mjs).
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
