import { describe, expect, it } from "vitest";
import {
  ADJECTIVE_STEMS,
  NGELI_TRAINABLE_CLASSES,
  NGELI_VARIANTS,
  SUBJECTS,
  TENSES,
  adjectiveForm,
  buildNgeliTask,
  buildVerbTask,
  canNegate,
  negativeParts,
  negativeStem,
  trainableNouns,
  trainableVerbs,
  verbStem,
} from "../morphology";
import { makeCard } from "./helpers";
import type { NounClass, VocabEntry } from "../types";

/** Deterministischer RNG (LCG). */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function verb(swahili: string, german = "tun"): VocabEntry {
  return makeCard({ id: swahili, swahili, german, partOfSpeech: "verb" });
}

function noun(swahili: string, nounClass: NounClass): VocabEntry {
  return makeCard({ id: swahili, swahili, german: "Ding", partOfSpeech: "noun", nounClass });
}

describe("verbStem", () => {
  it("trennt das Infinitiv-ku- ab", () => {
    expect(verbStem("kusoma")).toEqual({ stem: "soma", monosyllabic: false });
    expect(verbStem("kufundisha")).toEqual({ stem: "fundisha", monosyllabic: false });
  });

  it("behält ku- bei einsilbigen Verben", () => {
    expect(verbStem("kula")).toEqual({ stem: "kula", monosyllabic: true });
    expect(verbStem("kwenda")).toEqual({ stem: "kwenda", monosyllabic: true });
  });

  it("trennt auch kw- vor vokalischem Stamm", () => {
    expect(verbStem("kwandika").stem).toBe("andika");
  });
});

describe("buildVerbTask", () => {
  it("baut alle 6 × 4 Kombinationen eines Regelverbs korrekt", () => {
    for (const s of SUBJECTS) {
      for (const t of TENSES) {
        expect(`${s.sw}${t.sw}soma`).toBe(`${s.sw}${t.sw}${verbStem("kusoma").stem}`);
      }
    }
    // Stichprobe der bekannten Formen.
    expect(`${SUBJECTS[3].sw}${TENSES[1].sw}soma`).toBe("tulisoma");
    expect(`${SUBJECTS[2].sw}${TENSES[3].sw}soma`).toBe("amesoma");
  });

  it("behält bei einsilbigen Verben das ku-", () => {
    const task = buildVerbTask([verb("kula", "essen")], seededRng(1), "affirmative");
    expect(task).not.toBeNull();
    expect(task!.monosyllabic).toBe(true);
    expect(task!.answer).toBe(`${task!.subject.sw}${task!.tense.sw}kula`);
    expect(task!.answer).toContain("kula");
  });

  it("setzt die Antwort aus genau den drei Lösungsbausteinen zusammen", () => {
    const task = buildVerbTask([verb("kusoma", "lesen")], seededRng(99), "affirmative")!;
    expect(task.solution.join("")).toBe(task.answer);
    expect(task.chips).toHaveLength(5);
    for (const part of task.solution) expect(task.chips).toContain(part);
  });

  it("liefert null ohne brauchbare Verben", () => {
    expect(buildVerbTask([], seededRng(1))).toBeNull();
    expect(buildVerbTask([makeCard({ partOfSpeech: "noun" })], seededRng(1))).toBeNull();
  });

  it("ignoriert Mehrwortverben und Einträge ohne ku-", () => {
    expect(trainableVerbs([verb("soma"), verb("ku enda"), verb("kusoma")])).toHaveLength(1);
  });
});

describe("adjectiveForm", () => {
  const zuri = ADJECTIVE_STEMS.find((a) => a.stem === "-zuri")!;
  const pya = ADJECTIVE_STEMS.find((a) => a.stem === "-pya")!;
  const refu = ADJECTIVE_STEMS.find((a) => a.stem === "-refu")!;

  it("bildet die regelmäßigen Präfixklassen", () => {
    expect(adjectiveForm("M-Wa", zuri)).toBe("mzuri");
    expect(adjectiveForm("M-Mi", zuri)).toBe("mzuri");
    expect(adjectiveForm("Ki-Vi", zuri)).toBe("kizuri");
    expect(adjectiveForm("Ji-Ma", zuri)).toBe("zuri");
    expect(adjectiveForm("U", zuri)).toBe("mzuri");
  });

  it("nimmt für die N-Klasse die kuratierte Form", () => {
    expect(adjectiveForm("N", zuri)).toBe("nzuri");
    expect(adjectiveForm("N", refu)).toBe("ndefu");
    expect(adjectiveForm("N", pya)).toBe("mpya");
  });

  it("kennt das ji- vor einsilbigem Stamm", () => {
    expect(adjectiveForm("Ji-Ma", pya)).toBe("jipya");
  });

  it("liefert null für nicht trainierte Klassen", () => {
    expect(adjectiveForm("Pa-Ku-Mu", zuri)).toBeNull();
    expect(adjectiveForm("Ku", zuri)).toBeNull();
  });

  it("liefert für jede trainierte Klasse und jeden Stamm eine Form", () => {
    for (const cls of NGELI_TRAINABLE_CLASSES) {
      for (const adj of ADJECTIVE_STEMS) {
        expect(adjectiveForm(cls, adj), `${cls} ${adj.stem}`).toBeTruthy();
      }
    }
  });
});

describe("buildNgeliTask", () => {
  it("erzeugt vier Optionen mit der Lösung darunter", () => {
    const task = buildNgeliTask([noun("kitabu", "Ki-Vi")], seededRng(4), "adjective")!;
    expect(task.options).toHaveLength(4);
    expect(task.options).toContain(task.answer);
    expect(task.answer).toBe(adjectiveForm("Ki-Vi", task.adjective!));
  });

  it("liefert nie einen Distraktor gleich der Lösung", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const task = buildNgeliTask([noun("kitabu", "Ki-Vi"), noun("nyumba", "N")], seededRng(seed))!;
      expect(new Set(task.options).size).toBe(task.options.length);
    }
  });

  it("überspringt Nomen ohne trainierbare Klasse", () => {
    expect(trainableNouns([noun("mahali", "Pa-Ku-Mu"), noun("kitabu", "Ki-Vi")])).toHaveLength(1);
    expect(buildNgeliTask([noun("mahali", "Pa-Ku-Mu")], seededRng(1))).toBeNull();
  });

  it("liefert null ohne Nomen", () => {
    expect(buildNgeliTask([], seededRng(1))).toBeNull();
  });
});

describe("Verneinung", () => {
  it("wechselt im Präsens die Endung -a → -i", () => {
    expect(negativeStem("soma")).toBe("somi");
    expect(negativeStem("fanya")).toBe("fanyi");
  });

  it("lässt Lehnwörter auf anderem Vokal unverändert", () => {
    expect(negativeStem("sahau")).toBe("sahau");
    expect(negativeStem("samehe")).toBe("samehe");
    expect(negativeStem("fikiri")).toBe("fikiri");
  });

  it("baut die Formen aller Zeiten nach der Tafel", () => {
    expect(negativeParts("ni", "na", "soma").join("")).toBe("sisomi");
    expect(negativeParts("ni", "li", "soma").join("")).toBe("sikusoma");
    expect(negativeParts("ni", "me", "soma").join("")).toBe("sijasoma");
    expect(negativeParts("ni", "ta", "soma").join("")).toBe("sitasoma");
    expect(negativeParts("wa", "na", "soma").join("")).toBe("hawasomi");
    expect(negativeParts("tu", "li", "soma").join("")).toBe("hatukusoma");
  });

  it("erzeugt verneinte Aufgaben mit passenden Bausteinen", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const task = buildVerbTask([verb("kusoma", "lesen")], seededRng(seed), "negative")!;
      expect(task.polarity).toBe("negative");
      expect(task.answer).toBe(negativeParts(task.subject.sw, task.tense.sw, task.stem).join(""));
      expect(task.solution.join("")).toBe(task.answer);
      for (const part of task.solution) expect(task.chips).toContain(part);
      // Die bejahten Bausteine liegen als Distraktoren daneben.
      expect(task.chips).toContain(task.subject.sw);
      expect(task.explain).toEqual({ to: "/verbs", hash: `neg-${task.tense.sw}` });
    }
  });

  it("verneint einsilbige Verben nur dort, wo die Bildung regelmäßig ist", () => {
    // kula: Präsens bleibt bejaht (sili wäre unregelmäßig), Vergangenheit,
    // Perfekt und Futur werden verneint — mit korrektem ku-Verhalten.
    expect(negativeParts("ni", "li", "kula", true).join("")).toBe("sikula");
    expect(negativeParts("ni", "me", "kula", true).join("")).toBe("sijala");
    expect(negativeParts("ni", "ta", "kula", true).join("")).toBe("sitakula");
    expect(negativeParts("ni", "me", "kunywa", true).join("")).toBe("sijanywa");

    expect(canNegate("kula", true, "na")).toBe(false);
    expect(canNegate("kula", true, "li")).toBe(true);
    // kwenda verschmilzt (si+ku+enda → sikwenda) und bleibt außen vor.
    expect(canNegate("kwenda", true, "li")).toBe(false);
    expect(canNegate("kusoma", false, "na")).toBe(true);

    for (let seed = 1; seed <= 50; seed++) {
      const task = buildVerbTask([verb("kwenda", "gehen")], seededRng(seed))!;
      expect(task.polarity).toBe("affirmative");
      const monoPresent = buildVerbTask([verb("kula", "essen")], seededRng(seed), "negative")!;
      if (monoPresent.tense.sw === "na") expect(monoPresent.polarity).toBe("affirmative");
      else expect(monoPresent.polarity).toBe("negative");
    }
  });

  it("verlinkt bejahte Aufgaben auf die Zeitform", () => {
    const task = buildVerbTask([verb("kusoma", "lesen")], seededRng(7), "affirmative")!;
    expect(task.explain).toEqual({ to: "/verbs", hash: `tense-${task.tense.sw}` });
  });
});

describe("Ngeli-Varianten", () => {
  const nouns = [
    noun("kitabu", "Ki-Vi"),
    noun("mtoto", "M-Wa"),
    noun("nyumba", "N"),
    noun("jina", "Ji-Ma"),
    noun("mti", "M-Mi"),
    noun("uhuru", "U"),
  ];

  it("liefert für jede Variante und Klasse eine Aufgabe mit vier Optionen", () => {
    for (const variant of NGELI_VARIANTS) {
      for (let seed = 1; seed <= 20; seed++) {
        const task = buildNgeliTask(nouns, seededRng(seed), variant)!;
        expect(task, `${variant} seed ${seed}`).not.toBeNull();
        expect(task.variant).toBe(variant);
        expect(task.options).toHaveLength(4);
        expect(task.options).toContain(task.answer);
        expect(new Set(task.options).size).toBe(4);
      }
    }
  });

  it("nimmt die Formen aus der Konkordanztafel", () => {
    const kitabu = [noun("kitabu", "Ki-Vi")];
    expect(buildNgeliTask(kitabu, seededRng(3), "possessive")!.answer).toBe("changu");
    expect(buildNgeliTask(kitabu, seededRng(3), "demonstrative")!.answer).toBe("hiki");
    expect(buildNgeliTask(kitabu, seededRng(3), "genitive")!.answer).toBe("cha");

    const nyumba = [noun("nyumba", "N")];
    expect(buildNgeliTask(nyumba, seededRng(3), "possessive")!.answer).toBe("yangu");
    expect(buildNgeliTask(nyumba, seededRng(3), "demonstrative")!.answer).toBe("hii");
    expect(buildNgeliTask(nyumba, seededRng(3), "genitive")!.answer).toBe("ya");
  });

  it("verlinkt jede Variante auf ihren Abschnitt der Klasse", () => {
    const kitabu = [noun("kitabu", "Ki-Vi")];
    expect(buildNgeliTask(kitabu, seededRng(1), "possessive")!.explain).toEqual({
      to: "/classes",
      hash: "ngeli-ki-vi-possessive",
    });
    expect(buildNgeliTask(kitabu, seededRng(1), "genitive")!.explain).toEqual({
      to: "/classes",
      hash: "ngeli-ki-vi-base",
    });
    expect(buildNgeliTask(kitabu, seededRng(1), "adjective")!.explain).toEqual({
      to: "/classes",
      hash: "ngeli-ki-vi-variable",
    });
  });

  it("stellt dem Genitiv einen Possessor nach", () => {
    const task = buildNgeliTask([noun("kitabu", "Ki-Vi")], seededRng(1), "genitive")!;
    expect(task.tail).toBe("mwalimu");
    expect(buildNgeliTask([noun("kitabu", "Ki-Vi")], seededRng(1), "possessive")!.tail).toBe("");
  });
});
