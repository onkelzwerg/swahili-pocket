export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "other";

export type NounClass = "M-Wa" | "M-Mi" | "Ki-Vi" | "N" | "U" | "Pa-Ku-Mu" | "Ji-Ma" | "Ku";

export interface Example {
  sw: string;
  de: string;
}

/** Antwortstufen einer Wiederholung. 1 = Nochmal, 2 = Schwer, 3 = Gut, 4 = Einfach. */
export type Grade = 1 | 2 | 3 | 4;

/** Übungsmodi einer Review-Session (Registry in `lib/exercises/`). */
export type SessionModeId = "flip" | "typed" | "audio" | "cloze";

/**
 * Aufgabentypen des Morphologie-Trainers (W2.7). Sie laufen nicht über den
 * Scheduler — sie stehen nur im Log, damit Meilensteine sie sehen.
 */
export type TrainerModeId = "morph-verb" | "morph-ngeli" | "morph-sentence";

/** Übungsmodus eines Log-Eintrags. */
export type ExerciseModeId = SessionModeId | TrainerModeId;

export type SchedulerId = "leitner" | "fsrs";

/** FSRS-Zustand einer Karte. Wird parallel zum Leitner-Zustand immer mitgeführt. */
export interface FsrsState {
  /** Gedächtnisstabilität in Tagen. */
  stability: number;
  /** Schwierigkeit 1..10. */
  difficulty: number;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review" | "relearning";
  /** FSRS-eigenes Fälligkeitsdatum (ms). */
  due: number;
}

export interface VocabEntry {
  id: string;
  /** Reference to shared_vocab pool entry; undefined for private (manually added) vocab. */
  sharedId?: string;
  /** True when the vocab was manually added by the user and is not part of the shared pool. */
  isPrivate?: boolean;
  swahili: string;
  german: string;
  partOfSpeech: PartOfSpeech;
  nounClass?: NounClass;
  examples: Example[];
  box: 1 | 2 | 3 | 4 | 5;
  /** Fälligkeit des AKTIVEN Schedulers (Invariante, siehe lib/srs/index.ts). */
  nextReview: number;
  createdAt: number;
  updatedAt?: number;
  /** False when the underlying pool entry has been deactivated by an admin. */
  sharedIsActive?: boolean;
  /** FSRS-Parallelzustand. Fehlt bei nie reviewten Karten → aus box ableiten. */
  fsrs?: FsrsState;
  /** Leitner-eigenes Fälligkeitsdatum (ms). */
  leitnerDue?: number;
  /** Zeitpunkt des letzten Reviews (für elapsedDays). */
  lastReviewAt?: number;
  /** Gesetzt, sobald ein erfolgreicher Abruf mit ≥7 Tagen Abstand gelang ("gefestigt"). */
  maturedAt?: number;
}

export interface UserStats {
  streak: number;
  lastReviewDate: string;
  totalReviewed: number;
  xp: number;
  /** ISO-Daten (yyyy-mm-dd) der Lerntage der laufenden Woche (Mo–So). */
  weekDays: string[];
  /** Streak-Joker: 0..2. Ein verpasster Tag verbraucht automatisch einen. */
  freezes: number;
  /** Gesamtzahl der Tage mit mindestens einem Review (Basis für Freeze-Verdienst). */
  totalDaysLearned: number;
  /** Datum, an dem zuletzt ein Freeze verdient wurde (alle 7 Lerntage einer). */
  lastFreezeEarned?: string;
  /** Transient (nie persistiert): Rückkehr nach ≥7 Tagen Pause. */
  comeback?: boolean;
}

/** Ein Eintrag im append-only Review-Log (`log:reviews`). */
export interface ReviewLogEntry {
  id: string;
  cardId: string;
  ts: number;
  grade: Grade;
  mode: ExerciseModeId;
  /** Zeit seit letztem Review in Tagen (0 bei Erstreview). */
  elapsedDays: number;
  /** Aktiver Scheduler zum Zeitpunkt der Antwort. */
  scheduler: SchedulerId;
  /** Zustand NACH dem Review (Debug/Statistik). */
  newBox: number;
  newStability?: number;
  newDue: number;
  /**
   * Der Nutzer hat eine als falsch geprüfte Antwort selbst als richtig
   * markiert (W2.3). Macht Lücken in den Zielformen der Datenbank auffindbar.
   */
  override?: boolean;
}

export type DialogueSpeaker = "A" | "B" | "C";

/**
 * Eine Antwortmöglichkeit im Rollenspiel (W3.4). Distraktoren werden
 * redaktionell gepflegt, nicht zur Laufzeit erzeugt — offline nutzbar und in
 * der Qualität kontrollierbar. Sie sind *plausibel* falsch (falsche
 * Höflichkeitsform, falsche Zeit, unpassende Antwort), und `feedback` sagt in
 * einem Satz, warum.
 *
 * Seit W4.5 stehen sie **nicht mehr am Zug**, sondern in
 * public/dialogues/<id>.json neben dem Glossar (`DialogueData.choices`).
 * Text und Aufgabe sind zwei Dinge: der Text ist Bestand, die Aufgaben wachsen
 * nach. Nebeneffekt: die Distraktoren landen nicht im JS-Bündel, sondern werden
 * erst geladen, wenn jemand wirklich mitspielt.
 */
export interface DialogueChoice {
  sw: string;
  de: string;
  correct: boolean;
  feedback?: string;
}

export interface DialogueTurn {
  speaker: DialogueSpeaker;
  sw: string;
  de: string;
}

export interface Dialogue {
  id: string;
  title: string;
  titleDe: string;
  emoji: string;
  turns: DialogueTurn[];
  /** Map Sprecher → VoiceProfile.id (siehe src/lib/voices.ts). */
  voiceMap?: Record<string, string>;
  level?: "beginner" | "intermediate" | "advanced";
}

/**
 * Eine Spalte der Konkordanztafel — in der Regel Singular und Plural einer
 * Klasse, bei den Ortsklassen die drei Varianten Pa-/Ku-/Mu-.
 *
 * Leerer String heißt: Die Tafel führt für diese Zelle keine Form. Das ist
 * keine Lücke in den Daten, sondern die Aussage „gibt es so nicht" (etwa
 * `-moja` im Plural).
 */
export interface ConcordSet {
  /** Spaltenkopf, z. B. „Singular" oder „Pa- (bestimmte Stelle)". */
  label: string;
  /** Subjektpräfix [S-], bejaht. */
  subject: string;
  /** Subjektpräfix, verneint (`ha` + S). */
  subjectNegative: string;
  /** Genitiv-Konkordanz S+a — „des/der/von". */
  genitive: string;
  /** Objektaffix im Verb. */
  object: string;
  /** Relativsilbe S+o — die Silbe im Relativsatz und in `amba-`. */
  relative: string;
  /** Possessiva S+ -angu … -ao. */
  possessive: {
    my: string;
    your: string;
    his: string;
    our: string;
    yourPl: string;
    their: string;
  };
  /** Demonstrativa und Verwandtes. */
  demonstrative: {
    /** h+S — „dieses (hier)". */
    near: string;
    /** S+le — „jenes (dort)". */
    far: string;
    /** h+R — das bereits Erwähnte. */
    referential: string;
    /** R bzw. R+te — „irgendein", „welcher auch immer". */
    any: string;
    /** ndi+R — emphatische Form („genau der/das"). */
    emphatic: string;
  };
  /** Veränderliche Adjektive, Zahl- und Fragewörter. */
  variable: {
    /** -zuri „gut, schön" (Klassenpräfix [K-]). */
    zuri: string;
    /** -moja „ein(e)". */
    moja: string;
    /** -wili „zwei". */
    wili: string;
    /** -ngapi „wie viele". */
    ngapi: string;
    /** -ingine „andere, einige". */
    ingine: string;
    /** -ote „alle, ganz" (Subjektkonkordanz [S-]). */
    ote: string;
    /** -eupe „weiß". */
    eupe: string;
    /** -pi „welche". */
    pi: string;
    /** -enye „habend, besitzend". */
    enye: string;
    /** -enyewe „selbst, selber". */
    enyewe: string;
  };
}

/**
 * Personalkonkordanz (ich, du, wir, ihr) — in der Tafel stehen sie als eigene
 * Zeilen in der M-/Wa-Klasse, weil Personen dieser Klasse folgen. Possessiv,
 * Demonstrativ und Adjektiv sind dort identisch mit Klasse 1 bzw. 2, nur
 * Subjekt-, Objekt- und Relativform unterscheiden sich.
 */
export interface PersonalConcord {
  label: string;
  subject: string;
  subjectNegative: string;
  object: string;
  relative: string;
}

export interface NounClassInfo {
  id: NounClass;
  name: string;
  singular: string;
  plural: string;
  meaning: string;
  /** Die vollständige Konkordanztafel dieser Klasse. */
  concords: ConcordSet[];
  /** Nur M-/Wa-: die Personalformen ich/du/wir/ihr. */
  personal?: PersonalConcord[];
  /**
   * Lokativkopula „ist (da)" — die -ko/-po/-mo-Formen dieser Klasse.
   *
   * Sie kongruieren mit dem Subjekt, nicht mit dem Ort, und gehören deshalb
   * auf jede Klasse: `kitabu kiko wapi?`, `watu wako nje`, `mtoto yumo ndani`.
   * -po = an einer bestimmten Stelle, -ko = irgendwo/allgemein, -mo = darin.
   */
  locative: { sg: string; pl: string };
  examples: { sw: string; de: string }[];
}
