import type { NounClass, VocabEntry } from "./types";
import { isMonosyllabicVerb, nounClasses } from "./seed";
import { classAnchor, negationAnchor, tenseAnchor, type GrammarLink } from "./grammar-anchors";
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

/** Verneinte Subjektpräfixe — die Zeile „verneint" der Konkordanztafel. */
export const NEGATIVE_SUBJECTS: Record<string, string> = {
  ni: "si",
  u: "hu",
  a: "ha",
  tu: "hatu",
  m: "ham",
  wa: "hawa",
};

/**
 * Zeitmarker in der Verneinung. Das Präsens hat keinen — dort trägt die
 * Endung die Verneinung (-a → -i), deshalb der leere String.
 */
export const NEGATIVE_TENSES: Record<string, string> = {
  na: "",
  li: "ku",
  ta: "ta",
  me: "ja",
};

export type Polarity = "affirmative" | "negative";

/** Verneinter Präsensstamm: soma → somi. Lehnwörter behalten ihren Endvokal. */
export function negativeStem(stem: string): string {
  return stem.endsWith("a") ? `${stem.slice(0, -1)}i` : stem;
}

/**
 * Die Bausteine einer verneinten Form in der richtigen Reihenfolge.
 * Präsens: [si, somi] — sonst: [si, ku, soma].
 *
 * Einsilbige Verben geben ihr ku- ab, wo ein anderer Marker es ersetzt:
 * `sikula` (si+ku+la), `sijala` (si+ja+la) — im Futur bleibt es stehen,
 * weil -ta- die Betonung nicht trägt: `sitakula`.
 */
export function negativeParts(
  subject: string,
  tense: string,
  stem: string,
  monosyllabic = false,
): string[] {
  const neg = NEGATIVE_SUBJECTS[subject];
  const marker = NEGATIVE_TENSES[tense];
  if (marker === "") return [neg, negativeStem(stem)];
  const bare = monosyllabic && tense !== "ta" ? stem.replace(/^ku/, "") : stem;
  return [neg, marker, bare];
}

/**
 * Lässt sich diese Kombination sauber aus Bausteinen verneinen?
 *
 * Zwei Ausnahmen bei einsilbigen Verben: Das verneinte Präsens ist
 * unregelmäßig (kula → sili, kufa → sifi), und kw-Verben verschmelzen mit dem
 * Marker (si + ku + enda → sikwenda) — beides taugt nicht zum Zusammensetzen.
 */
export function canNegate(infinitive: string, monosyllabic: boolean, tense: string): boolean {
  if (!monosyllabic) return true;
  if (tense === "na") return false;
  return !/^kw/i.test(infinitive.trim());
}

export interface VerbTask {
  kind: "verb";
  /** Karte, aus der die Aufgabe entstand — für den Log-Eintrag. */
  cardId: string;
  subject: Affix;
  tense: Affix;
  /** Bejaht oder verneint — die Verneinung hat eigene Bausteine. */
  polarity: Polarity;
  /** Das zugrunde liegende Verb (Infinitiv, wie es in der Kartei steht). */
  infinitive: string;
  german: string;
  /** Baustein, der an die Präfixe gehängt wird (bei einsilbigen Verben mit ku-). */
  stem: string;
  /** Die erwartete Form. */
  answer: string;
  /** Die Bausteine in korrekter Reihenfolge (zwei bis drei). */
  solution: string[];
  /** Bausteine für den Chip-Modus: Lösung + zwei Distraktoren, gemischt. */
  chips: string[];
  /** Einsilbiges Verb — das ku- bleibt als Betonungsträger erhalten. */
  monosyllabic: boolean;
  /** Wohin der „Warum?"-Link springt. */
  explain: GrammarLink;
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

/** Anteil verneinter Verbaufgaben. Bejaht bleibt der Normalfall. */
const NEGATIVE_SHARE = 0.4;

export function buildVerbTask(
  verbs: VocabEntry[],
  rng: () => number = Math.random,
  /** Ohne Angabe entscheidet der RNG — gesetzt vor allem für Tests. */
  forcePolarity?: Polarity,
): VerbTask | null {
  const usable = trainableVerbs(verbs);
  if (usable.length === 0) return null;

  const verb = pick(usable, rng);
  const subject = pick(SUBJECTS, rng);
  const tense = pick(TENSES, rng);
  const { stem, monosyllabic } = verbStem(verb.swahili);
  // Wo sich die Verneinung nicht sauber aus Bausteinen bauen lässt, bleibt die
  // Aufgabe bejaht — falsche Formen einzuüben wäre schlimmer als keine.
  const negatable = canNegate(verb.swahili, monosyllabic, tense.sw);
  const wanted = forcePolarity ?? (rng() < NEGATIVE_SHARE ? "negative" : "affirmative");
  const polarity: Polarity = wanted === "negative" && negatable ? "negative" : "affirmative";

  const solution =
    polarity === "negative"
      ? negativeParts(subject.sw, tense.sw, stem, monosyllabic)
      : [subject.sw, tense.sw, stem];

  // Distraktor-Chips. Bejaht: ein anderes Subjekt- und Zeitpräfix. Verneint:
  // genau die bejahten Bausteine — das ist der Fehler, den man macht.
  const otherSubject = pick(
    SUBJECTS.filter((s) => s.sw !== subject.sw),
    rng,
  );
  const otherTense = pick(
    TENSES.filter((t) => t.sw !== tense.sw),
    rng,
  );
  const pool =
    polarity === "negative"
      ? [subject.sw, tense.sw, otherTense.sw, otherSubject.sw]
      : [otherSubject.sw, otherTense.sw];
  // Im Futur ist der verneinte Marker derselbe wie der bejahte — dann läge er
  // doppelt in der Auswahl. Alles, was schon in der Lösung steckt, fliegt raus.
  const distractors = pool.filter((p) => !solution.includes(p)).slice(0, 2);

  return {
    kind: "verb",
    cardId: verb.id,
    subject,
    tense,
    polarity,
    infinitive: verb.swahili,
    german: verb.german,
    stem,
    answer: solution.join(""),
    solution,
    chips: shuffle([...solution, ...distractors], rng),
    monosyllabic,
    explain: {
      to: "/verbs",
      hash: polarity === "negative" ? negationAnchor(tense.sw) : tenseAnchor(tense.sw),
    },
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

/**
 * Was an dem Nomen kongruieren soll. Alle vier Varianten stammen aus derselben
 * Konkordanztafel — wer nur Adjektive übt, merkt nicht, dass Possessiv,
 * Demonstrativ und Genitiv derselben Logik folgen.
 */
export type NgeliVariant = "adjective" | "possessive" | "demonstrative" | "genitive";

export interface NgeliTask {
  kind: "ngeli";
  variant: NgeliVariant;
  /** Karte, aus der die Aufgabe entstand — für den Log-Eintrag. */
  cardId: string;
  noun: string;
  nounGerman: string;
  nounClass: NounClass;
  /** Was gesucht ist, auf Deutsch: „schön", „mein", „dieses (hier)" … */
  cue: string;
  /** Wort hinter der Lücke — nur der Genitiv braucht eines („cha mwalimu"). */
  tail: string;
  /** Nur bei der Adjektivvariante gesetzt. */
  adjective?: AdjectiveStem;
  answer: string;
  /** Vier Optionen: richtige Form + Konkordanzformen anderer Klassen. */
  options: string[];
  /** Wohin der „Warum?"-Link springt. */
  explain: GrammarLink;
}

/** Konkordanzsätze je Klasse — Nachschlagewerk für die Nicht-Adjektiv-Varianten. */
const CONCORD_BY_CLASS = new Map(nounClasses.map((c) => [c.id, c.concords]));

/** Die gesuchte Form einer Klasse, im Singular. */
function concordForm(nounClass: NounClass, variant: NgeliVariant): string | null {
  const sets = CONCORD_BY_CLASS.get(nounClass);
  if (!sets || sets.length === 0) return null;
  const sg = sets[0];
  switch (variant) {
    case "possessive":
      return sg.possessive.my || null;
    case "demonstrative":
      return sg.demonstrative.near || null;
    case "genitive":
      return sg.genitive || null;
    default:
      return null;
  }
}

/** Dieselbe Form im Plural — als Auffüllung für die Antwortoptionen. */
function concordFormPlural(nounClass: NounClass, variant: NgeliVariant): string | null {
  const sets = CONCORD_BY_CLASS.get(nounClass);
  if (!sets || sets.length < 2) return null;
  const pl = sets[1];
  switch (variant) {
    case "possessive":
      return pl.possessive.my || null;
    case "demonstrative":
      return pl.demonstrative.near || null;
    case "genitive":
      return pl.genitive || null;
    default:
      return null;
  }
}

const VARIANT_CUES: Record<Exclude<NgeliVariant, "adjective">, string> = {
  possessive: "mein",
  demonstrative: "dieses hier",
  genitive: "des/der",
};

/** Possessor hinter dem Genitiv — ein Wort, das in jeder Klasse passt. */
const GENITIVE_TAIL = "mwalimu";

const VARIANT_SECTION: Record<NgeliVariant, "base" | "demonstrative" | "possessive" | "variable"> =
  {
    adjective: "variable",
    possessive: "possessive",
    demonstrative: "demonstrative",
    genitive: "base",
  };

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

export const NGELI_VARIANTS: NgeliVariant[] = [
  "adjective",
  "possessive",
  "demonstrative",
  "genitive",
];

export function buildNgeliTask(
  nouns: VocabEntry[],
  rng: () => number = Math.random,
  /** Ohne Angabe zieht der Generator eine Variante — derselbe RNG, damit testbar. */
  forceVariant?: NgeliVariant,
): NgeliTask | null {
  const usable = trainableNouns(nouns);
  if (usable.length === 0) return null;

  const variant = forceVariant ?? pick(NGELI_VARIANTS, rng);
  const noun = pick(usable, rng);
  const nounClass = noun.nounClass as NounClass;

  const adjective = variant === "adjective" ? pick(ADJECTIVE_STEMS, rng) : undefined;
  const answer = adjective ? adjectiveForm(nounClass, adjective) : concordForm(nounClass, variant);
  if (!answer) return null;

  // Distraktoren: dieselbe Form in den anderen Klassen — genau die
  // Verwechslung, die geübt werden soll.
  const distractors: string[] = [];
  const add = (form: string | null) => {
    if (form && form !== answer && !distractors.includes(form)) distractors.push(form);
  };
  for (const other of NGELI_TRAINABLE_CLASSES) {
    if (other === nounClass) continue;
    add(adjective ? adjectiveForm(other, adjective) : concordForm(other, variant));
  }
  // Pluralformen als Auffüllung, falls zu wenige Singularformen abweichen.
  if (distractors.length < 3) {
    if (adjective) {
      for (const extra of [`vi${adjective.stem.slice(1)}`, `wa${adjective.stem.slice(1)}`])
        add(extra);
    } else {
      for (const cls of NGELI_TRAINABLE_CLASSES) add(concordFormPlural(cls, variant));
    }
  }

  return {
    kind: "ngeli",
    variant,
    cardId: noun.id,
    noun: noun.swahili,
    nounGerman: noun.german,
    nounClass,
    cue: adjective ? adjective.de : VARIANT_CUES[variant as Exclude<NgeliVariant, "adjective">],
    tail: variant === "genitive" ? GENITIVE_TAIL : "",
    adjective,
    answer,
    options: shuffle([answer, ...shuffle(distractors, rng).slice(0, 3)], rng),
    explain: { to: "/classes", hash: classAnchor(nounClass, VARIANT_SECTION[variant]) },
  };
}

export type TrainerTask = VerbTask | NgeliTask;

/** Nach so vielen richtigen Antworten in Folge wird der Tipp-Modus angeboten. */
export const TYPING_UNLOCK_RUN = 5;
