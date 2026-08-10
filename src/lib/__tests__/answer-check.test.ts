import { describe, expect, it } from "vitest";
import {
  checkAnswer,
  damerauLevenshtein,
  expandTargets,
  normalizeAnswer,
  typoThreshold,
} from "../answer-check";

describe("normalizeAnswer", () => {
  it("vereinheitlicht Groß-/Kleinschreibung, Leerzeichen und Ränder", () => {
    expect(normalizeAnswer("  Mtoto  ")).toBe("mtoto");
    expect(normalizeAnswer("Habari   gani?")).toBe("habari gani");
    expect(normalizeAnswer("„Karibu!“")).toBe("karibu");
  });

  it("führt alle Apostroph-Varianten auf ' zurück", () => {
    for (const apo of ["’", "‘", "´", "`", "ʼ"]) {
      expect(normalizeAnswer(`ng${apo}ombe`)).toBe("ng'ombe");
    }
  });
});

describe("expandTargets", () => {
  it("löst Klammern in beide Richtungen auf", () => {
    const forms = expandTargets("(ku)soma").flatMap((v) => v.forms);
    expect(forms).toContain("kusoma");
    expect(forms).toContain("soma");
  });

  it("trennt Alternativen an , / ;", () => {
    const variants = expandTargets("nzuri / vizuri; safi");
    expect(variants.map((v) => v.display)).toEqual(["nzuri", "vizuri", "safi"]);
  });

  it("nimmt die vollständige Form als Anzeigeform", () => {
    expect(expandTargets("(ku)soma")[0].display).toBe("kusoma");
  });
});

describe("damerauLevenshtein", () => {
  it("zählt Vertauschungen als einen Schritt", () => {
    expect(damerauLevenshtein("rafiki", "rafiik")).toBe(1);
  });

  it("zählt Einfügen, Löschen, Ersetzen", () => {
    expect(damerauLevenshtein("rafki", "rafiki")).toBe(1);
    expect(damerauLevenshtein("kula", "kupa")).toBe(1);
    expect(damerauLevenshtein("", "soma")).toBe(4);
  });
});

describe("typoThreshold", () => {
  it("ist bei sehr kurzen Wörtern kompromisslos", () => {
    expect(typoThreshold(3)).toBe(0);
    expect(typoThreshold(5)).toBe(1);
    expect(typoThreshold(9)).toBe(2);
  });
});

describe("checkAnswer — Pflichtfälle aus dem Plan", () => {
  it("mtoto / 'Mtoto ' ist exact", () => {
    expect(checkAnswer("Mtoto ", "mtoto").verdict).toBe("exact");
  });

  it("ng'ombe / ngombe ist exact, kein Tippfehler", () => {
    expect(checkAnswer("ngombe", "ng'ombe").verdict).toBe("exact");
    expect(checkAnswer("ng'ombe", "ngombe").verdict).toBe("exact");
  });

  it("rafiki / rafki ist ein Tippfehler", () => {
    const r = checkAnswer("rafki", "rafiki");
    expect(r.verdict).toBe("typo");
    expect(r.expected).toBe("rafiki");
  });

  it("kula / kupa ist falsch — kurze Wörter erlauben keine Ersetzung", () => {
    expect(checkAnswer("kupa", "kula").verdict).toBe("wrong");
  });

  it("erlaubt bei kurzen Wörtern aber Vertauschungen", () => {
    expect(checkAnswer("kual", "kula").verdict).toBe("typo");
  });

  it("(ku)soma matcht soma und kusoma", () => {
    expect(checkAnswer("soma", "(ku)soma").verdict).toBe("exact");
    expect(checkAnswer("kusoma", "(ku)soma").verdict).toBe("exact");
  });
});

describe("checkAnswer — Randfälle", () => {
  it("wertet leere Eingaben als falsch", () => {
    expect(checkAnswer("", "mtoto").verdict).toBe("wrong");
    expect(checkAnswer("   ", "mtoto").verdict).toBe("wrong");
  });

  it("nimmt die beste Alternative", () => {
    const r = checkAnswer("vizuri", "nzuri, vizuri");
    expect(r.verdict).toBe("exact");
    expect(r.matched).toBe("vizuri");
  });

  it("zeigt bei falscher Antwort die erste Alternative an", () => {
    const r = checkAnswer("xyzabc", "nzuri, vizuri");
    expect(r.verdict).toBe("wrong");
    expect(r.expected).toBe("nzuri");
  });

  it("toleriert bei langen Wörtern zwei Abweichungen", () => {
    expect(checkAnswer("kufundsha", "kufundisha").verdict).toBe("typo");
    expect(checkAnswer("kufndsha", "kufundisha").verdict).toBe("typo");
    // Drei Abweichungen sind keine Schreibunsicherheit mehr.
    expect(checkAnswer("kufndsh", "kufundisha").verdict).toBe("wrong");
  });
});
