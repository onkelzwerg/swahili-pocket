import type { NounClass, VocabEntry } from "./types";
import { isMonosyllabicVerb } from "./seed";
import { shuffle } from "./utils";

// Aufgabengenerator für den Morphologie-Trainer (W2.7).
//
// Das Differenzierungsmerkmal der App: Swahili ist agglutinierend — wer die
// Bausteine beherrscht, kann Formen bilden, die er nie gelernt hat. Karteikarten
// üben das nicht. Der Trainer erzeugt Aufgaben aus dem eigenen Wortschatz,
// deshalb geht ihm nie der Stoff aus.
//
// Alles hier ist rein und nimmt einen RNG entgegen — damit testbar.

// ---------------------------------------------------------------------------
// Generator 1 — Verbformen bauen
// ---------------------------------------------------------------------------

export interface Affix {
  sw: string;
  de: string;
}

export const SUBJECTS: Affix[] = [
  { sw: "ni", de: "ich" },
  { sw: "u", de: "du" },
  { sw: "a", de: "er/sie" },
  { sw: "tu", de: "wir" },
  { sw: "m", de: "ihr" },
  { sw: "wa", de: "sie (Pl.)" },
];

export const TENSES: Affix[] = [
  { sw: "na", de: "Präsens" },
  { sw: "li", de: "Vergangenheit" },
  { sw: "ta", de: "Futur" },
  { sw: "me", de: "Perfekt" },
];

export interface VerbTask {
  kind: "verb";
  /** Karte, aus der die Aufgabe entstand — für den Log-Eintrag. */
  cardId: string;
  subject: Affix;
  tense: Affix;
  /** Das zugrunde liegende Verb (Infinitiv, wie es in der Kartei steht). */
  infinitive: string;
  german: string;
  /** Baustein, der an die Präfixe gehängt wird (bei einsilbigen Verben mit ku-). */
  stem: string;
  /** Die erwartete Form. */
  answer: string;
  /** Die drei Bausteine in korrekter Reihenfolge. */
  solution: [string, string, string];
  /** Bausteine für den Chip-Modus: Lösung + zwei Distraktoren, gemischt. */
  chips: string[];
  /** Einsilbiges Verb — das ku- bleibt als Betonungsträger erhalten. */
  monosyllabic: boolean;
}

/**
 * Verbstamm aus dem Infinitiv.
 * Einsilbige Verben (kula, kunywa, kwenda …) behalten das ku- in den meisten
 * Zeiten — `ninakula`, nicht `ninala`. Die Liste dafür lebt schon in seed.ts.
 */
export function verbStem(infinitive: string): { stem: string; monosyllabic: boolean } {
  const word = infinitive.trim().toLowerCase();
  if (isMonosyllabicVerb(word)) return { stem: word, monosyllabic: true };
  // ku- oder kw- (vor vokalischem Stamm: kuandika → kwandika-Schreibweise
  // kommt vor, der Stamm ist in beiden Fällen das, was nach zwei Zeichen folgt).
  return { stem: word.replace(/^k[uw]/, ""), monosyllabic: false };
}

/** Verben aus dem eigenen Bestand, die sich für den Trainer eignen. */
export function trainableVerbs(vocab: VocabEntry[]): VocabEntry[] {
  return vocab.filter((v) => {
    const word = v.swahili.trim();
    return v.partOfSpeech === "verb" && /^k[uw]./i.test(word) && !/\s/.test(word);
  });
}

function pick<T>(list: T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

export function buildVerbTask(
  verbs: VocabEntry[],
  rng: () => number = Math.random,
): VerbTask | null {
  const usable = trainableVerbs(verbs);
  if (usable.length === 0) return null;

  const verb = pick(usable, rng);
  const subject = pick(SUBJECTS, rng);
  const tense = pick(TENSES, rng);
  const { stem, monosyllabic } = verbStem(verb.swahili);

  const solution: [string, string, string] = [subject.sw, tense.sw, stem];
  // Distraktor-Chips: ein anderes Subjekt- und ein anderes Zeitpräfix.
  const otherSubject = pick(
    SUBJECTS.filter((s) => s.sw !== subject.sw),
    rng,
  );
  const otherTense = pick(
    TENSES.filter((t) => t.sw !== tense.sw),
    rng,
  );

  return {
    kind: "verb",
    cardId: verb.id,
    subject,
    tense,
    infinitive: verb.swahili,
    german: verb.german,
    stem,
    answer: solution.join(""),
    solution,
    chips: shuffle([...solution, otherSubject.sw, otherTense.sw], rng),
    monosyllabic,
  };
}

// ---------------------------------------------------------------------------
// Generator 2 — Ngeli-Kongruenz
// ---------------------------------------------------------------------------

export interface AdjectiveStem {
  /** Wie im Wörterbuch notiert, z. B. "-zuri". */
  stem: string;
  de: string;
  /**
   * Kuratierte Formen für Klassen, in denen die Konkordanz nicht schlicht
   * Präfix + Stamm ist. Immer nötig für die N-Klasse: dort verschmilzt der
   * Nasal mit dem Anlaut (`-refu` → `ndefu`), verschwindet vor stimmlosen
   * Konsonanten (`-kubwa` → `kubwa`) oder wird zu m- (`-baya` → `mbaya`).
   * Ji-Ma nimmt vor einsilbigen Stämmen ein ji- dazu (`gari jipya`).
   */
  forms: Partial<Record<NounClass, string>>;
}

/**
 * Bewusst nur konsonantisch anlautende Stämme. Vokalisch anlautende
 * (`-eupe`, `-eusi`) lösen Gleitlaute aus (`mweupe`, `cheupe`, `nyeupe`) —
 * das ist eine eigene Regel und gehört in eine spätere Ausbaustufe.
 */
export const ADJECTIVE_STEMS: AdjectiveStem[] = [
  { stem: "-zuri", de: "schön", forms: { N: "nzuri" } },
  { stem: "-baya", de: "schlecht", forms: { N: "mbaya" } },
  { stem: "-dogo", de: "klein", forms: { N: "ndogo" } },
  { stem: "-kubwa", de: "groß", forms: { N: "kubwa" } },
  { stem: "-refu", de: "lang", forms: { N: "ndefu" } },
  { stem: "-fupi", de: "kurz", forms: { N: "fupi" } },
  { stem: "-pya", de: "neu", forms: { N: "mpya", "Ji-Ma": "jipya" } },
  { stem: "-gumu", de: "schwierig", forms: { N: "ngumu" } },
  { stem: "-tamu", de: "süß", forms: { N: "tamu" } },
  { stem: "-chafu", de: "schmutzig", forms: { N: "chafu" } },
  { stem: "-zito", de: "schwer", forms: { N: "nzito" } },
  { stem: "-safi", de: "sauber", forms: { N: "safi" } },
];

/**
 * Adjektiv-Konkordanz im Singular je Nomenklasse.
 *
 * Pa-Ku-Mu (Ortsklassen) und Ku (Verbalnomen) fehlen bewusst: sie treten mit
 * Adjektiven praktisch nicht auf, geübte Formen wären konstruiert.
 */
const ADJECTIVE_CONCORD: Partial<Record<NounClass, string>> = {
  "M-Wa": "m",
  "M-Mi": "m",
  "Ki-Vi": "ki",
  "Ji-Ma": "",
  // Die N-Klasse hat kein produktives Präfix — ihre Formen stehen am Stamm.
  N: undefined,
  U: "m",
};

export const NGELI_TRAINABLE_CLASSES = Object.keys(ADJECTIVE_CONCORD) as NounClass[];

/** Kongruente Adjektivform im Singular. */
export function adjectiveForm(nounClass: NounClass, adjective: AdjectiveStem): string | null {
  const curated = adjective.forms[nounClass];
  if (curated) return curated;
  if (!NGELI_TRAINABLE_CLASSES.includes(nounClass)) return null;
  const prefix = ADJECTIVE_CONCORD[nounClass];
  if (prefix === undefined) return null;
  return prefix + adjective.stem.slice(1);
}

export interface NgeliTask {
  kind: "ngeli";
  /** Karte, aus der die Aufgabe entstand — für den Log-Eintrag. */
  cardId: string;
  noun: string;
  nounGerman: string;
  nounClass: NounClass;
  adjective: AdjectiveStem;
  answer: string;
  /** Vier Optionen: richtige Form + Konkordanzformen anderer Klassen. */
  options: string[];
}

/** Nomen aus dem eigenen Bestand, deren Klasse der Trainer abdeckt. */
export function trainableNouns(vocab: VocabEntry[]): VocabEntry[] {
  return vocab.filter(
    (v) =>
      v.partOfSpeech === "noun" &&
      v.nounClass !== undefined &&
      NGELI_TRAINABLE_CLASSES.includes(v.nounClass) &&
      !/\s/.test(v.swahili.trim()),
  );
}

export function buildNgeliTask(
  nouns: VocabEntry[],
  rng: () => number = Math.random,
): NgeliTask | null {
  const usable = trainableNouns(nouns);
  if (usable.length === 0) return null;

  const noun = pick(usable, rng);
  const nounClass = noun.nounClass as NounClass;
  const adjective = pick(ADJECTIVE_STEMS, rng);
  const answer = adjectiveForm(nounClass, adjective);
  if (!answer) return null;

  // Distraktoren: dasselbe Adjektiv in den Formen anderer Klassen — genau die
  // Verwechslung, die geübt werden soll.
  const distractors: string[] = [];
  for (const other of NGELI_TRAINABLE_CLASSES) {
    if (other === nounClass) continue;
    const form = adjectiveForm(other, adjective);
    if (form && form !== answer && !distractors.includes(form)) distractors.push(form);
  }
  // Plural-Formen als Auffüllung, falls zu wenige Singularformen abweichen.
  for (const extra of [`vi${adjective.stem.slice(1)}`, `wa${adjective.stem.slice(1)}`]) {
    if (distractors.length >= 3) break;
    if (extra !== answer && !distractors.includes(extra)) distractors.push(extra);
  }

  return {
    kind: "ngeli",
    cardId: noun.id,
    noun: noun.swahili,
    nounGerman: noun.german,
    nounClass,
    adjective,
    answer,
    options: shuffle([answer, ...shuffle(distractors, rng).slice(0, 3)], rng),
  };
}

export type TrainerTask = VerbTask | NgeliTask;

/** Nach so vielen richtigen Antworten in Folge wird der Tipp-Modus angeboten. */
export const TYPING_UNLOCK_RUN = 5;
