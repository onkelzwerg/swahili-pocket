/**
 * Häufigkeitsbänder für die Geschichten-Pipeline (W3.2).
 *
 * Der Plan wollte die Bandzuordnung als Spalte aus der Pool-CSV ziehen. Die
 * gibt es nicht: der Supabase-Export von `shared_vocab` führt keine Häufigkeit,
 * und `public/vocab-pool.json` ist alphabetisch sortiert — "Reihenfolge im
 * Pool" als Fallback wäre also eine Sortierung nach Anfangsbuchstabe.
 *
 * Stattdessen wird die Häufigkeit aus dem Material abgeleitet, das der Pool
 * schon mitbringt: ~2.400 kuratierte Beispielsätze. Wie oft ein Wort dort
 * vorkommt, ist ein echtes Korpus-Signal — die Rangliste beginnt mit
 * ni, sana, kwa, na, leo, kila …, was sich mit jeder Grundwortschatzliste deckt.
 *
 * Eine Heuristik bleibt es trotzdem, aus zwei Gründen:
 *   1. Verben stehen im Pool als Infinitiv (`kula`), im Satz aber konjugiert
 *      (`ninakula`). Deshalb zählen für Verben zusätzlich alle Token, die auf
 *      den Stamm enden. Das trifft gelegentlich daneben (`-isha`, `-lia` sind
 *      auch Ableitungssuffixe), verschiebt aber nur den Rang, nichts Inhaltliches.
 *   2. 160 Einträge kommen in keinem Beispielsatz vor; sie landen mit Zähler 0
 *      alphabetisch am Ende — also im letzten Band, wo seltene Wörter hingehören.
 */

/** Bandgrenzen als Rang der letzten Vokabel (Plan W3.2). */
export const BAND_LIMITS = [150, 350, 600];

/**
 * Kuratierte Bandzuordnung — Korrektur der Heuristik durch Urteil (W4.9).
 *
 * Beim Schreiben der ersten 15 Geschichten haben 16 unabhängige Durchgänge
 * dieselbe Klage vorgebracht: es fehlt „aber", es fehlt „sein", es fehlt
 * „sagen". Die Wörter stehen im Pool — sie liegen nur knapp jenseits der
 * Bandgrenze. Der Grund ist eine systematische Verzerrung der Rangbildung:
 * gezählt wird in den Beispielsätzen des Pools, und diese Sätze führen je eine
 * Vokabel vor. Sie brauchen deshalb kaum Konjunktionen, kaum Kopula und keine
 * Erzählstruktur — genau die Wörter also, die einen Text zusammenhalten.
 *
 * Diese Tabelle setzt sie an ihren Platz. Sie wirkt **additiv**: ein Wort mit
 * Eintrag `1` ist ab Band 1 erlaubt, auch wenn sein Rang darüber liegt. Kein
 * Wort verliert dadurch seinen Platz. Das ist Absicht — eine Banderweiterung
 * kann bestehende Geschichten nur bestätigen, während ein Verdrängen sie
 * reihenweise ungültig machen würde.
 *
 * Aufnahmekriterium: entweder von den Schreibenden konkret vermisst, oder
 * offensichtlich lückenhaft gegenüber einem schon vorhandenen Gegenstück
 * (`nne` ohne `tatu`, `kupanda` ohne `kushuka`, `kubwa` ohne `mdogo`).
 */
export const CORE_BAND = new Map([
  // --- Band 1: ohne diese ist keine zusammenhängende Erzählung möglich -----
  ["kuwa", 1], // Kopula — ohne sie kein Zustand im Präteritum
  ["kusema", 1], // ohne Sprechverb keine Szene mit zwei Personen
  ["kujua", 1],
  ["lakini", 1], // ohne „aber" keine Wendung, nur Parataxe
  ["kuja", 1], // kwenda/kurudi/kufika waren da, „kommen" nicht
  ["mama", 1],
  ["baba", 1], // stand hinter „Großmutter"
  ["asante", 1],
  ["mdogo", 1], // Gegenstück zu kubwa (Rang 46)
  ["hewa", 1],
  ["mbele", 1], // „vorn/vor" — nyuma („hinten") liegt ebenfalls tief
  ["mbaya", 1], // Gegenstück zu mzuri (Rang 33)
  ["kutoa", 1], // „geben/herausnehmen" — eines der häufigsten Verben überhaupt
  // Zahlen bis zehn. Der Pool kannte moja, mbili und nne — sonst nichts.
  // Neu aufgenommene Zahlen haben naturgemäß wenig Korpusbelege und lägen
  // ohne diese Zeilen in Band 3 und 4.
  ["tatu", 1],
  ["tano", 1],
  ["sita", 1],
  ["saba", 1],
  ["nane", 1],
  ["tisa", 1],
  ["kumi", 1],

  // --- Band 2 --------------------------------------------------------------
  ["kuuliza", 2], // Fragen wurden bisher mit „alisema" eingeleitet
  ["kwamba", 2], // der Begleiter von kusema und kujua
  ["kuandika", 2],
  ["kusubiri", 2],
  ["kisha", 2],
  ["baada ya", 2],
  ["kwa sababu", 2],
  ["soko", 2], // beim Thema Markt nicht verfügbar gewesen
  ["sauti", 2],
  ["kucheka", 2], // kulia war da, „lachen" nicht
  ["kufurahi", 2],
  ["hasira", 2], // Gegenstück zu furaha
  ["nyingi", 2], // „viele" war gar nicht ausdrückbar
  ["nyingine", 2],
  ["kushuka", 2], // Gegenrichtung zu kupanda
  ["kivuli", 2],
  ["ishirini", 2],
  ["pili", 2],
  ["kusimama", 2],
  ["refu", 2], // „lang" — kubwa und mdogo sind Band 1, das Gegenstück fehlte
  ["kufahamu", 2], // „erkennen" — sonst muss kujua dafür herhalten
  ["kupiga simu", 2], // die alltäglichste Kollokation überhaupt
  ["kuume", 2], // „rechts" — kushoto war da, das Gegenstück nicht
  ["kupinda", 2],
  // Erstaunlich basale Lücken, die erst beim Glossieren der Dialoge auffielen.
  ["kuongea", 2], // „reden" — nur kusema war da
  ["kuita", 2], // der Pool kannte nur das Passiv kuitwa („heißen")
  ["shida", 2], // „Problem" — tatizo und tabu waren da, das gängigste Wort nicht
  // Die Zehner. kumi und ishirini sind Band 1 bzw. 2, sabini lag als einzelner
  // Ausreißer schon im Bestand — dazwischen klaffte alles.
  ["thelathini", 2],
  ["arobaini", 2],
  ["hamsini", 2],
  ["sitini", 2],
  ["sabini", 2],
  ["themanini", 2],
  ["tisini", 2],

  // --- Band 3 --------------------------------------------------------------
  ["kushika", 3],
  ["nyasi", 3],
  ["tawi", 3],
  ["halafu", 3],
]);

/** Stämme unter dieser Länge werden nicht als Suffix gesucht (zu viele Zufallstreffer). */
const MIN_STEM = 3;

const TOKEN_RE = /[a-zà-ÿ]+(?:'[a-zà-ÿ]+)*/gi;

function tokenize(text) {
  return (text.toLowerCase().match(TOKEN_RE) ?? []);
}

/** Alle Token aller Beispielsätze des Pools. */
function corpusTokens(pool) {
  const tokens = [];
  for (const entry of pool) {
    for (const ex of entry.examples ?? []) {
      if (ex?.sw) tokens.push(...tokenize(ex.sw));
    }
  }
  return tokens;
}

/**
 * Häufigkeitsrang aller Pool-Vokabeln, häufigste zuerst.
 * Gleichstand wird alphabetisch aufgelöst, damit der Lauf reproduzierbar ist.
 */
export function rankPool(pool) {
  const tokens = corpusTokens(pool);
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);

  const scored = pool.map((entry) => {
    const word = entry.swahili.toLowerCase();
    let score = counts.get(word) ?? 0;
    if (entry.partOfSpeech === "verb" && word.startsWith("ku") && !word.includes(" ")) {
      const stem = word.slice(2);
      if (stem.length >= MIN_STEM) {
        for (const t of tokens) if (t.length > stem.length && t.endsWith(stem)) score++;
      }
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score || a.entry.swahili.localeCompare(b.entry.swahili, "sw"));
  return scored.map((s) => s.entry);
}

/** Band 1..4 für einen Rang (0-basiert). */
export function bandForRank(rank) {
  for (let i = 0; i < BAND_LIMITS.length; i++) {
    if (rank < BAND_LIMITS[i]) return i + 1;
  }
  return BAND_LIMITS.length + 1;
}

/**
 * Der erlaubte Wortschatz eines Bandes: alle Lemmata **bis einschließlich**
 * dieses Bandes. Ein Band-3-Text darf selbstverständlich `ni` und `na`
 * benutzen — die Bänder sind kumulativ, nicht disjunkt.
 */
export function allowedLemmas(pool, band) {
  const ranked = rankPool(pool);
  const limit = band > BAND_LIMITS.length ? ranked.length : BAND_LIMITS[band - 1];
  const allowed = new Set(ranked.slice(0, limit).map((e) => e.swahili.toLowerCase()));
  // Kuratierte Zuordnung obendrauf, nicht statt: siehe CORE_BAND.
  const known = new Set(pool.map((e) => e.swahili.toLowerCase()));
  for (const [lemma, coreBand] of CORE_BAND) {
    if (coreBand <= band && known.has(lemma)) allowed.add(lemma);
  }
  return allowed;
}

/**
 * Einträge in CORE_BAND, die es im Pool nicht (mehr) gibt.
 * Eine kuratierte Liste, die auf nichts zeigt, ist ein stiller Fehler — sie
 * sieht aus, als wäre das Wort erlaubt, und die Bandprüfung weist es trotzdem
 * ab. Die Skripte melden das beim Lauf.
 */
export function danglingCoreLemmas(pool) {
  const known = new Set(pool.map((e) => e.swahili.toLowerCase()));
  return [...CORE_BAND.keys()].filter((l) => !known.has(l));
}

/** Pool-Eintrag je Lemma (kleingeschrieben) — für Übersetzungen im Prompt. */
export function poolByLemma(pool) {
  const map = new Map();
  for (const e of pool) map.set(e.swahili.toLowerCase(), e);
  return map;
}
