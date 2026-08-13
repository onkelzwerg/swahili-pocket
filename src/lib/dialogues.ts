import { dialogues as seedDialogues } from "./seed";
import { extraDialogues } from "./dialogues-extra";
import { isContentAvailable } from "./packs";
import { UNLOCK_AT, coverage, knownLemmas, type CoverageResult } from "./coverage";
import type { DialogueMeta } from "./dialogue-index";
import type { Dialogue, DialogueSpeaker, DialogueTurn, VocabEntry } from "./types";

// Zugriff auf den Dialogbestand — eine Stelle für Liste und Detailseite.
// Die Reihenfolge ist Bestand: Pool-Dialoge zuerst, danach der Seed.

export const allDialogues: Dialogue[] = [...extraDialogues, ...seedDialogues];

export function findDialogue(id: string): Dialogue | undefined {
  return allDialogues.find((d) => d.id === id);
}

/** Hat der Dialog mindestens einen Entscheidungspunkt? */
export function isPlayable(dialogue: Dialogue): boolean {
  return dialogue.turns.some((t) => (t.choices?.length ?? 0) > 0);
}

/** Anzahl der Entscheidungspunkte — Nenner der Abschlussquote. */
export function choicePointCount(dialogue: Dialogue): number {
  return dialogue.turns.reduce((n, t) => n + ((t.choices?.length ?? 0) > 0 ? 1 : 0), 0);
}

/**
 * Die Rolle, die der Nutzer im Rollenspiel übernimmt. Wählbar sind nur
 * Sprecher, die auch Entscheidungspunkte haben — sonst wäre „Mitspielen"
 * dasselbe wie Zuhören.
 */
export function playableSpeakers(dialogue: Dialogue): DialogueSpeaker[] {
  const speakers = new Set<DialogueSpeaker>();
  for (const turn of dialogue.turns) {
    if ((turn.choices?.length ?? 0) > 0) speakers.add(turn.speaker);
  }
  return [...speakers];
}

/**
 * Antwortoptionen eines Zuges in stabiler, aber nicht verräterischer Reihenfolge.
 * Ohne Mischen stünde die richtige Antwort immer an derselben Stelle; mit
 * `Math.random()` bei jedem Render würde sie bei jedem Fehlversuch springen.
 * Deshalb: deterministisch aus Zug-Index und Text.
 */
export function orderedChoices(turn: DialogueTurn, turnIndex: number) {
  const choices = turn.choices ?? [];
  return [...choices]
    .map((choice, i) => ({ choice, key: hash(`${turnIndex}|${choice.sw}|${i}`) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.choice);
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// Abdeckung & Sortierung (W4.4)
// ---------------------------------------------------------------------------

export interface DialogueListItem {
  dialogue: Dialogue;
  meta?: DialogueMeta;
  cov: CoverageResult;
  unlocked: boolean;
  playable: boolean;
}

/**
 * Freigeschaltete zuerst, danach die knapp verpassten — dieselbe Ordnung wie
 * bei den Geschichten. Sie ersetzt die bisherige Bestandsreihenfolge
 * (Pool-Dialoge, dann Seed): sobald die Hälfte der Liste gesperrt ist, ist
 * „was kann ich jetzt?" die einzige Frage, die die Sortierung beantworten muss.
 * Bei gleicher Abdeckung bleibt der Bestand die Reihenfolge.
 */
function compareDialogues(a: DialogueListItem, b: DialogueListItem): number {
  if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
  return b.cov.ratio - a.cov.ratio;
}

/**
 * Den Dialogbestand gegen den eigenen Wortschatz auswerten (W4.4).
 *
 * Zwei Filter, die nicht dasselbe tun: `activePacks` blendet Dialoge **aus**,
 * deren Wörter außerhalb des aktiven Pools liegen — sie könnten die Schwelle
 * nie erreichen (W4.13). Die Abdeckung **sperrt** danach, was erreichbar, aber
 * noch nicht gelernt ist. Sperren heißt hier: sichtbar mit genauer Zahl, wie
 * viele Wörter noch fehlen.
 *
 * Ein Dialog ohne Eintrag im Index (Datei fehlt, oder selbst hinzugefügt) gilt
 * als offen. Eine Abdeckung von 0 % zu behaupten, weil die Lemma-Liste fehlt,
 * wäre eine Aussage über Daten, nicht über den Nutzer.
 */
export function buildDialogueList(
  dialogues: Dialogue[],
  metaById: Map<string, DialogueMeta>,
  vocab: VocabEntry[],
  activePacks: string[] = [],
): DialogueListItem[] {
  const known = knownLemmas(vocab);
  return dialogues
    .filter((d) => isContentAvailable(metaById.get(d.id)?.requiresPacks, activePacks))
    .map((dialogue) => {
      const meta = metaById.get(dialogue.id);
      const cov = coverage({ lemmas: meta?.lemmas ?? [] }, known);
      return {
        dialogue,
        meta,
        cov,
        unlocked: cov.ratio >= UNLOCK_AT,
        playable: isPlayable(dialogue),
      };
    })
    .sort(compareDialogues);
}
