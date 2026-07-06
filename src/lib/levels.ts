// CEFR-orientierte Level-Schwellen, basierend auf Forschung zum rezeptiven
// Wortschatz für Fremdsprachenlernende (u. a. Milton 2010, Nation 2006,
// Council of Europe / English Profile, Goethe-Institut Wortlisten).
// Da die Sprünge zwischen den CEFR-Stufen sehr groß werden, sind A2–C2
// jeweils in 2–3 Teilstufen unterteilt, damit der Fortschritt motivierend
// fühlbar bleibt.
export interface LevelDef {
  /** Anzeigename, z. B. "A2.1" */
  name: string;
  /** CEFR-Hauptstufe */
  cefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  /** Anzahl gelernter Wörter, ab der diese Stufe erreicht ist */
  threshold: number;
  /** Kurzbeschreibung für die UI */
  label: string;
}

export const LEVELS: LevelDef[] = [
  { name: "A1.1", cefr: "A1", threshold: 0, label: "Erste Wörter" },
  { name: "A1.2", cefr: "A1", threshold: 150, label: "Alltagswortschatz" },
  { name: "A1", cefr: "A1", threshold: 350, label: "Grundwortschatz" },
  { name: "A2.1", cefr: "A2", threshold: 600, label: "Einfache Gespräche" },
  { name: "A2.2", cefr: "A2", threshold: 900, label: "Vertraute Themen" },
  { name: "A2", cefr: "A2", threshold: 1200, label: "Solides Fundament" },
  { name: "B1.1", cefr: "B1", threshold: 1600, label: "Selbstständig sprechen" },
  { name: "B1.2", cefr: "B1", threshold: 2100, label: "Erweiterter Wortschatz" },
  { name: "B1", cefr: "B1", threshold: 2700, label: "Mittelstufe erreicht" },
  { name: "B2.1", cefr: "B2", threshold: 3400, label: "Fließend im Alltag" },
  { name: "B2.2", cefr: "B2", threshold: 4200, label: "Komplexe Themen" },
  { name: "B2", cefr: "B2", threshold: 5000, label: "Obere Mittelstufe" },
  { name: "C1.1", cefr: "C1", threshold: 6500, label: "Differenziert" },
  { name: "C1.2", cefr: "C1", threshold: 8000, label: "Akademisch" },
  { name: "C1", cefr: "C1", threshold: 9500, label: "Fortgeschritten" },
  { name: "C2.1", cefr: "C2", threshold: 11500, label: "Nahe Muttersprache" },
  { name: "C2.2", cefr: "C2", threshold: 14000, label: "Sehr breit" },
  { name: "C2", cefr: "C2", threshold: 16000, label: "Muttersprachliches Niveau" },
];

export interface LevelProgress {
  current: LevelDef;
  next: LevelDef | null;
  /** gelernte Wörter (Wortschatzgröße) */
  knownWords: number;
  /** Wörter innerhalb der aktuellen Stufe */
  wordsInLevel: number;
  /** benötigte Wörter, um die nächste Stufe zu erreichen */
  wordsForNextLevel: number;
  /** Fortschritt 0..1 in der aktuellen Stufe */
  progress: number;
}

export function getLevelProgress(knownWords: number): LevelProgress {
  let currentIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (knownWords >= LEVELS[i].threshold) {
      currentIdx = i;
      break;
    }
  }
  const current = LEVELS[currentIdx];
  const next = LEVELS[currentIdx + 1] ?? null;
  const wordsInLevel = knownWords - current.threshold;
  const wordsForNextLevel = next ? next.threshold - current.threshold : 0;
  const progress = next ? Math.min(1, wordsInLevel / wordsForNextLevel) : 1;
  return { current, next, knownWords, wordsInLevel, wordsForNextLevel, progress };
}
