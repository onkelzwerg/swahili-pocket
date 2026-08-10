import { dialogues as seedDialogues } from "./seed";
import { extraDialogues } from "./dialogues-extra";
import type { Dialogue, DialogueSpeaker, DialogueTurn } from "./types";

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
