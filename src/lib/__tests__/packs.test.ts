import { describe, expect, it } from "vitest";
import { isContentAvailable, missingPacks } from "../packs";

// Die Sichtbarkeitsregel ist der Kern des Paket-Mechanismus (W4.13): sie
// entscheidet, ob ein Inhalt in der Liste steht. Falsch herum wäre sie doppelt
// ärgerlich — entweder verschwindet Inhalt, den der Nutzer erreichen könnte,
// oder es steht etwas da, das er nie freischalten kann.

describe("isContentAvailable", () => {
  it("zeigt Inhalte ohne Paketbedarf immer", () => {
    expect(isContentAvailable([], [])).toBe(true);
    expect(isContentAvailable(undefined, [])).toBe(true);
  });

  it("verlangt ALLE geforderten Pakete, nicht nur eines", () => {
    const needs = ["arbeit-und-karriere", "geld-und-behoerden"];
    expect(isContentAvailable(needs, ["arbeit-und-karriere"])).toBe(false);
    expect(isContentAvailable(needs, needs)).toBe(true);
  });

  it("stört sich nicht an zusätzlich aktiven Paketen", () => {
    expect(isContentAvailable(["doctor-pack"], ["doctor-pack", "anderes"])).toBe(true);
  });

  // Ältere Indexdateien kennen das Feld nicht. Sie dürfen nicht dazu führen,
  // dass plötzlich der gesamte Bestand verschwindet.
  it("behandelt ein fehlendes Feld wie: kein Bedarf", () => {
    expect(isContentAvailable(undefined, ["irgendwas"])).toBe(true);
  });
});

describe("missingPacks", () => {
  it("nennt genau die fehlenden", () => {
    expect(missingPacks(["a", "b", "c"], ["b"])).toEqual(["a", "c"]);
  });

  it("ist leer, wenn alles da ist", () => {
    expect(missingPacks(["a"], ["a"])).toEqual([]);
    expect(missingPacks(undefined, [])).toEqual([]);
  });
});
