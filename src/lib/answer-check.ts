// Antwortprüfung mit Tipptoleranz (W2.2).
//
// Anforderung: Die meisten Nutzer tippen Swahili auf einer deutschen Tastatur.
// Ein fehlendes Apostroph in `ng'ombe` oder ein vertauschtes Buchstabenpaar
// ist ein Tippfehler, kein Wissenslücke — und darf nicht wie eine falsche
// Antwort behandelt werden. Umgekehrt darf `kupa` nicht als `kula`
// durchgehen: bei kurzen Wörtern ist ein Buchstabe der ganze Unterschied.
//
// Alle Stufen sind reine Funktionen und einzeln getestet.

export type CheckVerdict = "exact" | "typo" | "wrong";

export interface CheckResult {
  verdict: CheckVerdict;
  /** Korrekt geschriebene Zielform für die Anzeige. */
  expected: string;
  /** Welche Alternative gematcht hat (bei mehreren Zielformen). */
  matched?: string;
  /** Editierdistanz zur besten Zielform (0 bei exact). */
  distance: number;
}

// ---------------------------------------------------------------------------
// 1. Normalisieren
// ---------------------------------------------------------------------------

/** Apostroph-Varianten, die Tastaturen und Copy-Paste produzieren. */
const APOSTROPHES = /[’‘‛´`ʼ]/g;
/** Satzzeichen, die am Wortrand nichts zur Antwort beitragen. */
const EDGE_PUNCTUATION = /^[.,!?;:¿¡"„“”\s]+|[.,!?;:"„“”\s]+$/g;

export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFC")
    .replace(APOSTROPHES, "'")
    .toLowerCase()
    .replace(EDGE_PUNCTUATION, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Für den Apostroph-freien Vergleich: `ng'ombe` → `ngombe`. */
function withoutApostrophes(text: string): string {
  return text.replace(/'/g, "");
}

// ---------------------------------------------------------------------------
// 2. Zielvarianten expandieren
// ---------------------------------------------------------------------------

export interface TargetVariant {
  /** Anzeigeform dieser Alternative (Klammern aufgelöst, Original-Schreibung). */
  display: string;
  /** Akzeptierte, normalisierte Schreibweisen dieser Alternative. */
  forms: string[];
}

/** `(ku)soma` → [`kusoma`, `soma`]. Mehrere Klammern werden kombiniert. */
function expandOptionalParts(text: string): string[] {
  const m = /\(([^()]*)\)/.exec(text);
  if (!m) return [text];
  const withPart = text.slice(0, m.index) + m[1] + text.slice(m.index + m[0].length);
  const withoutPart = text.slice(0, m.index) + text.slice(m.index + m[0].length);
  return [...expandOptionalParts(withPart), ...expandOptionalParts(withoutPart)];
}

/**
 * Ein Zielstring kann mehrere gültige Antworten enthalten:
 * Alternativen an `,` `/` `;` und optionale Teile in Klammern.
 */
export function expandTargets(target: string): TargetVariant[] {
  const alternatives = target
    .split(/[,/;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const variants: TargetVariant[] = [];
  for (const alt of alternatives) {
    const expanded = expandOptionalParts(alt).map((s) => s.replace(/\s+/g, " ").trim());
    const forms = [...new Set(expanded.map(normalizeAnswer))].filter(Boolean);
    if (forms.length === 0) continue;
    // Anzeigeform ist die vollständige Variante (Klammerinhalt behalten).
    variants.push({ display: expanded[0], forms });
  }
  return variants;
}

// ---------------------------------------------------------------------------
// 3. Damerau-Levenshtein (Optimal String Alignment)
// ---------------------------------------------------------------------------

/**
 * Editierdistanz mit Transposition. Bewusst selbst implementiert statt einer
 * Dependency — es sind vierzig Zeilen und die Schwellen wollen wir kennen.
 */
export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const d: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) d[i][0] = i;
  for (let j = 0; j <= b.length; j++) d[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // Löschen
        d[i][j - 1] + 1, // Einfügen
        d[i - 1][j - 1] + cost, // Ersetzen
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // Transposition
      }
    }
  }
  return d[a.length][b.length];
}

// ---------------------------------------------------------------------------
// 4. Toleranzschwellen
// ---------------------------------------------------------------------------

/** Bis zu dieser Wortlänge zählt jeder Buchstabe als Bedeutungsträger. */
const SHORT_WORD_MAX = 4;

/** Erlaubte Editierdistanz nach Länge der Zielform. */
export function typoThreshold(targetLength: number): number {
  if (targetLength <= 3) return 0;
  if (targetLength <= 6) return 1;
  return 2;
}

/** Gleiche Buchstabenmenge? Dann war es eine Vertauschung, keine Verwechslung. */
function sameLetters(a: string, b: string): boolean {
  return [...a].sort().join("") === [...b].sort().join("");
}

/**
 * Zählt die Abweichung noch als Tippfehler?
 *
 * Zusatzregel für kurze Wörter: `kula` und `kupa` haben Distanz 1 und Länge 4 —
 * die Schwelle allein würde das durchwinken, obwohl es zwei verschiedene
 * Vokabeln sind. Bei ≤ 4 Zeichen akzeptieren wir deshalb nur Vertauschungen
 * (gleiche Buchstabenmenge), keine Ersetzungen.
 */
export function isTypo(input: string, target: string, distance: number): boolean {
  if (distance === 0) return true;
  if (distance > typoThreshold(target.length)) return false;
  if (target.length <= SHORT_WORD_MAX) return sameLetters(input, target);
  return true;
}

// ---------------------------------------------------------------------------
// 5. Korrektur-Anzeige
// ---------------------------------------------------------------------------

export interface CorrectionChar {
  char: string;
  /** true = dieses Zeichen fehlte in der Eingabe oder stand dort anders. */
  changed: boolean;
}

/**
 * Zielwort zeichenweise gegen die Eingabe stellen, damit die Korrektur die
 * abweichenden Stellen markieren kann. Über die längste gemeinsame
 * Teilfolge — eine reine Indexpaarung würde nach einem fehlenden Buchstaben
 * den ganzen Rest als falsch anzeigen.
 */
export function highlightCorrection(input: string, expected: string): CorrectionChar[] {
  const a = normalizeAnswer(input);
  const b = expected;
  const bLower = normalizeAnswer(expected);

  // LCS-Tabelle über die normalisierten Formen.
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(bLower.length + 1).fill(0),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= bLower.length; j++) {
      lcs[i][j] =
        a[i - 1] === bLower[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }

  const keep = new Set<number>();
  let i = a.length;
  let j = bLower.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === bLower[j - 1]) {
      keep.add(j - 1);
      i--;
      j--;
    } else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  // Über die Anzeigeform iterieren; der Index passt, solange Normalisierung
  // die Länge nicht ändert. Sonst lieber alles als unverändert zeigen.
  if (bLower.length !== b.length) return [...b].map((char) => ({ char, changed: false }));
  return [...b].map((char, idx) => ({ char, changed: !keep.has(idx) }));
}

// ---------------------------------------------------------------------------
// Öffentliche API
// ---------------------------------------------------------------------------

/**
 * Eingabe gegen eine (ggf. mehrdeutige) Zielangabe prüfen.
 * Die beste Übereinstimmung gewinnt: exact schlägt typo, kleinere Distanz
 * schlägt größere.
 */
export function checkAnswer(input: string, target: string): CheckResult {
  const variants = expandTargets(target);
  const fallbackDisplay = variants[0]?.display ?? target.trim();
  const normalizedInput = normalizeAnswer(input);

  if (!normalizedInput || variants.length === 0) {
    return { verdict: "wrong", expected: fallbackDisplay, distance: Infinity };
  }

  let best: CheckResult = { verdict: "wrong", expected: fallbackDisplay, distance: Infinity };

  for (const variant of variants) {
    for (const form of variant.forms) {
      // Apostroph-frei ist exact, kein Tippfehler: das Zeichen fehlt auf
      // deutschen Tastaturen schlicht — `ngombe` für `ng'ombe` ist richtig.
      if (
        normalizedInput === form ||
        withoutApostrophes(normalizedInput) === withoutApostrophes(form)
      ) {
        return {
          verdict: "exact",
          expected: variant.display,
          matched: variant.display,
          distance: 0,
        };
      }

      const distance = damerauLevenshtein(normalizedInput, form);
      if (distance >= best.distance) continue;
      const verdict: CheckVerdict = isTypo(normalizedInput, form, distance) ? "typo" : "wrong";
      best = {
        verdict,
        expected: variant.display,
        distance,
        ...(verdict === "typo" ? { matched: variant.display } : {}),
      };
    }
  }

  // Bei "wrong" ist die erste Alternative die Anzeigeform — nicht die zufällig
  // nächstgelegene, sonst zeigen wir bei Unsinn eine willkürliche Variante.
  if (best.verdict === "wrong") return { ...best, expected: fallbackDisplay };
  return best;
}
