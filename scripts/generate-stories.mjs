#!/usr/bin/env node
/**
 * Erzeugt Kurzgeschichten für den Lese-Bereich (W3.2) über die Claude API.
 *
 * Muster: scripts/generate-audio.mjs — API-Key aus der Umgebung, idempotent,
 * überspringt Vorhandenes, jederzeit abbrechbar.
 *
 * Ablauf pro Geschichte:
 *   1. Band bestimmt den erlaubten Wortschatz (scripts/lib/story-bands.mjs).
 *   2. Claude schreibt Text, Übersetzung und Glossar als strukturiertes JSON.
 *   3. Der Validator (scripts/lib/story-validate.mjs) prüft **deterministisch**,
 *      dass jedes Token im Glossar steht und jede Grundform im Band liegt.
 *      Fehler gehen als Korrekturauftrag zurück ans Modell (max. 3 Versuche);
 *      danach wird die Geschichte verworfen und protokolliert.
 *   4. Erst dann landet sie in public/stories/<id>.json.
 *
 * Nichts Ungeprüftes wird ausgeliefert: der Validator ist die einzige Instanz,
 * die über Auslieferung entscheidet — das Modell schlägt nur vor.
 *
 * Zwei Wege zum Text, ein Weg zur Auslieferung:
 *   A) Die API schreibt (braucht ANTHROPIC_API_KEY) — Schleife s. o.
 *   B) Ein Mensch oder ein Agent schreibt (braucht keinen Key) — `--brief` gibt
 *      denselben Auftrag als Klartext aus, `--check` prüft eine einzelne Datei
 *      und nennt die Beanstandungen. Wer die Schleife von Hand dreht, dreht
 *      dieselbe Schleife.
 * Beide Wege enden im selben Validator; er ist die einzige Instanz, die über
 * Auslieferung entscheidet.
 *
 * Verwendung:
 *   node scripts/generate-stories.mjs --validate       (Bestand prüfen + Index neu bauen, kein API-Key)
 *   node scripts/generate-stories.mjs --dry-run        (zeigt, was erzeugt würde)
 *   node scripts/generate-stories.mjs --brief essen-1-01     (Auftrag ausgeben, kein API-Key)
 *   node scripts/generate-stories.mjs --check public/stories/essen-1-01.json
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-stories.mjs
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-stories.mjs --band 1 --per-topic 2
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-stories.mjs --limit 5
 *
 * Kosten: eine Geschichte kostet grob 10.000 Eingabe- und 2.000 Ausgabe-Token
 * (die Wortliste des Bandes dominiert und wird über Prompt-Caching zwischen
 * Geschichten desselben Bandes wiederverwendet). `--limit` deckelt einen Lauf.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import Anthropic from "@anthropic-ai/sdk";
import {
  BAND_LIMITS,
  allowedLemmas,
  danglingCoreLemmas,
  poolByLemma,
} from "./lib/story-bands.mjs";
import {
  MAX_NEW_LEMMAS,
  STRUCTURE_LEMMAS,
  buildIndex,
  validateStory,
} from "./lib/story-validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POOL_FILE = path.join(ROOT, "public", "vocab-pool.json");
const STORIES_DIR = path.join(ROOT, "public", "stories");
const INDEX_FILE = path.join(STORIES_DIR, "index.json");

const MODEL = "claude-opus-5";
/** Reicht für den längsten Band-4-Text samt Glossar; gestreamt, also kein HTTP-Timeout. */
const MAX_TOKENS = 32000;
const MAX_ATTEMPTS = 3;

/** Zielumfang je Band (Plan W3.2). */
const BAND_LENGTH = {
  1: { min: 40, max: 70, paragraphs: "2–3" },
  2: { min: 70, max: 120, paragraphs: "3–4" },
  3: { min: 110, max: 180, paragraphs: "4–5" },
  4: { min: 150, max: 250, paragraphs: "5–6" },
};

const ALL_BANDS = [1, 2, 3, 4];

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};

const validateOnly = has("--validate");
const dryRun = has("--dry-run");
const briefId = has("--brief") ? value("--brief", null) : null;
const checkFiles = has("--check") ? args.slice(args.indexOf("--check") + 1) : null;
const perTopic = Number(value("--per-topic", 1));
const limit = Number(value("--limit", Infinity));
const bandArg = value("--band", null);
const bands = bandArg ? [Number(bandArg)] : ALL_BANDS;

if (bands.some((b) => !ALL_BANDS.includes(b))) {
  console.error(`Fehler: --band muss 1..${ALL_BANDS.length} sein.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// App-Code laden (esbuild bündelt die TS-Quellen, wie in generate-audio.mjs)
// ---------------------------------------------------------------------------

/**
 * `storyTokens` kommt aus src/lib/stories.ts — bewusst dieselbe Funktion, die
 * der Reader benutzt. Ein zweiter Tokenizer im Skript wäre eine zweite
 * Wortgrenze und damit angetippte Wörter ohne Glossareintrag.
 */
async function loadAppData() {
  const entry = `
    export { storyTokens } from "./src/lib/stories.ts";
    export { APP_CONFIG } from "./src/config/app.config.ts";
  `;
  const result = await build({
    stdin: { contents: entry, resolveDir: ROOT, loader: "js" },
    bundle: true,
    format: "esm",
    platform: "neutral",
    write: false,
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_INTRO = `Du schreibst kurze Lesetexte auf tansanischem Kiswahili sanifu für eine Vokabel-Lern-App.
Die Leserinnen und Leser sind deutschsprachige Anfänger. Ein Text funktioniert nur,
wenn er fast ausschließlich Wörter benutzt, die sie schon gelernt haben.

Feste Regeln:
- Benutze ausschließlich Wörter aus der ERLAUBTEN WORTLISTE unten, in beliebiger
  gebeugter Form (Personal-, Zeit- und Objektpräfixe, Pluralformen, Kongruenz).
- Höchstens ${MAX_NEW_LEMMAS} Grundformen dürfen außerhalb der Liste liegen. Diese
  deklarierst du in "newLemmas". Weniger ist besser.
- Eigennamen (Personen, Orte) sind erlaubt und zählen nicht mit; markiere sie im
  Glossar mit "proper": true und lass ihre Grundform gleich dem Wort.
- Grammatische Formwörter zählen ebenfalls nicht gegen die Liste und dürfen
  frei benutzt werden. Ihre Grundform muss aber genau eine der folgenden sein:
  ${[...STRUCTURE_LEMMAS].join(", ")}
  (Genitiv-Konkordanzen, Possessivstämme wie "-angu", Demonstrativa, "kwenye").
  Beispiel: {"token":"yangu","lemma":"-angu","de":"mein/meine","proper":false}
- Das Glossar muss JEDES Wort des Textes enthalten — jede gebeugte Form einzeln,
  kleingeschrieben, mit Grundform und deutscher Bedeutung dieser Form.
  Beispiel: {"token":"nilienda","lemma":"kwenda","de":"ich ging","proper":false}
- Kollokationen stehen als Ganzes in der Wortliste ("kupiga simu = anrufen",
  "baada ya = nach"). Benutzt du eine, bekommt **das Kopfwort** die Kollokation
  als Grundform, und die übrigen Bestandteile bekommen gar keinen eigenen
  Eintrag — sonst zählte das Wortpaar doppelt gegen die Abdeckung:
    {"token":"anapiga","lemma":"kupiga simu","de":"sie ruft an"}
    {"token":"simu","lemma":"kupiga simu","de":"(Teil von: anrufen)"}
  Meinst du dagegen wirklich die Einzelwörter (das Telefon als Gegenstand),
  glossierst du sie einzeln.
- Schreibe Zahlen als Wörter aus, niemals als Ziffern.
- Jeder Absatz bekommt eine natürliche deutsche Übersetzung (nicht Wort für Wort).
- Erzähle eine kleine, konkrete Geschichte mit Anfang und Ende. Kein Lehrbuchton,
  keine Aufzählung von Vokabeln, keine Anrede der Lesenden.

Erzählstil — daran scheiterten die ersten zwanzig Geschichten:

- **Benutze das -ka-Konsekutiv.** Aufeinanderfolgende Handlungen desselben
  Subjekts stehen im Kiswahili nicht als Kette gleichrangiger Sätze, sondern
  mit -ka- ab dem zweiten Verb: "Alilipa akachukua maembe akarudi nyumbani",
  nicht "Alilipa na alichukua maembe na alirudi nyumbani". Ohne -ka- liest sich
  ein Text wie eine Liste. Das erste Verb trägt die Zeit, die folgenden -ka-.
- **Nie ein finites Verb mit "na" an einen Infinitiv hängen.** "Alikunywa chai
  na kulala" ist falsch; richtig ist "Alikunywa chai akalala".
- **Bleib in einer Zeit.** Eine Erzählung steht durchgehend im Präteritum
  (li-) oder durchgehend im Präsens — nicht gemischt. Ausgenommen sind
  Dauerzustände ("Bibi yake anakaa mbali") und wörtliche Rede.
- **Nach "lazima" steht der Konjunktiv**, nicht der Infinitiv:
  "lazima afanye kazi", nicht "lazima kufanya kazi".
- **Anführungszeichen: immer „…"** (unten öffnend, oben schließend). Keine
  geraden Zoll-Zeichen, kein englisches Format.`;

function systemPrompt(allowedList) {
  return `${SYSTEM_INTRO}

ERLAUBTE WORTLISTE (${allowedList.length} Grundformen, "swahili = deutsch"):
${allowedList.join("\n")}`;
}

function taskPrompt({ topic, band, id }) {
  const len = BAND_LENGTH[band];
  return `Schreib eine Geschichte zum Thema "${topic}".

- Id: ${id}
- Länge: ${len.min}–${len.max} Wörter Swahili, verteilt auf ${len.paragraphs} Absätze.
  Gezählt werden Token, also Wörter ohne Satzzeichen.
- "title" ist der Swahili-Titel, "titleDe" die deutsche Entsprechung.
  Titel werden **nicht** geprüft: sie brauchen keine Glossareinträge und dürfen
  Wörter außerhalb der Liste enthalten. Geprüft wird nur "paragraphs".
- "emoji" ist ein einzelnes Emoji, das zur Geschichte passt.
- Sieh im Verzeichnis public/stories/ nach, welche Titel und Motive es schon
  gibt, und wähl etwas anderes. Verlass dich nicht auf eine mitgegebene Liste —
  es entstehen Geschichten parallel.`;
}

/**
 * Antwortschema. `glosses` ist eine Liste statt eines Objekts: strukturierte
 * Ausgaben verlangen `additionalProperties: false`, ein Objekt mit freien
 * Schlüsseln ist damit nicht abbildbar. Umgewandelt wird nach dem Empfang.
 */
const STORY_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    titleDe: { type: "string" },
    emoji: { type: "string" },
    newLemmas: { type: "array", items: { type: "string" } },
    paragraphs: {
      type: "array",
      items: {
        type: "object",
        properties: { sw: { type: "string" }, de: { type: "string" } },
        required: ["sw", "de"],
        additionalProperties: false,
      },
    },
    glosses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          token: { type: "string" },
          lemma: { type: "string" },
          de: { type: "string" },
          proper: { type: "boolean" },
        },
        required: ["token", "lemma", "de", "proper"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "titleDe", "emoji", "newLemmas", "paragraphs", "glosses"],
  additionalProperties: false,
};

/** Modellantwort in die Story-Form bringen (Glossar-Liste → Objekt). */
function toStory(raw, { id, band, topic }) {
  const glosses = {};
  for (const g of raw.glosses ?? []) {
    if (!g?.token) continue;
    glosses[String(g.token).toLowerCase()] = {
      lemma: g.lemma,
      de: g.de,
      ...(g.proper ? { proper: true } : {}),
    };
  }
  return { ...raw, id, band, topic, glosses, audio: null };
}

// ---------------------------------------------------------------------------
// Auftrag als Klartext (--brief) und Einzelprüfung (--check)
//
// Derselbe Auftrag, den die API bekommt — nur an ein Gegenüber gerichtet, das
// die Datei selbst schreibt. Deshalb beschreibt er die Form auf der Platte und
// nicht das API-Schema: dort ist `glosses` eine Liste, weil strukturierte
// Ausgaben keine freien Schlüssel können, hier ist es ein Objekt. `id`, `band`
// und `topic` setzt auf diesem Weg auch niemand nachträglich ein.
// ---------------------------------------------------------------------------

/** `essen-1-01` → { id, band, topic } — die Umkehrung der Id-Bildung in main(). */
function targetFromId(id, topicAreas) {
  const m = /^(.+)-(\d+)-(\d+)$/.exec(id);
  if (!m) return null;
  const topic = topicAreas.find((t) => slug(t) === m[1]);
  const band = Number(m[2]);
  if (!topic || !ALL_BANDS.includes(band)) return null;
  return { id, band, topic };
}

function briefFor(target, allowedList) {
  const file = `public/stories/${target.id}.json`;
  return `${systemPrompt(allowedList)}

--- AUFGABE ---

${taskPrompt(target)}

--- ERGEBNIS ---

Schreib die Geschichte als JSON nach ${file}, genau in dieser Form:

{
 "id": ${JSON.stringify(target.id)},
 "title": "<Swahili-Titel>",
 "titleDe": "<deutscher Titel>",
 "band": ${target.band},
 "topic": ${JSON.stringify(target.topic)},
 "emoji": "<ein Emoji>",
 "newLemmas": [],
 "paragraphs": [
  { "sw": "<Absatz auf Swahili>", "de": "<natürliche deutsche Übersetzung>" }
 ],
 "glosses": {
  "<token, kleingeschrieben>": { "lemma": "<Grundform>", "de": "<Bedeutung genau dieser Form>" },
  "<eigenname>": { "lemma": "<eigenname>", "de": "<Erklärung>", "proper": true }
 },
 "audio": null
}

Kein Feld "lemmas" — das leitet der Validator aus dem Glossar ab und schreibt
es selbst. "audio" bleibt null; die Vertonung läuft über scripts/generate-audio.mjs.

Schreib **nur diese eine Datei**. public/stories/index.json fasst du nicht an:
den Index baut ein späterer Lauf von \`npm run stories:validate\` aus dem
gesamten Bestand neu. Führ ihn auch nicht selbst aus — er schreibt alle
Geschichten zurück, und wenn mehrere Leute gleichzeitig schreiben, überholt
dabei einer den anderen.

--- PRÜFUNG ---

    node scripts/generate-stories.mjs --check ${file}

Die Prüfung ist deterministisch und hat das letzte Wort. Sie meldet jedes Token
ohne Glossareintrag, jeden Glossareintrag ohne Vorkommen und jede Grundform
außerhalb des Bandes. Bessere nach und prüfe erneut, bis sie nichts mehr
beanstandet.`;
}

/** Einzelne Dateien prüfen, ohne Index und ohne Rückschreiben. */
async function checkFilesMode(paths, pool, tokenize) {
  const allowedByBand = new Map(ALL_BANDS.map((b) => [b, allowedLemmas(pool, b)]));
  let bad = 0;

  for (const rel of paths) {
    const full = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
    let raw;
    try {
      raw = JSON.parse(await readFile(full, "utf8"));
    } catch (e) {
      console.error(`✗ ${rel}: ${e.message}`);
      bad++;
      continue;
    }
    const allowed = allowedByBand.get(raw.band) ?? allowedByBand.get(ALL_BANDS.at(-1));
    const { errors, story } = validateStory(raw, { allowed, tokenize });
    if (story) {
      const words = story.paragraphs.reduce((n, p) => n + tokenize(p.sw).length, 0);
      console.log(
        `✓ ${rel} — ${words} Wörter, ${story.lemmas.length} Lemmata, ` +
          `${story.newLemmas.length} neu`,
      );
    } else {
      bad++;
      console.error(`✗ ${rel} — ${errors.length} Beanstandungen:`);
      for (const e of errors) console.error(`    ${e}`);
    }
  }

  if (bad > 0) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// Generierung
// ---------------------------------------------------------------------------

function textOf(message) {
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/**
 * Eine Geschichte erzeugen und bis zu MAX_ATTEMPTS mal nachbessern lassen.
 * Die Validierungsfehler gehen im Klartext zurück ans Modell — gezielt
 * korrigieren ist deutlich zuverlässiger als blind neu zu würfeln.
 */
async function generateStory(client, { system, target, allowed, tokenize }) {
  const messages = [{ role: "user", content: taskPrompt(target) }];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      output_config: { format: { type: "json_schema", schema: STORY_SCHEMA } },
      messages,
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return { story: null, errors: ["Anfrage wurde abgelehnt (stop_reason: refusal)."] };
    }
    if (message.stop_reason === "max_tokens") {
      return { story: null, errors: [`Antwort bei ${MAX_TOKENS} Token abgeschnitten.`] };
    }

    let parsed;
    try {
      parsed = JSON.parse(textOf(message));
    } catch (e) {
      return { story: null, errors: [`Antwort ist kein gültiges JSON: ${e.message}`] };
    }

    const { errors, story } = validateStory(toStory(parsed, target), { allowed, tokenize });
    if (story) return { story, errors: [], attempts: attempt };
    if (attempt === MAX_ATTEMPTS) return { story: null, errors };

    console.log(`    Versuch ${attempt}: ${errors.length} Beanstandungen, lasse nachbessern…`);
    messages.push(
      { role: "assistant", content: textOf(message) },
      {
        role: "user",
        content: `Die Prüfung hat Folgendes beanstandet:\n- ${errors.join("\n- ")}\n\nGib die vollständige, korrigierte Geschichte im selben Format zurück.`,
      },
    );
  }
  return { story: null, errors: ["Unerreichbar."] };
}

// ---------------------------------------------------------------------------
// Bestand & Index
// ---------------------------------------------------------------------------

function slug(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function readExistingStories() {
  if (!existsSync(STORIES_DIR)) return [];
  const files = (await readdir(STORIES_DIR)).filter(
    (f) => f.endsWith(".json") && f !== "index.json",
  );
  const stories = [];
  for (const file of files.sort()) {
    stories.push(JSON.parse(await readFile(path.join(STORIES_DIR, file), "utf8")));
  }
  return stories;
}

/**
 * Alle vorhandenen Geschichten erneut prüfen und den Index neu schreiben.
 * Läuft ohne API-Key — auch handgeschriebene Geschichten müssen hier durch.
 */
async function revalidateAll(pool, tokenize) {
  // Eine kuratierte Bandzuordnung, die auf ein gelöschtes Wort zeigt, wäre ein
  // stiller Fehler: sie sieht aus, als wäre das Wort erlaubt, und die Prüfung
  // weist es trotzdem ab.
  const dangling = danglingCoreLemmas(pool);
  if (dangling.length > 0) {
    console.error(
      `Warnung: ${dangling.length} Einträge in CORE_BAND stehen nicht im Pool: ` +
        dangling.join(", "),
    );
  }

  const stories = await readExistingStories();
  const allowedByBand = new Map(
    ALL_BANDS.map((b) => [b, allowedLemmas(pool, b)]),
  );

  const good = [];
  let bad = 0;
  for (const raw of stories) {
    const allowed = allowedByBand.get(raw.band) ?? allowedByBand.get(ALL_BANDS.at(-1));
    const { errors, story } = validateStory(raw, { allowed, tokenize });
    if (story) {
      good.push(story);
      // Normalisierte Fassung zurückschreiben (Lemma-Liste wird abgeleitet).
      await writeFile(
        path.join(STORIES_DIR, `${story.id}.json`),
        JSON.stringify(story, null, 1),
      );
    } else {
      bad++;
      console.error(`✗ ${raw.id ?? "(ohne id)"}:`);
      for (const e of errors) console.error(`    ${e}`);
    }
  }

  await writeFile(INDEX_FILE, JSON.stringify(buildIndex(good, { tokenize }), null, 1));
  console.log(`\n${good.length} Geschichten geprüft, Index geschrieben.`);
  if (bad > 0) {
    console.error(`${bad} Geschichten sind durchgefallen und stehen NICHT im Index.`);
    process.exitCode = 1;
  }
  return good;
}

// ---------------------------------------------------------------------------
// Hauptlauf
// ---------------------------------------------------------------------------

async function main() {
  const pool = JSON.parse(await readFile(POOL_FILE, "utf8"));
  const { storyTokens, APP_CONFIG } = await loadAppData();
  const tokenize = storyTokens;

  await mkdir(STORIES_DIR, { recursive: true });

  if (validateOnly) {
    await revalidateAll(pool, tokenize);
    return;
  }

  if (checkFiles) {
    if (checkFiles.length === 0) {
      console.error("Fehler: --check braucht mindestens eine Datei.");
      process.exit(1);
    }
    await checkFilesMode(checkFiles, pool, tokenize);
    return;
  }

  if (briefId) {
    const target = targetFromId(briefId, APP_CONFIG.topicAreas);
    if (!target) {
      console.error(`Fehler: "${briefId}" ist keine gültige Id (<thema>-<band>-<nn>).`);
      console.error(`  Themen: ${APP_CONFIG.topicAreas.map(slug).join(", ")}`);
      process.exit(1);
    }
    const byLemma = poolByLemma(pool);
    const allowed = allowedLemmas(pool, target.band);
    const list = [...allowed].sort().map((l) => `${l} = ${byLemma.get(l)?.german ?? "?"}`);
    console.log(briefFor(target, list));
    return;
  }

  // Aufgabenliste: Band × Thema × perTopic, Vorhandenes übersprungen.
  const existing = new Set((await readExistingStories()).map((s) => s.id));
  const targets = [];
  for (const band of bands) {
    for (const topic of APP_CONFIG.topicAreas) {
      for (let n = 1; n <= perTopic; n++) {
        const id = `${slug(topic)}-${band}-${String(n).padStart(2, "0")}`;
        if (!existing.has(id)) targets.push({ id, band, topic });
      }
    }
  }

  console.log(`Vorhanden: ${existing.size} Geschichten.`);
  console.log(`Offen: ${targets.length} (Bänder ${bands.join(", ")}, ${perTopic} je Thema).`);
  console.log(
    `Bandgrenzen: ${BAND_LIMITS.map((l, i) => `Band ${i + 1} bis Rang ${l}`).join(", ")}, ` +
      `Band ${ALL_BANDS.length} = restlicher Pool.\n`,
  );

  if (dryRun) {
    for (const t of targets.slice(0, Number.isFinite(limit) ? limit : undefined)) {
      console.log(`  [Band ${t.band}] ${t.id} — ${t.topic}`);
    }
    console.log("\n(Dry-Run — nichts erzeugt.)");
    return;
  }

  if (targets.length === 0) {
    await revalidateAll(pool, tokenize);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Fehler: ANTHROPIC_API_KEY ist nicht gesetzt.");
    console.error("  ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-stories.mjs");
    console.error("  (Ohne Key: --validate prüft den Bestand und baut den Index neu.)");
    process.exit(1);
  }

  const client = new Anthropic();
  const byLemma = poolByLemma(pool);
  const systemByBand = new Map();
  const allowedByBand = new Map();

  let done = 0;
  let failed = 0;
  for (const target of targets) {
    if (done + failed >= limit) {
      console.log(`\nLimit erreicht (${limit}).`);
      break;
    }
    if (!allowedByBand.has(target.band)) {
      const allowed = allowedLemmas(pool, target.band);
      allowedByBand.set(target.band, allowed);
      const list = [...allowed].sort().map((l) => `${l} = ${byLemma.get(l)?.german ?? "?"}`);
      systemByBand.set(target.band, systemPrompt(list));
    }

    console.log(`[Band ${target.band}] ${target.id} — ${target.topic}`);
    try {
      const { story, errors, attempts } = await generateStory(client, {
        system: systemByBand.get(target.band),
        target,
        allowed: allowedByBand.get(target.band),
        tokenize,
      });
      if (!story) {
        failed++;
        console.error(`  ✗ verworfen nach ${MAX_ATTEMPTS} Versuchen:`);
        for (const e of errors.slice(0, 5)) console.error(`      ${e}`);
        continue;
      }
      await writeFile(
        path.join(STORIES_DIR, `${story.id}.json`),
        JSON.stringify(story, null, 1),
      );
      done++;
      const words = story.paragraphs.reduce((n, p) => n + tokenize(p.sw).length, 0);
      console.log(
        `  ✓ ${words} Wörter, ${story.lemmas.length} Lemmata, ` +
          `${story.newLemmas.length} neu (Versuch ${attempts})`,
      );
    } catch (err) {
      failed++;
      console.error(`  ✗ API-Fehler: ${err.message}`);
      // Kontingent/Auth-Probleme betreffen jeden weiteren Aufruf — abbrechen,
      // statt die Liste durchzurattern.
      if (err.status === 401 || err.status === 403) break;
    }
  }

  console.log(`\nFertig: ${done} erzeugt, ${failed} verworfen.`);
  await revalidateAll(pool, tokenize);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
