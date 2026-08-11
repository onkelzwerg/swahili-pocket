#!/usr/bin/env node
/**
 * Erzeugt und prüft die Glossare der Dialoge (W4.3).
 *
 * Warum es das gibt: die Dialoge sollen sich wie die Geschichten freischalten
 * — „noch 12 Wörter, dann kannst du das". Diese Zahl braucht eine
 * Token→Grundform-Abbildung; geraten wäre sie schlimmer als gar nicht
 * angezeigt. Nebeneffekt derselben Abbildung: Wörter im Dialog werden
 * antippbar, genau wie im Reader.
 *
 * Anders als bei den Geschichten wird hier **kein Text erzeugt**. Die Dialoge
 * stehen in src/lib/seed.ts und src/lib/dialogues-extra.ts und bleiben, wie sie
 * sind; erzeugt wird nur die Beschreibung ihres Wortschatzes. Deshalb braucht
 * dieses Skript auch keinen API-Key und keinen API-Pfad: es gibt `--brief` aus,
 * jemand schreibt die JSON, `--check` prüft sie.
 *
 * Verwendung:
 *   node scripts/generate-dialogues.mjs                 (was fehlt noch?)
 *   node scripts/generate-dialogues.mjs --brief greet    (Auftrag ausgeben)
 *   node scripts/generate-dialogues.mjs --check public/dialogues/greet.json
 *   node scripts/generate-dialogues.mjs --validate       (alles prüfen + Index bauen)
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import {
  buildDialogueIndex,
  dialogueLines,
  validateDialogueGloss,
} from "./lib/dialogue-validate.mjs";
import { STRUCTURE_LEMMAS } from "./lib/story-validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "dialogues");
const INDEX_FILE = path.join(OUT_DIR, "index.json");
const MANIFEST_FILE = path.join(ROOT, "public", "audio", "manifest.json");
const POOL_FILE = path.join(ROOT, "public", "vocab-pool.json");

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};

const validateOnly = has("--validate");
const briefId = has("--brief") ? value("--brief", null) : null;
const checkFiles = has("--check") ? args.slice(args.indexOf("--check") + 1) : null;

/**
 * Dialoge und Tokenizer aus den TS-Quellen holen. Muster und Begründung wie in
 * generate-audio.mjs: esbuild bündelt, das Ergebnis wird als Data-URL geladen.
 * Der Tokenizer kommt bewusst aus src/lib/stories.ts — eine Wortgrenze für
 * Reader, Dialog-Ansicht und beide Validatoren.
 */
async function loadAppData() {
  const entry = `
    export { dialogues } from "./src/lib/seed.ts";
    export { extraDialogues } from "./src/lib/dialogues-extra.ts";
    export { storyTokens } from "./src/lib/stories.ts";
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
  const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
  // Reihenfolge identisch zu src/lib/dialogues.ts (allDialogues).
  return { dialogues: [...mod.extraDialogues, ...mod.dialogues], tokenize: mod.storyTokens };
}

async function loadManifest() {
  if (!existsSync(MANIFEST_FILE)) return {};
  return JSON.parse(await readFile(MANIFEST_FILE, "utf8"));
}

/** Grundformen des Vokabelpools — Abgleich für die Schreibweise der Lemmata. */
async function loadPoolLemmas() {
  const pool = JSON.parse(await readFile(POOL_FILE, "utf8"));
  return new Set(pool.map((e) => e.swahili.toLowerCase()));
}

function briefFor(dialogue, tokenize) {
  const file = `public/dialogues/${dialogue.id}.json`;
  const tokens = new Set();
  for (const sw of dialogueLines(dialogue)) for (const t of tokenize(sw)) tokens.add(t);

  const lines = dialogue.turns
    .map((t, i) => `${String(i + 1).padStart(2)}. [${t.speaker}] ${t.sw}\n      ${t.de}`)
    .join("\n");

  return `Du schreibst das Glossar zu einem Swahili-Dialog einer Vokabel-Lern-App.

Das Glossar hat zwei Aufgaben: die App rechnet daraus aus, wie viel Wortschatz
dem Lernenden zum Verstehen dieses Dialogs noch fehlt, und sie zeigt beim
Antippen eines Wortes dessen Bedeutung. Beides steht und fällt damit, dass die
Grundformen stimmen — geraten ist schlechter als gar nicht angezeigt.

DIALOG: ${dialogue.id} — "${dialogue.title}"${dialogue.titleDe ? ` (${dialogue.titleDe})` : ""}
${dialogue.level ? `Stufe: ${dialogue.level}\n` : ""}
${lines}

--- REGELN ---

- Das Glossar muss GENAU die ${tokens.size} verschiedenen Token dieses Dialogs
  enthalten — jede gebeugte Form einzeln, kleingeschrieben. Kein Token darf
  fehlen, und kein Eintrag darf drinstehen, der im Dialog nicht vorkommt.
- "lemma" ist die Grundform: bei Verben der Infinitiv mit ku- (ninakula → kula),
  bei Nomen der Singular. Auch Negationen und Zeitformen führen auf dieselbe
  Grundform zurück (hakujua → kujua).
- **Die Grundform muss so geschrieben sein wie im Vokabelpool**, sonst zählt
  die App sie nie als gelernt. Schlag im Zweifel in public/vocab-pool.json nach
  (Feld "swahili").
- **Adjektive auf die Form, die der Pool führt.** Bei Kongruenz-Adjektiven ist
  das genau eine Klassenform: kizuri, nzuri, pazuri → alle "mzuri"; baya →
  "mbaya"; gumu → "ngumu". Ausnahme: lexikalisierte Adverbien behalten ihr
  eigenes Lemma — "vizuri" als „gut/ordentlich" (Art und Weise) ist ein eigenes
  Wort, nicht die Vi-Form von mzuri.
- **Lokativ auf -ni ist Beugung, kein eigenes Lemma:** dukani → "duka",
  nyumbani → "nyumba", kazini → "kazi", njiani → "njia".
- **Kollokationen** ("kupiga simu = anrufen") bekommen ihre Grundform am
  Kopfwort; die übrigen Bestandteile verweisen auf dieselbe Grundform, damit
  das Wortpaar nicht doppelt gegen die Abdeckung zählt:
    {"anapiga": {"lemma": "kupiga simu", "de": "sie ruft an"}}
    {"simu":    {"lemma": "kupiga simu", "de": "(Teil von: anrufen)"}}
  Meinst du wirklich die Einzelwörter, glossierst du sie einzeln.
- **Verbableitungen** (reziprok -ana, passiv -wa, applikativ -ia, kausativ -isha):
  nur dann ein eigenes Lemma, wenn der Pool die abgeleitete Form als eigenen
  Eintrag führt. Sonst auf das Grundverb. Beispiel: "tuonane" → der Pool kennt
  kein "kuonana", also lemma "kuona".
- "de" ist die Bedeutung GENAU DIESER FORM, nicht der Grundform:
  {"ninakula": {"lemma": "kula", "de": "ich esse"}}
  Maßgeblich ist die Funktion an dieser Stelle, nicht der Wörterbucheintrag:
  "habari" heißt wörtlich „Neuigkeit", im Gruß aber „Wie geht's?" — schreib die
  Funktion und häng das Wörtliche in Klammern an, wenn es hilft.
  Kommt dasselbe Token an zwei Stellen mit verschiedener Bedeutung vor, gibt es
  trotzdem nur einen Eintrag — formuliere ihn so, dass er auf beide passt.
- Eigennamen (Personen, Orte) bekommen "proper": true und ihre Grundform ist
  das Wort selbst. Sie zählen nicht in die Abdeckung. Viele Dialoge haben keine
  — dann gibt es auch keinen solchen Eintrag.
- Geschlossene Wortklassen zählen nicht in die Abdeckung; die App unterrichtet
  sie im Grammatik-Gym. Ihre Grundform muss **genau** eine der folgenden sein:
  ${[...STRUCTURE_LEMMAS].join(", ")}
  Ihr "de" ist das deutsche Wort plus die grammatische Einordnung in Klammern:
  {"yangu": {"lemma": "-angu", "de": "mein/meine"}}
  {"ya":    {"lemma": "ya",    "de": "von (Genitiv, N-Klasse)"}}
- Die Antwortoptionen des Rollenspiels (choices) gehören NICHT ins Glossar.
  Gemeint sind nur die Züge des Dialogs selbst.

--- ERGEBNIS ---

Schreib nach ${file}:

{
 "id": ${JSON.stringify(dialogue.id)},
 "glosses": {
  "<token, kleingeschrieben>": { "lemma": "<Grundform>", "de": "<Bedeutung dieser Form>" },
  "<eigenname>": { "lemma": "<eigenname>", "de": "<Erklärung>", "proper": true }
 }
}

Kein Feld "lemmas" — das leitet der Validator ab. public/dialogues/index.json
fasst du nicht an; den baut ein späterer Lauf von "npm run dialogues:validate".
Auch kein Feld "choices": die Entscheidungspunkte fürs Rollenspiel entstehen in
einem späteren Arbeitsgang. „0 Entscheidungspunkte" in der Prüfausgabe ist an
dieser Stelle das richtige Ergebnis, kein Mangel.

--- PRÜFUNG ---

    node scripts/generate-dialogues.mjs --check ${file}

Bessere nach und prüfe erneut, bis nichts mehr beanstandet wird.

Ein grüner Lauf allein reicht nicht: meldet die Prüfung darunter Grundformen,
die nicht im Vokabelpool stehen, geh **jede einzeln** durch. Meist ist es ein
Tippfehler, eine Klassenform statt der m-Form oder eine Ableitung, die auf das
Grundverb gehört — das sind die drei Regeln oben. Was danach übrig bleibt, ist
eine echte Lücke im Pool; nenn sie im Ergebnis, statt sie wegzudefinieren.

Die ${tokens.size} Token, die abgedeckt sein müssen:
${[...tokens].sort().join(", ")}`;
}

async function readEntries() {
  if (!existsSync(OUT_DIR)) return [];
  const files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".json") && f !== "index.json");
  const out = [];
  for (const file of files.sort()) {
    out.push(JSON.parse(await readFile(path.join(OUT_DIR, file), "utf8")));
  }
  return out;
}

async function main() {
  const { dialogues, tokenize } = await loadAppData();
  const byId = new Map(dialogues.map((d) => [d.id, d]));
  await mkdir(OUT_DIR, { recursive: true });

  if (briefId) {
    const dialogue = byId.get(briefId);
    if (!dialogue) {
      console.error(`Fehler: kein Dialog "${briefId}".`);
      console.error(`  Vorhanden: ${dialogues.map((d) => d.id).join(", ")}`);
      process.exit(1);
    }
    console.log(briefFor(dialogue, tokenize));
    return;
  }

  if (checkFiles) {
    if (checkFiles.length === 0) {
      console.error("Fehler: --check braucht mindestens eine Datei.");
      process.exit(1);
    }
    const poolLemmas = await loadPoolLemmas();
    let bad = 0;
    for (const rel of checkFiles) {
      const full = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
      let raw;
      try {
        raw = JSON.parse(await readFile(full, "utf8"));
      } catch (e) {
        console.error(`✗ ${rel}: ${e.message}`);
        bad++;
        continue;
      }
      const dialogue = byId.get(raw?.id);
      if (!dialogue) {
        console.error(`✗ ${rel}: "${raw?.id}" ist kein bekannter Dialog.`);
        bad++;
        continue;
      }
      const { errors, entry, unknownLemmas } = validateDialogueGloss(raw, {
        dialogue,
        tokenize,
        poolLemmas,
      });
      if (entry) {
        const points = Object.keys(entry.choices ?? {}).length;
        console.log(
          `✓ ${rel} — ${Object.keys(entry.glosses).length} Token, ` +
            `${entry.lemmas.length} Lemmata, ${points} Entscheidungspunkte`,
        );
        if (unknownLemmas.length > 0) {
          console.log(
            `  Hinweis: ${unknownLemmas.length} Grundformen stehen nicht im Vokabelpool ` +
              `und können nie als gelernt zählen — prüf die Schreibweise:`,
          );
          console.log(`    ${unknownLemmas.join(", ")}`);
        }
      } else {
        bad++;
        console.error(`✗ ${rel} — ${errors.length} Beanstandungen:`);
        for (const e of errors) console.error(`    ${e}`);
      }
    }
    if (bad > 0) process.exitCode = 1;
    return;
  }

  if (validateOnly) {
    const manifest = await loadManifest();
    const poolLemmas = await loadPoolLemmas();
    const entries = [];
    let bad = 0;
    for (const raw of await readEntries()) {
      const dialogue = byId.get(raw?.id);
      if (!dialogue) {
        console.error(`✗ "${raw?.id}" ist kein bekannter Dialog.`);
        bad++;
        continue;
      }
      const { errors, entry } = validateDialogueGloss(raw, { dialogue, tokenize, poolLemmas });
      if (entry) {
        entries.push(entry);
        await writeFile(
          path.join(OUT_DIR, `${entry.id}.json`),
          JSON.stringify(entry, null, 1),
        );
      } else {
        bad++;
        console.error(`✗ ${raw.id}:`);
        for (const e of errors) console.error(`    ${e}`);
      }
    }

    const index = buildDialogueIndex(entries, { dialogues, tokenize, manifest });
    await writeFile(INDEX_FILE, JSON.stringify(index, null, 1));
    const voiced = index.dialogues.filter((d) => d.hasAudio).length;
    const playable = index.dialogues.filter((d) => d.choicePoints > 0).length;
    console.log(
      `\n${entries.length} von ${dialogues.length} Dialogen mit Glossar, ` +
        `${playable} mitspielbar, ${voiced} vollständig vertont. Index geschrieben.`,
    );
    if (bad > 0) {
      console.error(`${bad} Glossare sind durchgefallen und stehen NICHT im Index.`);
      process.exitCode = 1;
    }
    return;
  }

  // Ohne Flag: Bestandsaufnahme.
  const done = new Set((await readEntries()).map((e) => e.id));
  const open = dialogues.filter((d) => !done.has(d.id));
  console.log(`${done.size} von ${dialogues.length} Dialogen haben ein Glossar.`);
  if (open.length === 0) {
    console.log("Nichts offen.");
    return;
  }
  console.log(`\nOffen (${open.length}):`);
  for (const d of open) {
    const tokens = new Set();
    for (const sw of dialogueLines(d)) for (const t of tokenize(sw)) tokens.add(t);
    console.log(`  ${d.id.padEnd(26)} ${String(tokens.size).padStart(3)} Token — ${d.title}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
