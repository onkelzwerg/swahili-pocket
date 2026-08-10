import type { Grade, SessionModeId, VocabEntry } from "../types";

// Entscheidung C: Jeder Übungsmodus ist ein eigenes Modul mit
// isEligible() + weight() und einer React-Komponente. Ein neuer Modus ist
// damit eine neue Datei — kein Umbau des Review-Screens.
//
// Die Typen liegen getrennt von der Registry, damit die Modus-Module sie
// importieren können, ohne einen Zyklus zur Registry aufzumachen
// (gleiche Aufteilung wie in `lib/srs/`).

/** Kontext, den der Session-Builder jeder Eignungsprüfung mitgibt. */
export interface ExerciseContext {
  /** Für diese Karte steht eine Sprachausgabe zur Verfügung. */
  hasAudio: boolean;
  /** Der gesamte Kartenbestand — Quelle für Distraktoren. */
  vocab: VocabEntry[];
}

export interface ExerciseMode {
  id: SessionModeId;
  /** Darf dieser Modus diese Karte üben? */
  isEligible(card: VocabEntry, ctx: ExerciseContext): boolean;
  /** Auswahlgewicht (0 = nie). Der Session-Builder normalisiert. */
  weight(card: VocabEntry): number;
  /**
   * Höchstanteil an einer Session (0..1). Undefiniert = keine Grenze.
   * Verhindert, dass ein anstrengender Modus die ganze Runde übernimmt.
   */
  maxShare?: number;
}

/** Zusatzinformationen, die eine Übung über ihre Bewertung mitgibt. */
export interface ExerciseResultMeta {
  /**
   * Der Nutzer hat eine als falsch gewertete Antwort selbst als richtig
   * markiert (alternative Übersetzung, die die Datenbank nicht kennt).
   * Landet im Review-Log, damit solche Lücken auffindbar bleiben.
   */
  override?: boolean;
}

/** Gemeinsame Props aller Modus-Komponenten (Plan W2.1). */
export interface ExerciseProps {
  card: VocabEntry;
  /** Genau einmal pro Karte aufrufen. */
  onResult(grade: Grade, meta?: ExerciseResultMeta): void;
  speak(text: string): Promise<void>;
  /** Kartenbestand für Modi, die Distraktoren brauchen. */
  vocab: VocabEntry[];
}
