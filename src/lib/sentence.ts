import type { NounClass, VocabEntry } from "./types";
import { nounClasses } from "./seed";
import { classAnchor, type GrammarLink } from "./grammar-anchors";
import { ADJECTIVE_STEMS, TENSES, trainableVerbs, verbStem, type Affix } from "./morphology";
import { shuffle } from "./utils";

// ---------------------------------------------------------------------------
// Generator 3 — ganze Sätze in Kongruenz setzen
// ---------------------------------------------------------------------------
//
// Verbformen und Ngeli üben je eine Form für sich. Im Satz hängen sie
// zusammen: Steht das Nomen im Plural, ziehen Adjektiv **und** Verb mit, und
// zwar mit den Silben *ihrer* Klasse — `kitabu kizuri kinaanguka` gegen
// `vitabu vizuri vinaanguka`. Genau diese Kette ist das, was Swahili von einer
// Vokabelliste unterscheidet, und einzeln geübt merkt man sie nicht.
//
// Der Satzbau ist deshalb immer derselbe: Nomen + Adjektiv + Verb. Drei
// Lücken, eine Entscheidung — der Numerus, den die Vorgabe nennt — und drei
// Formen, die daraus folgen. Wer nur eine Lücke richtig hat, hat den Satz
// nicht.
//
// Rein und mit RNG-Parameter wie die anderen Generatoren, damit testbar.

export type Numerus = "sg" | "pl";

/**
 * Die Klassen, die hier vorkommen dürfen.
 *
 * Bedingung ist ein Plural, der sich verlässlich aus dem Singular bilden lässt
 * — sonst stünde in der Aufgabe eine erfundene Form. Das schließt N- und
 * U-Klasse aus: N ist im Plural formgleich (`nyumba/nyumba`, aber
 * `rafiki/marafiki`), und der U-Plural läuft unregelmäßig über N- oder Ma-
 * (`uso/nyuso`, `ufunguo/funguo`). Beides sind Wörterbuchwissen, keine Regel.
 */
export const SENTENCE_CLASSES: NounClass[] = ["M-Wa", "M-Mi", "Ki-Vi", "Ji-Ma"];

/**
 * Adjektivpräfix je Klasse und Numerus (Zeile „veränderliche Adjektive" der
 * Konkordanztafel). Ausgeschrieben statt aus `variable.zuri` abgeleitet: die
 * Tafel führt dort die fertige Form, und `nzuri` ließe sich nicht in ein
 * Präfix zerlegen. Ji-Ma hat im Singular gar keins — `gari zuri`.
 */
const ADJ_PREFIX: Record<string, Record<Numerus, string>> = {
  "M-Wa": { sg: "m", pl: "wa" },
  "M-Mi": { sg: "m", pl: "mi" },
  "Ki-Vi": { sg: "ki", pl: "vi" },
  "Ji-Ma": { sg: "", pl: "ma" },
};

/**
 * Nur Stämme, die das Klassenpräfix wirklich annehmen.
 *
 * Die arabischen Lehnwörter aus `ADJECTIVE_STEMS` (-safi, -tamu, -gumu,
 * -chafu) sind unveränderlich: es heißt `watu safi`, nicht `watu wasafi`. Im
 * Satz stünden sie sonst mit Präfix neben einem Verb, das seines zu Recht
 * trägt — der Lerner müsste raten, welche Regel gerade gilt.
 */
const INFLECTING_STEMS = new Set([
  "-zuri",
  "-baya",
  "-dogo",
  "-kubwa",
  "-refu",
  "-fupi",
  "-pya",
  "-zito",
]);

const SENTENCE_ADJECTIVES = ADJECTIVE_STEMS.filter((a) => INFLECTING_STEMS.has(a.stem));

/**
 * Subjektpräfix je Klasse und Numerus, aus der Konkordanztafel gelesen.
 *
 * Abgeleitet statt notiert, damit Tafel und Trainer nicht auseinanderlaufen —
 * die Tafel ist die Quelle (siehe seed.ts). `a- / yu-` führt zwei Varianten;
 * für den Satz nimmt der Trainer die erste, `yu-` steht praktisch nur vor der
 * Lokativkopula.
 */
function cleanPrefix(raw: string): string {
  return raw.split("/")[0].trim().replace(/-+$/, "");
}

const SUBJECT_PREFIX: Record<string, Record<Numerus, string>> = Object.fromEntries(
  nounClasses
    .filter((c) => SENTENCE_CLASSES.includes(c.id))
    .map((c) => [
      c.id,
      { sg: cleanPrefix(c.concords[0].subject), pl: cleanPrefix(c.concords[1].subject) },
    ]),
);

const VOWEL = /[aeiou]/;

/**
 * Nomen, die trotz passender Form nicht der Regel folgen.
 *
 * `mbu`, `mbwa` und `mbuzi` stehen zwar mit M-/Wa-Konkordanz (sie sind
 * belebt), sind der Form nach aber N-Klasse und bleiben im Plural unverändert:
 * `mbwa mmoja`, `mbwa wawili`. `wabwa` gibt es nicht.
 */
const IRREGULAR_PLURALS = new Set(["mbu", "mbwa", "mbuzi"]);

/**
 * Pluralform eines Nomens — oder `null`, wenn die Regel nicht trägt.
 *
 * Bewusst streng: lieber keine Aufgabe als eine mit erfundener Form (dieselbe
 * Linie wie `canNegate` bei den Verben). Deshalb fallen die Nomen heraus, die
 * ihr Klassenpräfix gar nicht tragen — `rafiki` und `baba` stehen in M-/Wa-,
 * bilden den Plural aber nicht mit `wa-`.
 */
export function pluralNoun(swahili: string, nounClass: NounClass): string | null {
  const word = swahili.trim().toLowerCase();
  if (!word || /\s/.test(word)) return null;
  if (IRREGULAR_PLURALS.has(word)) return null;

  // Nur `m-` vor Konsonant. Die mw-Wörter bleiben bewusst draußen: sie bilden
  // den Plural uneinheitlich, je nachdem welcher Vokal folgt und ob er mit dem
  // wa- verschmilzt — `mwalimu → walimu`, aber `Mwislamu → Waislamu` und
  // `mwuguzi → wauguzi`. Eine Regel, die beides trifft, gibt es nicht; jede
  // Vereinfachung erzeugt Wörter wie `wislamu`, die es nicht gibt.
  const mConsonant = word.startsWith("m") && !VOWEL.test(word[1] ?? "") && word[1] !== "w";

  switch (nounClass) {
    // mtoto → watoto, mke → wake
    case "M-Wa":
      if (mConsonant) return `wa${word.slice(1)}`;
      return null;
    // mti → miti, mlango → milango
    case "M-Mi":
      if (mConsonant) return `mi${word.slice(1)}`;
      return null;
    // kitabu → vitabu, chakula → vyakula
    case "Ki-Vi":
      if (word.startsWith("ch") && VOWEL.test(word[2] ?? "")) return `vy${word.slice(2)}`;
      if (word.startsWith("ki")) return `vi${word.slice(2)}`;
      return null;
    // gari → magari, embe → maembe. Zwei Gruppen bleiben draußen: die
    // ji-Wörter, deren Plural in den Stamm greift (jicho → macho, jino →
    // meno), und alles, was schon mit ma- anfängt. Letzteres steht in dieser
    // Klasse durchweg bereits im Plural oder ist ein Stoffname ohne Singular
    // — `maji`, `maziwa`, `matunda`, `maisha`. `mamaji` wäre kein Plural,
    // sondern ein erfundenes Wort.
    case "Ji-Ma":
      if (word.startsWith("ji") || word.startsWith("ma")) return null;
      return `ma${word}`;
    default:
      return null;
  }
}

/** Kongruente Adjektivform für Klasse und Numerus. */
export function sentenceAdjective(
  nounClass: NounClass,
  stem: string,
  numerus: Numerus,
): string | null {
  const prefix = ADJ_PREFIX[nounClass]?.[numerus];
  if (prefix === undefined) return null;
  return prefix + stem.slice(1);
}

/** Kongruente Verbform: Subjektpräfix + Zeitmarker + Stamm. */
export function sentenceVerb(
  nounClass: NounClass,
  numerus: Numerus,
  tense: string,
  stem: string,
): string | null {
  const subject = SUBJECT_PREFIX[nounClass]?.[numerus];
  if (!subject) return null;
  return subject + tense + stem;
}

// ---------------------------------------------------------------------------
// Damit die Sätze etwas bedeuten
// ---------------------------------------------------------------------------
//
// Nomen und Verb frei zu kombinieren ergibt formal richtige, inhaltlich aber
// alberne Sätze: `vitabu vinakula` — „die Bücher essen". Wer so etwas übt,
// liest über die Bedeutung hinweg, und genau das soll die Übung ja gerade
// nicht antrainieren.
//
// Jedes Verb führt deshalb auf, was als Subjekt zu ihm passt, und jedes Nomen
// sagt, was es ist. Gepaart wird nur, was zusammengeht.
//
// Bewusst eine Aufzählung und keine Rangfolge „Sache < Tier < Mensch": Die
// Skala geht nicht in eine Richtung. `kula` verlangt ein Lebewesen, aber
// `kuharibika` das Gegenteil — ein Gerät geht kaputt, ein Mensch nicht.
// Mit einer Rangfolge stünde am Ende „die Tansanier sind kaputtgegangen".

/** Was ein Satzsubjekt sein kann. */
export type SubjectKind = "thing" | "animal" | "human";

const ALL: SubjectKind[] = ["thing", "animal", "human"];
/** Alles, was lebt. */
const ANIMATE: SubjectKind[] = ["animal", "human"];
/** Nur Sachen. */
const THINGS: SubjectKind[] = ["thing"];
/** Nur Menschen. */
const PEOPLE: SubjectKind[] = ["human"];

/**
 * Die Verben, die in einem Satz dieser Bauart stehen dürfen — mit der Stufe,
 * die ihr Subjekt mindestens haben muss.
 *
 * Zwei Bedingungen, und beide sind nötig:
 *
 * 1. **Intransitiv.** Der Satz ist Nomen + Adjektiv + Verb, mehr nicht. Ein
 *    Verb, das ein Objekt verlangt, bricht darin ab: `mtalii anapenda` ist
 *    „der Tourist liebt —" und wartet auf den Rest. Geübt werden soll die
 *    Kongruenz, nicht ein halber Satz.
 * 2. **Passendes Subjekt.** `thing` geht mit allem, `animal` braucht ein
 *    Lebewesen, `human` einen Menschen. Ein Hund schläft und frisst; lesen
 *    und in Rente gehen tut er nicht.
 *
 * Was hier nicht steht, kommt im Satztrainer nicht vor — auch eigene Vokabeln
 * nicht. Das ist Absicht: Ob ein Verb ein Objekt braucht, steht in keiner
 * Karteikarte, und Raten hieße, schiefe Sätze einzuüben.
 */
const SENTENCE_VERBS: Record<string, SubjectKind[]> = {
  // Was allem zustoßen kann.
  kuanguka: ALL, // fallen
  kubaki: ALL, // bleiben
  kupungua: ALL, // weniger werden, abnehmen

  // Nur Sachen. Ein Gerät geht kaputt und brennt, ein Mensch nicht.
  // „anfangen", „dauern" und „stattfinden" fehlen: sie verlangen ein Ereignis
  // als Subjekt, und ob ein Nomen ein Ereignis bezeichnet, steht nirgends —
  // „der See findet statt" wäre die Folge.
  kufaa: THINGS, // taugen, passen
  kuharibika: THINGS, // kaputtgehen
  kuwaka: THINGS, // brennen, an sein

  // Lebewesen, Tiere eingeschlossen. Die Bewegungsverben stehen hier und nicht
  // bei den Sachen: Ein Bus kommt an, ein Stadtteil nicht, und welches Ding
  // sich von selbst bewegt, weiß die Karteikarte nicht.
  kuamka: ANIMATE, // aufwachen
  kuchelewa: ANIMATE, // sich verspäten
  kucheza: ANIMATE, // spielen
  kufa: ANIMATE, // sterben
  kufika: ANIMATE, // ankommen
  kuishi: ANIMATE, // leben
  kuja: ANIMATE, // kommen
  kukaa: ANIMATE, // sitzen, wohnen
  kula: ANIMATE, // essen
  kulala: ANIMATE, // schlafen
  kunywa: ANIMATE, // trinken
  kuoga: ANIMATE, // baden
  kuogelea: ANIMATE, // schwimmen
  kuondoka: ANIMATE, // weggehen
  kupita: ANIMATE, // vorbeigehen
  kusimama: ANIMATE, // stehen bleiben
  kutembea: ANIMATE, // laufen, wandern
  kwenda: ANIMATE, // gehen

  // Nur Menschen. „in Rente gehen" und „kündigen" fehlen bewusst: sie setzen
  // ein Amt oder ein Arbeitsverhältnis voraus, und „das Kind ist in Rente
  // gegangen" wäre wieder ein Satz, über dessen Bedeutung man hinwegliest.
  kucheka: PEOPLE, // lachen
  kufanikiwa: PEOPLE, // Erfolg haben
  kufurahi: PEOPLE, // sich freuen
  kuhama: PEOPLE, // umziehen
  kuharakisha: PEOPLE, // sich beeilen
  kuimba: PEOPLE, // singen
  kuingia: PEOPLE, // einsteigen
  kukohoa: PEOPLE, // husten
  kukutana: PEOPLE, // sich treffen
  kulia: PEOPLE, // weinen
  kuongea: PEOPLE, // sprechen
  kupumzika: PEOPLE, // ausspannen
  kurudi: PEOPLE, // zurückkommen
  kusafiri: PEOPLE, // reisen
  kusali: PEOPLE, // beten
  kushirikiana: PEOPLE, // zusammenarbeiten
  kushtuka: PEOPLE, // erschrecken
  kushuka: PEOPLE, // aussteigen
  kuteremka: PEOPLE, // aussteigen
  kutulia: PEOPLE, // sich beruhigen
  kuzungumza: PEOPLE, // sich unterhalten
};

/**
 * Tiere und Ähnliches in der M-/Wa-Klasse.
 *
 * Die Klasse heißt „Menschen", führt aber auch Tiere — und `mwanasesere`, die
 * Puppe. Grammatisch verhalten sie sich wie Personen, im Satz taugen sie nur
 * für das, was ein Lebewesen tut. Eine kurze Ausnahmeliste reicht: alles
 * andere in M-/Wa- ist eine Person.
 */
const ANIMAL_NOUNS = new Set([
  "mbu",
  "mbuzi",
  "mbwa",
  "mdudu",
  "mnyama",
  "mwanasesere",
  "mwana-sesere",
]);

/**
 * Was dieses Nomen als Subjekt hergibt.
 *
 * Die Belebtheit steckt in der Nomenklasse — das ist keine Hilfskonstruktion,
 * sondern der Zweck der M-/Wa-Klasse („Personen, Lebewesen"). Alles in den
 * übrigen drei Satzklassen ist eine Sache.
 */
export function nounKind(swahili: string, nounClass: NounClass): SubjectKind {
  if (nounClass !== "M-Wa") return "thing";
  return ANIMAL_NOUNS.has(swahili.trim().toLowerCase()) ? "animal" : "human";
}

/**
 * Welche Subjekte zu diesem Verb passen — leer, wenn es für einen Satz dieser
 * Bauart gar nicht taugt (siehe `SENTENCE_VERBS`).
 */
export function verbSubjects(infinitive: string): SubjectKind[] {
  return SENTENCE_VERBS[infinitive.trim().toLowerCase()] ?? [];
}

/** Passt dieses Verb zu diesem Subjekt? */
export function fitsSubject(noun: VocabEntry, verb: VocabEntry): boolean {
  const kind = nounKind(noun.swahili, noun.nounClass as NounClass);
  return verbSubjects(verb.swahili).includes(kind);
}

/** Nomen aus dem eigenen Bestand, die sich für einen Satz eignen. */
export function sentenceNouns(vocab: VocabEntry[]): VocabEntry[] {
  return vocab.filter(
    (v) =>
      v.partOfSpeech === "noun" &&
      v.nounClass !== undefined &&
      SENTENCE_CLASSES.includes(v.nounClass) &&
      pluralNoun(v.swahili, v.nounClass) !== null,
  );
}

/** Eine Lücke im Satz. */
export interface SentenceSlot {
  role: "noun" | "adjective" | "verb";
  answer: string;
  /** Zur Auswahl gestellte Formen, gemischt. */
  options: string[];
}

export interface SentenceTask {
  kind: "sentence";
  /** Karte, aus der das Nomen stammt — für den Log-Eintrag. */
  cardId: string;
  nounClass: NounClass;
  numerus: Numerus;
  tense: Affix;
  /** Die drei Lücken in Satzreihenfolge. */
  slots: SentenceSlot[];
  /** Der fertige Satz. */
  answer: string;
  /** Deutsche Vorgabe — was der Satz sagen soll. */
  gloss: { noun: string; adjective: string; verb: string };
  /** Wohin der „Warum?"-Link springt. */
  explain: GrammarLink;
}

function pick<T>(list: T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

/** Ein Nomen mit einem Verb, das dazu passt. */
export interface SentencePair {
  noun: VocabEntry;
  verb: VocabEntry;
}

/**
 * Alle sinnvollen Nomen-Verb-Paare aus dem eigenen Bestand.
 *
 * Erst paaren, dann ziehen — nicht umgekehrt. Zöge der Generator zuerst ein
 * Nomen und suchte dann ein Verb, liefe er bei einem Bestand ohne passendes
 * Verb ins Leere und müsste raten, wie oft er es noch einmal versucht. So ist
 * die Frage „gibt es überhaupt eine Aufgabe?" dieselbe wie „ist diese Liste
 * leer?" — und der Leerzustand kann sagen, was fehlt.
 */
export function sentencePairs(vocab: VocabEntry[]): SentencePair[] {
  const nouns = sentenceNouns(vocab);
  const verbs = trainableVerbs(vocab);
  const pairs: SentencePair[] = [];
  for (const noun of nouns) {
    for (const verb of verbs) {
      if (fitsSubject(noun, verb)) pairs.push({ noun, verb });
    }
  }
  return pairs;
}

/**
 * Ablenker aus den *anderen* Klassen und dem anderen Numerus.
 *
 * Genau die Verwechslung, um die es geht: Die falschen Formen sind alle
 * echte Swahili-Formen — nur eben die einer anderen Klasse. Wer rät, statt die
 * Kongruenz zu lesen, greift daneben.
 */
function concordDistractors(
  correct: string,
  nounClass: NounClass,
  numerus: Numerus,
  form: (cls: NounClass, num: Numerus) => string | null,
): string[] {
  const out: string[] = [];
  const add = (v: string | null) => {
    if (v && v !== correct && !out.includes(v)) out.push(v);
  };
  // Zuerst der andere Numerus derselben Klasse — der häufigste Fehler.
  add(form(nounClass, numerus === "sg" ? "pl" : "sg"));
  for (const other of SENTENCE_CLASSES) {
    if (other === nounClass) continue;
    add(form(other, numerus));
  }
  for (const other of SENTENCE_CLASSES) {
    if (other === nounClass) continue;
    add(form(other, numerus === "sg" ? "pl" : "sg"));
  }
  return out;
}

/**
 * Einen Satz bauen. Gibt `null` zurück, wenn der Bestand nicht reicht — es
 * braucht ein Nomen einer Satzklasse **und** ein Verb.
 */
export function buildSentenceTask(
  vocab: VocabEntry[],
  rng: () => number = Math.random,
  /** Ohne Angabe entscheidet der RNG — gesetzt vor allem für Tests. */
  forceNumerus?: Numerus,
): SentenceTask | null {
  const pairs = sentencePairs(vocab);
  if (pairs.length === 0) return null;

  const { noun, verb } = pick(pairs, rng);
  const nounClass = noun.nounClass as NounClass;
  const adjective = pick(SENTENCE_ADJECTIVES, rng);
  const tense = pick(TENSES, rng);
  const numerus: Numerus = forceNumerus ?? (rng() < 0.5 ? "sg" : "pl");

  const singular = noun.swahili.trim().toLowerCase();
  const plural = pluralNoun(singular, nounClass);
  if (!plural) return null;

  const { stem } = verbStem(verb.swahili);
  const nounForm = numerus === "sg" ? singular : plural;
  const adjectiveForm = sentenceAdjective(nounClass, adjective.stem, numerus);
  const verbForm = sentenceVerb(nounClass, numerus, tense.sw, stem);
  if (!adjectiveForm || !verbForm) return null;

  const slots: SentenceSlot[] = [
    {
      role: "noun",
      answer: nounForm,
      // Nur zwei Formen: Der Numerus steht in der Vorgabe, diese Lücke ist der
      // Anker. Die Arbeit steckt darin, ihn durch den Satz durchzuhalten.
      options: shuffle([singular, plural], rng),
    },
    {
      role: "adjective",
      answer: adjectiveForm,
      options: shuffle(
        [
          adjectiveForm,
          ...concordDistractors(adjectiveForm, nounClass, numerus, (c, n) =>
            sentenceAdjective(c, adjective.stem, n),
          ).slice(0, 3),
        ],
        rng,
      ),
    },
    {
      role: "verb",
      answer: verbForm,
      options: shuffle(
        [
          verbForm,
          ...concordDistractors(verbForm, nounClass, numerus, (c, n) =>
            sentenceVerb(c, n, tense.sw, stem),
          ).slice(0, 3),
        ],
        rng,
      ),
    },
  ];

  return {
    kind: "sentence",
    cardId: noun.id,
    nounClass,
    numerus,
    tense,
    slots,
    answer: [nounForm, adjectiveForm, verbForm].join(" "),
    gloss: { noun: noun.german, adjective: adjective.de, verb: verb.german },
    // Die Adjektivzeile der Klasse — dort steht die Kongruenz, an der der ganze
    // Satz hängt.
    explain: { to: "/classes", hash: classAnchor(nounClass, "variable") },
  };
}
