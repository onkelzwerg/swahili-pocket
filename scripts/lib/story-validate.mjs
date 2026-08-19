/**
 * Deterministischer Validator für generierte Geschichten (W3.2, Schritt 3).
 *
 * Das ist das Herzstück der Pipeline: was hier durchfällt, wird nicht
 * ausgeliefert. Kein Modell entscheidet, ob ein Text im Band liegt — das
 * entscheidet der Mengen-Schnitt.
 *
 * `tokenize` wird von außen hereingereicht: der Aufrufer bündelt
 * `splitStoryText()` aus src/lib/stories.ts, damit Reader und Validator
 * garantiert dieselbe Wortgrenze ziehen. Zwei Tokenizer wären zwei Wahrheiten
 * — und angetippte Wörter ohne Glossareintrag die Folge.
 */

import { requiredPacks } from "./packs.mjs";

/** Mehr neue Wörter darf eine Geschichte nicht einführen (Plan W3.2). */
export const MAX_NEW_LEMMAS = 3;

/**
 * Geschlossene Wortklassen, die die Bandprüfung übergehen und nicht in die
 * Abdeckung zählen.
 *
 * Grund: `public/vocab-pool.json` führt keine Konkordanzen (`ya`, `wa`, `cha`),
 * keine Possessivstämme (`-angu`, `-ake`) und keine Demonstrativa (`hii`,
 * `yule`). Das ist keine Lücke, sondern eine Entscheidung — "ya = von" ist
 * ohne Klassenkontext keine sinnvolle Karteikarte. Die App unterrichtet diese
 * Formen dort, wo sie hingehören: in der Ngeli-Übersicht und im Grammatik-Gym.
 *
 * Ohne diese Ausnahme wäre kein zusammenhängender Satz erzeugbar: jede
 * Geschichte würde ihre drei erlaubten Neuwörter für `ya` und `wa` verbrauchen.
 * Ein Glossareintrag ist trotzdem Pflicht — der Reader soll `ya` erklären
 * können; es zählt nur nicht als Vokabel, die man erst lernen müsste.
 */
export const STRUCTURE_LEMMAS = new Set([
  // Genitiv-Konkordanz (-a) je Nomenklasse
  "wa",
  "ya",
  "cha",
  "vya",
  "la",
  "za",
  "pa",
  "mwa",
  // Possessivstämme
  "-angu",
  "-ako",
  "-ake",
  "-etu",
  "-enu",
  "-ao",
  // Demonstrativa: h-Reihe (dieses) und -le-Reihe (jenes)
  "huyu",
  "hawa",
  "huu",
  "hii",
  "hiki",
  "hivi",
  "hili",
  "hizi",
  "huku",
  "humu",
  "yule",
  "wale",
  "ule",
  "ile",
  "kile",
  "vile",
  "lile",
  "yale",
  "zile",
  // Die Lokativformen der -le-Reihe. Sie fehlten, obwohl die übrige Reihe
  // vollständig ist — `pale` bleibt draußen, weil der Pool es als Karte führt.
  "kule",
  "mle",
  // -o-Referenzreihe („jenes bereits Erwähnte"). Sie fehlte bis W4.10 fast
  // ganz; ohne sie lässt sich nicht auf etwas zurückverweisen, was zwei Sätze
  // vorher stand — in einer Erzählung also ständig.
  "huyo",
  "hao",
  "huo",
  "hiyo",
  "hicho",
  "hivyo",
  "hilo",
  "hayo",
  "hizo",
  "hapo",
  "huko",
  "humo",
  // Lokativkopula. „Wo ist mein Buch?" (kitabu changu kiko wapi?) war ohne
  // diese drei Formen nicht formulierbar; ein Schreibender musste die Szene
  // umbauen. Sie sind geschlossene Wortklasse und gehören ins Grammatik-Gym,
  // nicht auf eine Karteikarte — dieselbe Begründung wie bei den Konkordanzen.
  "-ko",
  "-po",
  "-mo",
  // Quantorenstamm mit Kongruenz: wote, yote, zote, chote, kote …
  "-ote",
  // Relativ und Ortspräposition
  "amba-",
  "kwenye",
  // Die ndi-Kopula in ihren Konkordanzformen: „das ist genau der/die/das".
  // `ndiyo` steht bewusst NICHT hier, obwohl es zur selben Reihe gehört: es ist
  // zu „ja" lexikalisiert und der Pool führt es als eigene Karte. Ein Wort, das
  // man als Vokabel lernen kann, darf nicht gleichzeitig von der Abdeckung
  // ausgenommen sein — sonst zählt die Karte nie. `ndio` bleibt dagegen hier:
  // in der hervorhebenden Lesart („sind es, die") ist es reine Grammatik.
  "ndio",
  "ndiye",
  "ndivyo",
  "ndilo",
  "ndizo",
  "ndicho",
  "ndiwo",
]);

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Eine Geschichte prüfen und normalisieren.
 *
 * @param {object} raw        Rohobjekt (aus der API oder aus public/stories/).
 * @param {object} opts
 * @param {Set<string>} opts.allowed   Erlaubte Lemmata des Bandes.
 * @param {(text: string) => string[]} opts.tokenize
 * @returns {{ errors: string[], story: object | null }}
 */
export function validateStory(raw, { allowed, tokenize }) {
  const errors = [];
  const fail = (msg) => errors.push(msg);

  if (!raw || typeof raw !== "object") return { errors: ["Kein Objekt."], story: null };

  for (const field of ["id", "title", "titleDe", "topic"]) {
    if (!isNonEmptyString(raw[field])) fail(`Feld "${field}" fehlt oder ist leer.`);
  }
  if (!Number.isInteger(raw.band)) fail('Feld "band" ist keine ganze Zahl.');
  if (!Array.isArray(raw.paragraphs) || raw.paragraphs.length === 0) {
    fail("Keine Absätze.");
  }
  if (!raw.glosses || typeof raw.glosses !== "object") fail("Kein glosses-Objekt.");
  if (errors.length > 0) return { errors, story: null };

  raw.paragraphs.forEach((p, i) => {
    if (!isNonEmptyString(p?.sw)) fail(`Absatz ${i + 1}: kein Swahili-Text.`);
    if (!isNonEmptyString(p?.de)) fail(`Absatz ${i + 1}: keine Übersetzung.`);
    // Ziffern hätte der Tokenizer stillschweigend verschluckt — dann stünde
    // ungeprüfter Text im Reader. Zahlen gehören ausgeschrieben.
    if (typeof p?.sw === "string" && /\d/.test(p.sw)) {
      fail(`Absatz ${i + 1}: Ziffern im Swahili-Text (Zahlen ausschreiben).`);
    }
  });
  if (errors.length > 0) return { errors, story: null };

  const newLemmas = (Array.isArray(raw.newLemmas) ? raw.newLemmas : [])
    .filter(isNonEmptyString)
    .map((l) => l.trim().toLowerCase());
  if (newLemmas.length > MAX_NEW_LEMMAS) {
    fail(`${newLemmas.length} neue Wörter, erlaubt sind ${MAX_NEW_LEMMAS}.`);
  }

  // Glossar normalisieren: Schlüssel kleingeschrieben, Lemma getrimmt.
  const glosses = {};
  for (const [key, value] of Object.entries(raw.glosses)) {
    if (!isNonEmptyString(key)) {
      fail("Leerer Glossar-Schlüssel.");
      continue;
    }
    if (!value || !isNonEmptyString(value.lemma) || !isNonEmptyString(value.de)) {
      fail(`Glossareintrag "${key}" ist unvollständig (lemma/de).`);
      continue;
    }
    const lemma = value.lemma.trim().toLowerCase();
    glosses[key.trim().toLowerCase()] = {
      lemma,
      de: value.de.trim(),
      ...(value.proper === true ? { proper: true } : {}),
      // Abgeleitet, nicht übernommen: ob ein Wort Struktur ist, entscheidet
      // die Liste oben — nicht das Modell und nicht die Handschrift.
      ...(STRUCTURE_LEMMAS.has(lemma) ? { structure: true } : {}),
    };
  }

  // 1. Jedes Token im Text muss im Glossar stehen.
  const used = new Set();
  raw.paragraphs.forEach((p, i) => {
    for (const token of tokenize(p.sw)) {
      used.add(token);
      if (!glosses[token]) fail(`Absatz ${i + 1}: Token "${token}" fehlt im Glossar.`);
    }
  });

  // 2. Kein Glossareintrag ohne Vorkommen — sonst wächst das Glossar zu einer
  //    Wortliste, die die Abdeckung verfälscht.
  for (const key of Object.keys(glosses)) {
    if (!used.has(key)) fail(`Glossareintrag "${key}" kommt im Text nicht vor.`);
  }

  // 3. Jedes Gloss-Lemma muss im Band liegen oder als neues Wort deklariert
  //    sein. Zwei Ausnahmen: Eigennamen (ein Ortsname ist keine Vokabel) und
  //    die geschlossenen Wortklassen aus STRUCTURE_LEMMAS.
  const lemmas = new Set();
  for (const [key, gloss] of Object.entries(glosses)) {
    if (gloss.proper || gloss.structure) continue;
    lemmas.add(gloss.lemma);
    if (!allowed.has(gloss.lemma) && !newLemmas.includes(gloss.lemma)) {
      fail(`"${key}" → Grundform "${gloss.lemma}" liegt außerhalb des Bandes.`);
    }
  }

  // 4. Deklarierte Neuwörter müssen auch vorkommen.
  for (const lemma of newLemmas) {
    if (!lemmas.has(lemma)) fail(`Neues Wort "${lemma}" kommt im Text nicht vor.`);
  }

  if (errors.length > 0) return { errors, story: null };

  const story = {
    id: raw.id.trim(),
    title: raw.title.trim(),
    titleDe: raw.titleDe.trim(),
    band: raw.band,
    topic: raw.topic.trim(),
    emoji: isNonEmptyString(raw.emoji) ? raw.emoji.trim() : "📖",
    // Abgeleitet, nie übernommen: die Lemma-Liste ist die Grundlage der
    // Abdeckung und darf nicht davon abweichen, was im Text steht.
    lemmas: [...lemmas].sort(),
    newLemmas,
    paragraphs: raw.paragraphs.map((p) => ({ sw: p.sw.trim(), de: p.de.trim() })),
    glosses,
    audio: isNonEmptyString(raw.audio) ? raw.audio.trim() : null,
  };
  return { errors: [], story };
}

/** Aus geprüften Geschichten den Listen-Index bauen. */
export function buildIndex(stories, { tokenize, packOf = new Map() }) {
  return {
    version: 1,
    stories: stories
      .map((s) => ({
        // Abgeleitet aus den Lemmata, nie gepflegt: benutzt die Geschichte ein
        // Wort aus einem Themenpaket, ist sie ohne dieses Paket unerreichbar.
        requiresPacks: requiredPacks(s.lemmas, packOf),
        id: s.id,
        title: s.title,
        titleDe: s.titleDe,
        band: s.band,
        topic: s.topic,
        emoji: s.emoji,
        lemmas: s.lemmas,
        newLemmas: s.newLemmas,
        wordCount: s.paragraphs.reduce((n, p) => n + tokenize(p.sw).length, 0),
        hasAudio: !!s.audio,
      }))
      .sort((a, b) => a.band - b.band || a.id.localeCompare(b.id)),
  };
}
