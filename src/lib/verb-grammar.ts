// Referenzdaten zur Verbgrammatik (Zeitformen, Verneinung, Modi).
//
// Gegenstück zur Konkordanztafel in `seed.ts`: Der Trainer lässt Verbformen
// bauen, nachlesen konnte man die Regeln bisher nirgends. Alles hier ist
// reine Anzeige-Daten — die Formenbildung des Trainers lebt in `morphology.ts`.
//
// Die `id` jedes Eintrags ist zugleich der Anker in `/verbs` (z. B.
// `/verbs#tense-na`), damit der Trainer aus einer Aufgabe heraus genau auf die
// passende Erklärung springen kann.

export interface VerbExample {
  sw: string;
  de: string;
}

export interface TenseInfo {
  /** Anker: `/verbs#tense-<id>`. */
  id: string;
  /** Zeitmarker, wie er im Verb steht. */
  marker: string;
  name: string;
  meaning: string;
  /** Bauplan der Form. */
  pattern: string;
  examples: VerbExample[];
  /** Die verneinte Entsprechung — null, wo es keine eigene Bildung gibt. */
  negative: { pattern: string; example: VerbExample } | null;
  note?: string;
}

/** Der Bauplan, aus dem jede Verbform entsteht. */
export const verbStructure = {
  slots: ["Subjekt", "Zeit", "(Objekt)", "Stamm"],
  example: {
    parts: ["a", "na", "ni", "saidia"],
    sw: "ananisaidia",
    de: "er/sie hilft mir",
  },
  note:
    "Der Stamm ist der Infinitiv ohne ku-: kusoma → soma. Einsilbige Verben " +
    "behalten das ku- als Betonungsträger.",
};

/** Subjekt- und Objektpräfixe der Personen — Klassen siehe Konkordanztafel. */
export const personPrefixes: {
  label: string;
  subject: string;
  subjectNegative: string;
  object: string;
}[] = [
  { label: "ich", subject: "ni-", subjectNegative: "si-", object: "-ni-" },
  { label: "du", subject: "u-", subjectNegative: "hu-", object: "-ku-" },
  { label: "er/sie", subject: "a-", subjectNegative: "ha-", object: "-m(w)-" },
  { label: "wir", subject: "tu-", subjectNegative: "hatu-", object: "-tu-" },
  { label: "ihr", subject: "m-", subjectNegative: "ham-", object: "-wa-" },
  { label: "sie (Pl.)", subject: "wa-", subjectNegative: "hawa-", object: "-wa-" },
];

export const verbTenses: TenseInfo[] = [
  {
    id: "na",
    marker: "-na-",
    name: "Präsens",
    meaning: "Was gerade passiert oder allgemein gilt.",
    pattern: "S + na + Stamm",
    examples: [
      { sw: "ninasoma", de: "ich lese" },
      { sw: "tunakula", de: "wir essen" },
      { sw: "wanafanya kazi", de: "sie arbeiten" },
    ],
    negative: {
      pattern: "ha+S + Stamm (-a → -i)",
      example: { sw: "sisomi", de: "ich lese nicht" },
    },
    note:
      "Daneben gibt es die knappe Form mit -a-: nasoma, twasoma, wasoma. " +
      "Sie klingt schriftsprachlich und wird im Alltag meist durch -na- ersetzt.",
  },
  {
    id: "li",
    marker: "-li-",
    name: "Vergangenheit",
    meaning: "Abgeschlossenes: was gestern, letztes Jahr, damals geschah.",
    pattern: "S + li + Stamm",
    examples: [
      { sw: "nilisoma", de: "ich las" },
      { sw: "alikuja jana", de: "er/sie kam gestern" },
      { sw: "tulikuwa nyumbani", de: "wir waren zu Hause" },
    ],
    negative: {
      pattern: "ha+S + ku + Stamm",
      example: { sw: "sikusoma", de: "ich las nicht" },
    },
  },
  {
    id: "me",
    marker: "-me-",
    name: "Perfekt",
    meaning: "Das Ergebnis zählt: etwas ist geschehen und wirkt jetzt.",
    pattern: "S + me + Stamm",
    examples: [
      { sw: "nimesoma", de: "ich habe gelesen" },
      { sw: "amefika", de: "er/sie ist angekommen" },
      { sw: "wamechoka", de: "sie sind müde (geworden)" },
    ],
    negative: {
      pattern: "ha+S + ja + Stamm",
      example: { sw: "sijasoma", de: "ich habe noch nicht gelesen" },
    },
    note: "„Schon“ wird mit -sha- verstärkt: ameshafika / amekwisha fika — er ist schon da.",
  },
  {
    id: "ta",
    marker: "-ta-",
    name: "Futur",
    meaning: "Was kommen wird.",
    pattern: "S + ta + Stamm",
    examples: [
      { sw: "nitasoma", de: "ich werde lesen" },
      { sw: "utakuja kesho?", de: "kommst du morgen?" },
      { sw: "watasafiri", de: "sie werden reisen" },
    ],
    negative: {
      pattern: "ha+S + ta + Stamm",
      example: { sw: "sitasoma", de: "ich werde nicht lesen" },
    },
  },
  {
    id: "hu",
    marker: "hu-",
    name: "Habitual",
    meaning: "Was gewohnheitsmäßig immer wieder geschieht.",
    pattern: "hu + Stamm (ohne Subjektpräfix!)",
    examples: [
      { sw: "yeye husoma kila siku", de: "er/sie liest jeden Tag" },
      { sw: "watoto hucheza hapa", de: "Kinder spielen hier (für gewöhnlich)" },
      { sw: "hupenda chai", de: "man mag (üblicherweise) Tee" },
    ],
    negative: {
      pattern: "wie das verneinte Präsens",
      example: { sw: "hasomi kila siku", de: "er/sie liest nicht jeden Tag" },
    },
    note:
      "Die Form trägt keine Person — wer gemeint ist, muss danebenstehen " +
      "(yeye, watoto …). Achtung: Dieses hu- ist nicht das verneinende hu- " +
      "der 2. Person; dort steht ein Zeitmarker-loses Verb mit -i am Ende.",
  },
  {
    id: "ki",
    marker: "-ki-",
    name: "Bedingung / Gleichzeitigkeit",
    meaning: "„wenn“ oder „während“ — der Nebensatz steckt im Verb.",
    pattern: "S + ki + Stamm",
    examples: [
      { sw: "akija, tutaondoka", de: "wenn er kommt, gehen wir" },
      { sw: "nikisoma, sisikii kitu", de: "während ich lese, höre ich nichts" },
    ],
    negative: {
      pattern: "S + si + po + Stamm",
      example: { sw: "usipokuja", de: "wenn du nicht kommst" },
    },
  },
  {
    id: "ka",
    marker: "-ka-",
    name: "Erzählform",
    meaning: "„und dann“ — reiht Handlungen in einer Erzählung aneinander.",
    pattern: "S + ka + Stamm",
    examples: [
      { sw: "alikuja akasoma", de: "er kam und las dann" },
      { sw: "tulikwenda tukanunua chakula", de: "wir gingen und kauften dann Essen" },
    ],
    negative: null,
  },
  {
    id: "nge",
    marker: "-nge- / -ngali-",
    name: "Konditional",
    meaning: "Was wäre, wenn — Gegenwart mit -nge-, Vergangenheit mit -ngali-.",
    pattern: "S + nge/ngali + Stamm",
    examples: [
      { sw: "ningesoma", de: "ich würde lesen" },
      { sw: "ningalisoma", de: "ich hätte gelesen" },
      { sw: "kama ungekuja, ungeona", de: "wenn du kämst, würdest du sehen" },
    ],
    negative: {
      pattern: "S + si + nge/ngali + Stamm",
      example: { sw: "nisingesoma", de: "ich würde nicht lesen" },
    },
  },
];

/** Die Verneinung im Überblick — eine Zeile je Zeitform. */
export const negationRows: {
  tenseId: string;
  tense: string;
  affirmative: VerbExample;
  negative: VerbExample;
  rule: string;
}[] = [
  {
    tenseId: "na",
    tense: "Präsens",
    affirmative: { sw: "ninasoma", de: "ich lese" },
    negative: { sw: "sisomi", de: "ich lese nicht" },
    rule: "Zeitmarker fällt weg, Endung -a wird -i",
  },
  {
    tenseId: "li",
    tense: "Vergangenheit",
    affirmative: { sw: "nilisoma", de: "ich las" },
    negative: { sw: "sikusoma", de: "ich las nicht" },
    rule: "-li- wird zu -ku-",
  },
  {
    tenseId: "me",
    tense: "Perfekt",
    affirmative: { sw: "nimesoma", de: "ich habe gelesen" },
    negative: { sw: "sijasoma", de: "ich habe noch nicht gelesen" },
    rule: "-me- wird zu -ja- („noch nicht“)",
  },
  {
    tenseId: "ta",
    tense: "Futur",
    affirmative: { sw: "nitasoma", de: "ich werde lesen" },
    negative: { sw: "sitasoma", de: "ich werde nicht lesen" },
    rule: "-ta- bleibt",
  },
];

export const negationInfo = {
  /** Die verneinten Subjektpräfixe der Personen. */
  rule:
    "Verneint wird am Subjektpräfix: ni- → si-, u- → hu-, a- → ha-, tu- → hatu-, " +
    "m- → ham-, wa- → hawa-. Für die Nomenklassen steht dieselbe Spalte in der " +
    "Konkordanztafel (haki-, hazi-, hau- …).",
  vowelNote:
    "Nur Verben auf -a wechseln im verneinten Präsens zu -i: soma → sisomi. " +
    "Lehnwörter behalten ihren Endvokal: sisahau (kusahau), sijibu (kujibu), " +
    "sifikiri (kufikiri), sisamehe (kusamehe).",
  persons: [
    { sw: "sisomi", de: "ich lese nicht" },
    { sw: "husomi", de: "du liest nicht" },
    { sw: "hasomi", de: "er/sie liest nicht" },
    { sw: "hatusomi", de: "wir lesen nicht" },
    { sw: "hamsomi", de: "ihr lest nicht" },
    { sw: "hawasomi", de: "sie lesen nicht" },
  ] as VerbExample[],
};

/** Imperativ und Konjunktiv — die beiden Aufforderungsformen. */
export const moodInfo = {
  imperative: {
    id: "imperative",
    rule: "Singular = blanker Stamm, Plural = Stamm + -eni.",
    examples: [
      { sw: "soma!", de: "lies!" },
      { sw: "someni!", de: "lest!" },
      { sw: "karibu, kaa!", de: "willkommen, setz dich!" },
    ] as VerbExample[],
    irregular: [
      { sw: "njoo! / njooni!", de: "komm! / kommt! (kuja)" },
      { sw: "nenda! / nendeni!", de: "geh! / geht! (kwenda)" },
      { sw: "lete!", de: "bring! (kuleta)" },
      { sw: "kula! / la!", de: "iss! (kula — beide Formen sind gebräuchlich)" },
    ] as VerbExample[],
    note:
      "Sobald ein Objekt im Verb steht, wird aus dem Imperativ ein Konjunktiv: " +
      "nisaidie! — hilf mir!",
  },
  subjunctive: {
    id: "subjunctive",
    rule: "Subjektpräfix + Stamm mit Endung -e, ohne Zeitmarker.",
    examples: [
      { sw: "niende", de: "ich soll gehen" },
      { sw: "lazima tusome", de: "wir müssen lernen" },
      { sw: "ili upate kazi", de: "damit du Arbeit bekommst" },
      { sw: "twende!", de: "lass uns gehen!" },
    ] as VerbExample[],
    negative: [
      { sw: "usiende", de: "geh nicht" },
      { sw: "nisisahau", de: "damit ich nicht vergesse" },
    ] as VerbExample[],
    note: "Verneint wird mit -si- zwischen Subjekt und Stamm.",
  },
};

/** Objektinfix — steht zwischen Zeitmarker und Stamm. */
export const objectInfixInfo = {
  id: "object",
  rule: "S + Zeit + Objekt + Stamm. Bei Personen ist das Objekt oft Pflicht, nicht Kür.",
  examples: [
    { sw: "ninakupenda", de: "ich liebe dich" },
    { sw: "anamwona", de: "er/sie sieht ihn/sie" },
    { sw: "tunawasaidia", de: "wir helfen ihnen" },
    { sw: "nitakisoma", de: "ich werde es (das Buch) lesen" },
  ] as VerbExample[],
  note: "Für Nomen richtet sich das Infix nach der Klasse — Spalte „Objektpräfix“ der Ngeli-Tafel.",
};

/** Relativformen — Infix im Verb oder amba-. */
export const relativeInfo = {
  id: "relative",
  rule: "Entweder als Silbe im Verb oder mit amba- davor. Beides ist korrekt.",
  examples: [
    { sw: "kitabu ninachosoma", de: "das Buch, das ich lese" },
    { sw: "kitabu ambacho ninasoma", de: "dasselbe mit amba-" },
    { sw: "mtu anayefanya kazi", de: "der Mensch, der arbeitet" },
    { sw: "watu waliokuja", de: "die Leute, die gekommen sind" },
  ] as VerbExample[],
  note: "Welche Silbe eine Klasse nimmt, steht in der Ngeli-Tafel unter „Relativsilbe“.",
};
