import { get, set } from "idb-keyval";
import { COMFORT_AT, UNLOCK_AT, coverage, knownLemmas, type CoverageResult } from "./coverage";
import type { VocabEntry } from "./types";

// Re-Export, damit die UI für Geschichten nur dieses Modul importieren muss.
export { UNLOCK_AT, COMFORT_AT };

// Geschichten (W3.2/W3.3).
//
// Die Texte entstehen zur Build-Zeit (scripts/generate-stories.mjs) und liegen
// als geprüftes JSON unter public/stories/. Zur Laufzeit wird nichts generiert
// und nichts geraten: die Pipeline hat jedes Token gegen das Glossar geprüft,
// bevor die Datei überhaupt geschrieben wurde.
//
// `splitStoryText()` ist die Tokenisierung — dieselbe Funktion, die der
// Validator im Build benutzt (er importiert dieses Modul). Wenn Reader und
// Validator unterschiedlich trennen würden, gäbe es angetippte Wörter ohne
// Glossareintrag.

const K_READ = "stories:read";

export interface StoryGloss {
  /** Grundform, unter der das Wort im Wortschatz zählt. */
  lemma: string;
  de: string;
  /**
   * Eigenname (Personen, Orte). Zählt nicht in die Abdeckung — ein Name ist
   * keine Vokabel, die man erst lernen müsste.
   */
  proper?: boolean;
  /**
   * Geschlossene Wortklasse (Konkordanz, Possessivstamm, Demonstrativum).
   * Zählt ebenfalls nicht in die Abdeckung und lässt sich nicht als Karte
   * übernehmen — diese Formen lernt man im Grammatik-Gym, nicht als Vokabel.
   * Gesetzt von der Pipeline (STRUCTURE_LEMMAS in scripts/lib/story-validate.mjs).
   */
  structure?: boolean;
}

export interface StoryParagraph {
  sw: string;
  de: string;
}

/** Volltext einer Geschichte (public/stories/<id>.json). */
export interface Story {
  id: string;
  title: string;
  titleDe: string;
  /** 1–4, grob nach Häufigkeit des verlangten Wortschatzes. */
  band: number;
  topic: string;
  emoji: string;
  /** Alle verlangten Lemmata (ohne Eigennamen) — Basis der Abdeckung. */
  lemmas: string[];
  /** Höchstens drei Wörter, die der Text bewusst neu einführt. */
  newLemmas: string[];
  paragraphs: StoryParagraph[];
  /** Token (kleingeschrieben) → Glossareintrag. Deckt jedes Token im Text ab. */
  glosses: Record<string, StoryGloss>;
  /** Pfad unter public/ oder null, solange keine Aufnahme existiert. */
  audio: string | null;
}

/** Listeneintrag (public/stories/index.json) — ohne Volltext. */
export interface StoryMeta {
  id: string;
  title: string;
  titleDe: string;
  band: number;
  topic: string;
  emoji: string;
  lemmas: string[];
  newLemmas: string[];
  /** Laufwörter — für die Längenangabe in der Liste. */
  wordCount: number;
  hasAudio: boolean;
}

export interface StoryIndex {
  version: 1;
  stories: StoryMeta[];
}

// ---------------------------------------------------------------------------
// Tokenisierung
// ---------------------------------------------------------------------------

/**
 * Ein Textstück des Absatzes. `word` ist der Glossar-Schlüssel
 * (kleingeschrieben) bei Wörtern und null bei Satzzeichen/Leerraum.
 */
export interface StorySegment {
  text: string;
  word: string | null;
}

// Buchstaben plus inneres Apostroph: `ng'ombe` ist ein Wort, `ombe.` nicht.
// Das Apostroph nur *zwischen* Buchstaben zuzulassen hält Anführungszeichen
// am Wortrand draußen.
const WORD_RE = /[a-zà-ÿ]+(?:'[a-zà-ÿ]+)*/gi;

/** Absatztext in Wörter und Zwischenräume zerlegen, Reihenfolge erhalten. */
export function splitStoryText(text: string): StorySegment[] {
  const out: StorySegment[] = [];
  let last = 0;
  for (const m of text.matchAll(WORD_RE)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), word: null });
    out.push({ text: m[0], word: m[0].toLowerCase() });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), word: null });
  return out;
}

/** Nur die Wort-Token eines Textes, kleingeschrieben, in Reihenfolge. */
export function storyTokens(text: string): string[] {
  return splitStoryText(text).flatMap((s) => (s.word ? [s.word] : []));
}

/**
 * Dieselben Segmente, aber gruppiert an den Leerräumen.
 *
 * Der Reader macht aus jedem Wort ein eigenes Element; ohne Gruppierung darf
 * der Browser zwischen einem Wort und dem folgenden Satzzeichen umbrechen und
 * der Punkt landet allein in der nächsten Zeile. Eine Gruppe ist genau das,
 * was zusammenbleiben muss: ein Wort samt anhängender Interpunktion.
 */
export function groupStorySegments(text: string): StorySegment[][] {
  const groups: StorySegment[][] = [];
  let current: StorySegment[] = [];
  for (const segment of splitStoryText(text)) {
    if (!segment.word && /^\s+$/.test(segment.text)) {
      if (current.length > 0) groups.push(current);
      groups.push([segment]);
      current = [];
      continue;
    }
    // Leerraum innerhalb eines Satzzeichen-Segments (z. B. „, ") trennt auch.
    if (!segment.word && /\s/.test(segment.text)) {
      const parts = segment.text.split(/(\s+)/).filter(Boolean);
      for (const part of parts) {
        if (/^\s+$/.test(part)) {
          if (current.length > 0) groups.push(current);
          groups.push([{ text: part, word: null }]);
          current = [];
        } else {
          current.push({ text: part, word: null });
        }
      }
      continue;
    }
    current.push(segment);
  }
  if (current.length > 0) groups.push(current);
  return groups;
}

/** Laufwörter einer Geschichte. */
export function storyWordCount(story: Story): number {
  return story.paragraphs.reduce((n, p) => n + storyTokens(p.sw).length, 0);
}

// ---------------------------------------------------------------------------
// Laden
// ---------------------------------------------------------------------------

let indexPromise: Promise<StoryIndex> | null = null;

const EMPTY_INDEX: StoryIndex = { version: 1, stories: [] };

/**
 * Den Geschichten-Index laden. Fehlt die Datei (noch keine Pipeline gelaufen,
 * oder offline ohne Cache), bleibt die Bibliothek leer statt zu scheitern.
 */
export function loadStoryIndex(): Promise<StoryIndex> {
  indexPromise ??= fetch("/stories/index.json")
    .then((r) => (r.ok ? (r.json() as Promise<StoryIndex>) : EMPTY_INDEX))
    .then((data) => (Array.isArray(data?.stories) ? data : EMPTY_INDEX))
    .catch(() => EMPTY_INDEX);
  return indexPromise;
}

const storyCache = new Map<string, Story>();

export async function loadStory(id: string): Promise<Story | null> {
  const cached = storyCache.get(id);
  if (cached) return cached;
  try {
    // Die Id kommt aus dem Index, nie aus freier Nutzereingabe — trotzdem
    // encodieren, damit die URL auch bei kaputtem Index gültig bleibt.
    const r = await fetch(`/stories/${encodeURIComponent(id)}.json`);
    if (!r.ok) return null;
    const story = (await r.json()) as Story;
    if (!story || typeof story.id !== "string" || !Array.isArray(story.paragraphs)) return null;
    storyCache.set(id, story);
    return story;
  } catch {
    return null;
  }
}

/** Nur für Tests: geladene Dateien vergessen. */
export function resetStoryCache() {
  indexPromise = null;
  storyCache.clear();
}

// ---------------------------------------------------------------------------
// Gelesen-Status
// ---------------------------------------------------------------------------

/** storyId → Zeitpunkt des Abschlusses. */
export type StoriesRead = Record<string, number>;

let readCache: StoriesRead | null = null;

export async function getStoriesRead(): Promise<StoriesRead> {
  readCache ??= (await get<StoriesRead>(K_READ).catch(() => null)) ?? {};
  return readCache;
}

export async function writeStoriesRead(map: StoriesRead): Promise<StoriesRead> {
  readCache = { ...map };
  await set(K_READ, readCache).catch(() => {});
  return readCache;
}

/** Eine Geschichte als gelesen vermerken. Der erste Abschluss zählt. */
export async function markStoryRead(id: string, now = Date.now()): Promise<StoriesRead> {
  const read = await getStoriesRead();
  if (read[id]) return read;
  return writeStoriesRead({ ...read, [id]: now });
}

/** Nur für Tests: Modul-Cache leeren. */
export function resetStoriesReadCache() {
  readCache = null;
}

// ---------------------------------------------------------------------------
// Abdeckung & Sortierung
// ---------------------------------------------------------------------------

export interface StoryListItem {
  meta: StoryMeta;
  cov: CoverageResult;
  unlocked: boolean;
  readAt?: number;
}

/**
 * Sortierung der Liste: freigeschaltete zuerst, dann die knapp verpassten
 * (die ziehen am stärksten — es fehlen nur ein paar Wörter), dann der Rest
 * nach Abdeckung. Gelesene wandern ans Ende, egal wie gut sie passen.
 */
function compareStories(a: StoryListItem, b: StoryListItem): number {
  if (!!a.readAt !== !!b.readAt) return a.readAt ? 1 : -1;
  if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
  if (a.cov.ratio !== b.cov.ratio) return b.cov.ratio - a.cov.ratio;
  return a.meta.band - b.meta.band;
}

/** Den Index gegen den eigenen Wortschatz auswerten und sortieren. */
export function buildStoryList(
  index: StoryIndex,
  vocab: VocabEntry[],
  read: StoriesRead,
): StoryListItem[] {
  const known = knownLemmas(vocab);
  return index.stories
    .map((meta) => {
      const cov = coverage({ lemmas: meta.lemmas }, known);
      return {
        meta,
        cov,
        unlocked: cov.ratio >= UNLOCK_AT,
        readAt: read[meta.id],
      };
    })
    .sort(compareStories);
}
