import { describe, expect, it } from "vitest";
import {
  SENTENCE_CLASSES,
  buildSentenceTask,
  fitsSubject,
  nounKind,
  pluralNoun,
  sentenceAdjective,
  sentenceNouns,
  sentencePairs,
  sentenceVerb,
  verbSubjects,
} from "../sentence";
import { makeCard } from "./helpers";
import type { NounClass, VocabEntry } from "../types";

/** Deterministischer RNG (LCG) — wie in morphology.test.ts. */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function noun(swahili: string, nounClass: NounClass, german = "Ding"): VocabEntry {
  return makeCard({ id: swahili, swahili, german, partOfSpeech: "noun", nounClass });
}

function verb(swahili: string, german = "tun"): VocabEntry {
  return makeCard({ id: swahili, swahili, german, partOfSpeech: "verb" });
}

describe("pluralNoun", () => {
  it("bildet die regelmäßigen Plurale der vier Satzklassen", () => {
    expect(pluralNoun("mtoto", "M-Wa")).toBe("watoto");
    expect(pluralNoun("mgeni", "M-Wa")).toBe("wageni");
    expect(pluralNoun("mke", "M-Wa")).toBe("wake");
    expect(pluralNoun("Mjerumani", "M-Wa")).toBe("wajerumani");

    expect(pluralNoun("mti", "M-Mi")).toBe("miti");
    expect(pluralNoun("mlango", "M-Mi")).toBe("milango");

    expect(pluralNoun("kitabu", "Ki-Vi")).toBe("vitabu");
    // ki- vor Vokal steht als ch-, der Plural als vy-.
    expect(pluralNoun("chakula", "Ki-Vi")).toBe("vyakula");

    expect(pluralNoun("gari", "Ji-Ma")).toBe("magari");
    expect(pluralNoun("embe", "Ji-Ma")).toBe("maembe");
  });

  it("verweigert die Fälle, in denen die Regel nicht trägt", () => {
    // M-/Wa-Nomen ohne Klassenpräfix: der Plural ist Wörterbuchwissen.
    expect(pluralNoun("rafiki", "M-Wa")).toBeNull();
    expect(pluralNoun("baba", "M-Wa")).toBeNull();
    // mw- ist uneinheitlich: walimu, aber Waislamu und wauguzi. Eine Regel für
    // beides gibt es nicht, also bleiben sie alle draußen.
    expect(pluralNoun("mwalimu", "M-Wa")).toBeNull();
    expect(pluralNoun("Mwislamu", "M-Wa")).toBeNull();
    expect(pluralNoun("mwaka", "M-Mi")).toBeNull();
    // Belebte N-Klasse-Formen: mbwa bleibt mbwa, „wabwa" gibt es nicht.
    expect(pluralNoun("mbwa", "M-Wa")).toBeNull();
    expect(pluralNoun("mbuzi", "M-Wa")).toBeNull();
    // ji-Wörter greifen in den Stamm: jicho → macho, nicht majicho.
    expect(pluralNoun("jicho", "Ji-Ma")).toBeNull();
    // …und was schon ma- trägt, steht bereits im Plural: maji, nicht mamaji.
    expect(pluralNoun("maji", "Ji-Ma")).toBeNull();
    expect(pluralNoun("matunda", "Ji-Ma")).toBeNull();
    // N- und U-Klasse sind gar nicht zugelassen.
    expect(pluralNoun("nyumba", "N")).toBeNull();
    expect(pluralNoun("uso", "U")).toBeNull();
    // Mehrwortbegriffe.
    expect(pluralNoun("mwana mfalme", "M-Wa")).toBeNull();
  });
});

describe("sentenceAdjective", () => {
  it("setzt das Klassenpräfix je Numerus", () => {
    expect(sentenceAdjective("M-Wa", "-zuri", "sg")).toBe("mzuri");
    expect(sentenceAdjective("M-Wa", "-zuri", "pl")).toBe("wazuri");
    expect(sentenceAdjective("Ki-Vi", "-dogo", "sg")).toBe("kidogo");
    expect(sentenceAdjective("Ki-Vi", "-dogo", "pl")).toBe("vidogo");
    expect(sentenceAdjective("M-Mi", "-refu", "pl")).toBe("mirefu");
    // Ji-Ma trägt im Singular kein Präfix: gari zuri.
    expect(sentenceAdjective("Ji-Ma", "-zuri", "sg")).toBe("zuri");
    expect(sentenceAdjective("Ji-Ma", "-zuri", "pl")).toBe("mazuri");
  });
});

describe("sentenceVerb", () => {
  it("nimmt das Subjektpräfix der Klasse, nicht das der Person", () => {
    expect(sentenceVerb("M-Wa", "sg", "na", "soma")).toBe("anasoma");
    expect(sentenceVerb("M-Wa", "pl", "na", "soma")).toBe("wanasoma");
    expect(sentenceVerb("Ki-Vi", "sg", "na", "soma")).toBe("kinasoma");
    expect(sentenceVerb("Ki-Vi", "pl", "ta", "soma")).toBe("vitasoma");
    expect(sentenceVerb("M-Mi", "sg", "ta", "anguka")).toBe("utaanguka");
    expect(sentenceVerb("M-Mi", "pl", "li", "anguka")).toBe("ilianguka");
    expect(sentenceVerb("Ji-Ma", "sg", "me", "anguka")).toBe("limeanguka");
    expect(sentenceVerb("Ji-Ma", "pl", "ta", "anguka")).toBe("yataanguka");
  });

  it("behält das ku- einsilbiger Verben", () => {
    expect(sentenceVerb("M-Wa", "pl", "ta", "kula")).toBe("watakula");
  });
});

describe("sentenceNouns", () => {
  it("nimmt nur Nomen mit bildbarem Plural", () => {
    const vocab = [
      noun("mtoto", "M-Wa"),
      noun("rafiki", "M-Wa"),
      noun("kitabu", "Ki-Vi"),
      noun("nyumba", "N"),
      noun("uso", "U"),
      verb("kusoma"),
    ];
    expect(sentenceNouns(vocab).map((n) => n.swahili)).toEqual(["mtoto", "kitabu"]);
  });
});

describe("buildSentenceTask", () => {
  const vocab = [
    noun("mtoto", "M-Wa", "Kind"),
    noun("mti", "M-Mi", "Baum"),
    noun("kitabu", "Ki-Vi", "Buch"),
    noun("gari", "Ji-Ma", "Auto"),
    verb("kula", "essen"),
    verb("kuanguka", "fallen"),
  ];

  it("baut drei Lücken, deren Lösungen den Satz ergeben", () => {
    const rng = seededRng(7);
    for (let i = 0; i < 200; i++) {
      const task = buildSentenceTask(vocab, rng);
      expect(task).not.toBeNull();
      if (!task) continue;

      expect(task.slots.map((s) => s.role)).toEqual(["noun", "adjective", "verb"]);
      expect(task.slots.map((s) => s.answer).join(" ")).toBe(task.answer);
      // Jede Lücke muss ihre Lösung auch anbieten, sonst ist sie unlösbar.
      for (const slot of task.slots) expect(slot.options).toContain(slot.answer);
      // Keine Dubletten — zweimal dieselbe Form wäre zweimal richtig.
      for (const slot of task.slots) {
        expect(new Set(slot.options).size).toBe(slot.options.length);
      }
      expect(SENTENCE_CLASSES).toContain(task.nounClass);
    }
  });

  /** Die Verbstämme des Testbestands — der Generator gibt sie nicht heraus. */
  const STEMS = ["kula", "anguka"];

  it("hält die Kongruenz über alle drei Lücken durch", () => {
    const rng = seededRng(3);
    for (let i = 0; i < 200; i++) {
      const task = buildSentenceTask(vocab, rng);
      if (!task) continue;
      const [nounSlot, adjSlot, verbSlot] = task.slots;
      const { nounClass, numerus, tense } = task;

      // Das Nomen steht im verlangten Numerus. Der Singular ist die Option,
      // deren Plural die andere ergibt (bei Ji-Ma ließe sich sonst auch
      // `magari` noch einmal pluralisieren).
      const [a, b] = nounSlot.options;
      const singular = pluralNoun(a, nounClass) === b ? a : b;
      const expectedNoun = numerus === "sg" ? singular : pluralNoun(singular, nounClass);
      expect(nounSlot.answer).toBe(expectedNoun);

      // … und Adjektiv wie Verb tragen die Konkordanz von Klasse UND Numerus.
      const stem = `-${adjSlot.answer.replace(/^(wa|mi|ma|ki|vi|m)?/, "")}`;
      expect(adjSlot.answer).toBe(sentenceAdjective(nounClass, stem, numerus));

      const verbStems = STEMS.map((s) => sentenceVerb(nounClass, numerus, tense.sw, s));
      expect(verbStems).toContain(verbSlot.answer);
    }
  });

  it("bietet als Ablenker echte Formen anderer Klassen an", () => {
    const task = buildSentenceTask(vocab, seededRng(11), "pl");
    expect(task).not.toBeNull();
    if (!task) return;
    const [, adjSlot, verbSlot] = task.slots;
    // Mehr als nur die Lösung — sonst wäre die Lücke geschenkt.
    expect(adjSlot.options.length).toBeGreaterThan(1);
    expect(verbSlot.options.length).toBeGreaterThan(1);

    // Und die falschen Formen sind echte Konkordanzen, keine Fantasiewörter:
    // jede angebotene Verbform gehört einer der vier Satzklassen.
    const legal = SENTENCE_CLASSES.flatMap((cls) =>
      (["sg", "pl"] as const).flatMap((num) =>
        STEMS.map((s) => sentenceVerb(cls, num, task.tense.sw, s)),
      ),
    );
    for (const option of verbSlot.options) expect(legal).toContain(option);
  });

  it("gibt null zurück, solange Nomen oder Verb fehlen", () => {
    expect(buildSentenceTask([noun("mtoto", "M-Wa")], seededRng(1))).toBeNull();
    expect(buildSentenceTask([verb("kusoma")], seededRng(1))).toBeNull();
    // Nur Nomen ohne bildbaren Plural → keine Aufgabe.
    expect(buildSentenceTask([noun("rafiki", "M-Wa"), verb("kusoma")], seededRng(1))).toBeNull();
  });
});

describe("Sinn der Sätze", () => {
  const mtoto = noun("mtoto", "M-Wa", "Kind");
  const mbwa = noun("mdudu", "M-Wa", "Insekt");
  const kitabu = noun("kitabu", "Ki-Vi", "Buch");

  it("erkennt Sache, Tier und Mensch am Nomen", () => {
    // Die Belebtheit steckt in der Klasse — M-/Wa- ist die Klasse der Lebewesen.
    expect(nounKind("mtoto", "M-Wa")).toBe("human");
    expect(nounKind("mdudu", "M-Wa")).toBe("animal");
    expect(nounKind("kitabu", "Ki-Vi")).toBe("thing");
    expect(nounKind("mti", "M-Mi")).toBe("thing");
    expect(nounKind("gari", "Ji-Ma")).toBe("thing");
  });

  it("lässt kein Buch essen und keinen Menschen kaputtgehen", () => {
    // Der Fall, der die Übung ausgelöst hat: „vitabu vinakula".
    expect(fitsSubject(kitabu, verb("kula"))).toBe(false);
    expect(fitsSubject(mtoto, verb("kula"))).toBe(true);
    expect(fitsSubject(mbwa, verb("kula"))).toBe(true);

    // Und die Gegenrichtung — deshalb ist es keine Rangfolge.
    expect(fitsSubject(kitabu, verb("kuharibika"))).toBe(true);
    expect(fitsSubject(mtoto, verb("kuharibika"))).toBe(false);

    // Ein Tier liest nicht und geht nicht in Rente.
    expect(fitsSubject(mbwa, verb("kucheka"))).toBe(false);
    expect(fitsSubject(mtoto, verb("kucheka"))).toBe(true);

    // Fallen kann alles.
    for (const n of [mtoto, mbwa, kitabu]) expect(fitsSubject(n, verb("kuanguka"))).toBe(true);
  });

  it("lässt transitive Verben gar nicht zu", () => {
    // „mtalii anapenda" wäre ein halber Satz: das Objekt fehlt und die Bauart
    // hat keinen Platz dafür.
    for (const v of ["kusoma", "kuandika", "kupenda", "kununua", "kugharimu"]) {
      expect(verbSubjects(v)).toEqual([]);
      expect(fitsSubject(mtoto, verb(v))).toBe(false);
    }
  });

  it("paart nur, was zusammenpasst", () => {
    const pairs = sentencePairs([mtoto, kitabu, verb("kula"), verb("kuharibika")]);
    expect(pairs.map((p) => `${p.noun.swahili}+${p.verb.swahili}`).sort()).toEqual([
      "kitabu+kuharibika",
      "mtoto+kula",
    ]);
  });

  it("stellt keine Aufgabe, wenn kein Paar zusammengeht", () => {
    // Nur Sachen, aber nur ein Verb für Lebewesen.
    expect(buildSentenceTask([kitabu, verb("kula")], seededRng(1))).toBeNull();
    // Und ein Verb, das der Satztrainer gar nicht führt.
    expect(buildSentenceTask([mtoto, verb("kusoma")], seededRng(1))).toBeNull();
  });
});
