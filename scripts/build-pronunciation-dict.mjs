#!/usr/bin/env node
/**
 * Baut ein ElevenLabs-Aussprachewörterbuch (PLS) aus dem gesamten Sprachmaterial.
 *
 * Warum überhaupt: `eleven_v3` liest Swahili-Text sonst mit der Lautzuordnung
 * einer anderen Sprache — geschlossene statt offener Vokale, deutsches „j",
 * und vor allem eine Betonung, die nicht auf der vorletzten Silbe sitzt. Die
 * Phoneme kommen aus `lib/swahili-g2p.mjs` (Regeln aus 01_Kiswahili_Aussprache.pdf).
 *
 * Warum Wörterbuch statt IPA direkt im Text: beides kann `eleven_v3`, aber
 * Inline-IPA zählt gegen das Zeichenkontingent und verdoppelt die Kosten der
 * Vertonung. Ein Wörterbuch wird serverseitig angewandt — der abgerechnete Text
 * bleibt der Klartext. Bei 10.000 Credits/Monat ist das der ganze Unterschied
 * zwischen „machbar" und „nicht machbar".
 *
 * Quellen sind dieselben wie in generate-audio.mjs (Pool, Geschichten, Dialoge,
 * Phrasen, Seed-Vokabeln). Bewusst hier noch einmal geladen statt aus dem
 * Vertonungsskript exportiert: dieses Skript braucht nicht die Aufgabenliste in
 * Prioritätsreihenfolge, sondern nur die Menge aller vorkommenden Wortformen.
 *
 * Verwendung:
 *   node scripts/build-pronunciation-dict.mjs --selftest      (Regeln gegen das PDF)
 *   node scripts/build-pronunciation-dict.mjs                 (PLS schreiben)
 *   node scripts/build-pronunciation-dict.mjs --limit 1000    (nur die häufigsten)
 *   ELEVENLABS_API_KEY=sk_... node scripts/build-pronunciation-dict.mjs --upload
 *   ELEVENLABS_API_KEY=sk_... node scripts/build-pronunciation-dict.mjs --probe
 *   ELEVENLABS_API_KEY=sk_... node scripts/build-pronunciation-dict.mjs --diagnose
 *
 * --upload legt die Wörterbücher bei ElevenLabs an und schreibt ihre IDs nach
 * `scripts/lib/pronunciation-dict.json`. generate-audio.mjs liest die Datei und
 * hängt die Locators an jeden TTS-Request; fehlt sie, vertont es wie bisher.
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { toIPA, checkExamples, PDF_EXAMPLES } from "./lib/swahili-g2p.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POOL_FILE = path.join(ROOT, "public", "vocab-pool.json");
const STORIES_DIR = path.join(ROOT, "public", "stories");
const LIB_DIR = path.join(ROOT, "scripts", "lib");
const LOCATOR_FILE = path.join(LIB_DIR, "pronunciation-dict.json");
const API_BASE = "https://api.elevenlabs.io/v1";

/**
 * ElevenLabs erlaubt höchstens 3 Wörterbücher pro TTS-Request. Eine
 * Obergrenze für Regeln je Wörterbuch ist nicht dokumentiert; 1.000 ist
 * konservativ gewählt und lässt mit 3 Dateien rund 3.000 Wortformen zu.
 */
const MAX_DICTS_PER_REQUEST = 3;
const RULES_PER_DICT = 1000;

/**
 * Probesatz für --probe. Bewusst so gebaut, dass er die offene Frage
 * beantwortet, ob das Wörterbuch nur ganze Wörter trifft oder auch Teilstrings:
 *
 *   Ninakwenda  enthält die Regeln `ni` und `na`
 *   yangu/yake  enthalten die Regel `ya` — die häufigste Form überhaupt
 *   Nyumba      prüft `ny` [ɲ], kubwa/sana die Vokalqualität
 *
 * Greift die Ersetzung als Teilstring, klingt „Ninakwenda" hörbar zerhackt.
 * Klingt der Satz flüssig, ist die Wortgrenzen-Semantik bestätigt.
 */
const PROBE_TEXT = "Ninakwenda sokoni na rafiki yangu. Nyumba yake ni kubwa sana.";
const PROBE_DIR = path.join(ROOT, "scripts", "lib", "probe");

const args = process.argv.slice(2);
const selftest = args.includes("--selftest");
const upload = args.includes("--upload");
const probe = args.includes("--probe");
const diagnose = args.includes("--diagnose");
const dryRun = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) : null;
const apiKey = process.env.ELEVENLABS_API_KEY;

if (limitIdx >= 0 && !(Number.isInteger(LIMIT) && LIMIT > 0)) {
  console.error(
    `Fehler: --limit erwartet eine positive ganze Zahl (bekommen: ${args[limitIdx + 1]}).`,
  );
  process.exit(1);
}
if ((upload || probe || diagnose) && !apiKey) {
  const flag = diagnose ? "--diagnose" : probe ? "--probe" : "--upload";
  console.error(`Fehler: ${flag} braucht ELEVENLABS_API_KEY.`);
  process.exit(1);
}

/** Dialoge, Phrasen und Seed-Vokabeln aus den TypeScript-Quellen (wie generate-audio.mjs). */
async function loadAppData() {
  const entry = `
    export { dialogues, phraseOfDay, seedVocab } from "./src/lib/seed.ts";
    export { extraDialogues } from "./src/lib/dialogues-extra.ts";
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

/** Alle Swahili-Texte, die je vertont werden — Reihenfolge egal. */
async function collectTexts() {
  const texts = [];
  const pool = JSON.parse(await readFile(POOL_FILE, "utf8"));
  for (const entry of pool) {
    texts.push(entry.swahili);
    for (const ex of entry.examples ?? []) if (ex.sw) texts.push(ex.sw);
  }

  const { dialogues, extraDialogues, phraseOfDay, seedVocab } = await loadAppData();
  for (const d of [...dialogues, ...extraDialogues]) {
    for (const turn of d.turns) if (turn.sw) texts.push(turn.sw);
  }
  for (const p of phraseOfDay) if (p.sw) texts.push(p.sw);
  for (const v of seedVocab()) {
    texts.push(v.swahili);
    for (const ex of v.examples ?? []) if (ex.sw) texts.push(ex.sw);
  }

  if (existsSync(STORIES_DIR)) {
    const files = (await readdir(STORIES_DIR)).filter(
      (f) => f.endsWith(".json") && f !== "index.json",
    );
    for (const file of files) {
      const story = JSON.parse(await readFile(path.join(STORIES_DIR, file), "utf8"));
      for (const p of story.paragraphs ?? []) if (p?.sw) texts.push(p.sw);
    }
  }
  return texts;
}

/**
 * Wortformen mit ihrer Häufigkeit, **case-sensitiv**.
 *
 * Die Wörterbuchsuche bei ElevenLabs unterscheidet Groß- und Kleinschreibung,
 * deshalb bekommt „Habari" am Satzanfang einen eigenen Eintrag neben „habari".
 * Das kostet Einträge, aber ein fehlender Treffer heißt stillschweigend
 * Standardaussprache — und ausgerechnet das erste Wort eines Satzes fiele auf.
 */
function tokenize(texts) {
  const counts = new Map();
  for (const text of texts) {
    for (const token of text.match(/[A-Za-zÀ-ÿ']+/g) ?? []) {
      // Anführungszeichen am Rand abstreifen, das Apostroph in ng' behalten.
      const word = token.replace(/^'+|'+$/g, "");
      if (word.length < 2) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return counts;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * PLS-Dokument nach W3C Pronunciation Lexicon Specification.
 * Die Schrägstriche um das Phonem folgen dem Beispiel der ElevenLabs-Doku.
 */
function toPls(entries) {
  const lexemes = entries
    .map(
      ({ word, ipa }) =>
        `  <lexeme>\n    <grapheme>${escapeXml(word)}</grapheme>\n    <phoneme>/${ipa}/</phoneme>\n  </lexeme>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0"
    xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
    alphabet="ipa" xml:lang="sw">
${lexemes}
</lexicon>
`;
}

async function uploadDict(name, pls) {
  const form = new FormData();
  form.append("name", name);
  form.append("file", new Blob([pls], { type: "text/xml" }), `${name}.pls`);
  form.append("description", "Swahili Pocket – IPA aus swahili-g2p.mjs");

  const res = await fetch(`${API_BASE}/pronunciation-dictionaries/add-from-file`, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  return {
    pronunciation_dictionary_id: json.id ?? json.pronunciation_dictionary_id,
    version_id: json.version_id,
  };
}

/**
 * Diagnose: ein Satz je Aussprachemerkmal, **ohne** Wörterbuch.
 *
 * Hintergrund: ein Wörterbuch über alle 3.000 Wortformen macht die Vertonung
 * abgehackt — dann ersetzt jedes Wort im Satz durch seine Einzeltranskription,
 * und die Satzmelodie geht verloren. Die ElevenLabs-Doku empfiehlt IPA
 * ausdrücklich selektiv für einzelne Wörter, das deckt sich mit dem Befund.
 *
 * Selektiv heißt aber: man muss wissen, *welche* Wörter das Modell wirklich
 * falsch spricht. Nur 22 % der Wortformen haben überhaupt ein Merkmal, bei dem
 * etwas schiefgehen kann. Dieser Lauf führt jedes Merkmal einzeln vor, damit
 * die Entscheidung auf Hören beruht statt auf Vermutung. Kosten: ~200 Zeichen.
 */
const DIAGNOSTICS = [
  {
    key: "1-endlaengung",
    feature: "Endlängung + Betonung hinten",
    text: "Saa nane. Nataka kukaa juu ya kitanda.",
    listen: "saa, kukaa, juu — langer Endvokal, Betonung auf der letzten Silbe?",
  },
  {
    key: "2-hiat",
    feature: "Hiat (Vokale einzeln, kein Diphthong)",
    text: "Leo kuna mvua na jua. Sijui kwa nini.",
    listen: "leo, mvua, jua, sijui — zwei getrennte Vokale, nicht zu einem verschliffen?",
  },
  {
    key: "3-betonung",
    feature: "Betonung auf der vorletzten Silbe",
    text: "Alitutambulisha kwa maandamano makubwa.",
    listen: "alitutambuLIsha, maandaMAno — sitzt die Betonung vorletzt?",
  },
  {
    key: "4-vokalqualitaet",
    feature: "Offene Vokale",
    text: "Kitabu kizuri ni cha rafiki mzuri.",
    listen: 'kitabu, kizuri — i wie in „in", u wie in „Kuss", nicht geschlossen?',
  },
  {
    key: "5-konsonanten",
    feature: "dh/th/gh/kh, ng', Doppelkonsonant",
    text: "Tafadhali, ng'ombe mmoja ni ghali sana.",
    listen: "tafadhali, ng'ombe, mmoja, ghali — die Sonderlaute korrekt?",
  },
];

async function runDiagnose() {
  await mkdir(PROBE_DIR, { recursive: true });
  const voiceId = "zw6zMBO3821KTR5PyClL"; // Neema, wie in generate-audio.mjs
  const chars = DIAGNOSTICS.reduce((n, d) => n + d.text.length, 0);
  console.log(`Diagnose ohne Wörterbuch — ${DIAGNOSTICS.length} Sätze, ${chars} Zeichen.\n`);

  for (const d of DIAGNOSTICS) {
    const res = await fetch(`${API_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ text: d.text, model_id: "eleven_v3" }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const file = path.join(PROBE_DIR, `${d.key}.mp3`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`${d.feature}`);
    console.log(`  „${d.text}"`);
    console.log(`  → ${path.relative(ROOT, file)}`);
    console.log(`  Achte auf: ${d.listen}\n`);
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log("Sag anschließend, welche Nummern falsch klingen — nur für die");
  console.log("entstehen Regeln. Alles andere bleibt unangetastet und flüssig.");
}

/**
 * Hörprobe: derselbe Satz einmal mit und einmal ohne Wörterbuch.
 *
 * Zweck ist nicht Schönheit, sondern eine Entscheidung vor dem großen Lauf.
 * Ein vollständiges Neu-Vertonen kostet gut 106.000 Zeichen; ob das Wörterbuch
 * greift und ob es nur ganze Wörter trifft, lässt sich vorher für rund 120
 * Zeichen klären. Vorher wird per GET geprüft, dass die Wörterbücher
 * serverseitig überhaupt angekommen sind — ein 200 beim Upload beweist das
 * noch nicht.
 */
async function runProbe() {
  if (!existsSync(LOCATOR_FILE)) {
    console.error("Fehler: keine Locators. Erst --upload ausführen.");
    process.exit(1);
  }
  const { locators } = JSON.parse(await readFile(LOCATOR_FILE, "utf8"));

  console.log("Wörterbücher serverseitig prüfen …");
  for (const loc of locators) {
    const res = await fetch(
      `${API_BASE}/pronunciation-dictionaries/${loc.pronunciation_dictionary_id}`,
      { headers: { "xi-api-key": apiKey } },
    );
    if (!res.ok) {
      console.error(`  ${loc.pronunciation_dictionary_id}: ${res.status} — nicht abrufbar.`);
      process.exit(1);
    }
    const d = await res.json();
    const rules = d.latest_version_rules_num ?? d.rules?.length;
    console.log(`  ${d.name ?? loc.pronunciation_dictionary_id}: ${rules ?? "?"} Regeln`);
  }

  await mkdir(PROBE_DIR, { recursive: true });
  const voiceId = "zw6zMBO3821KTR5PyClL"; // Neema, wie in generate-audio.mjs
  const variants = [
    { file: "ohne-woerterbuch.mp3", body: { text: PROBE_TEXT, model_id: "eleven_v3" } },
    {
      file: "mit-woerterbuch.mp3",
      body: {
        text: PROBE_TEXT,
        model_id: "eleven_v3",
        pronunciation_dictionary_locators: locators,
      },
    },
  ];

  console.log(`\nProbesatz (${PROBE_TEXT.length} Zeichen): ${PROBE_TEXT}`);
  for (const v of variants) {
    const res = await fetch(`${API_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify(v.body),
    });
    if (!res.ok) {
      throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    await writeFile(path.join(PROBE_DIR, v.file), Buffer.from(await res.arrayBuffer()));
    console.log(`  ${path.relative(ROOT, path.join(PROBE_DIR, v.file))}`);
  }

  console.log("\nBeide anhören und vergleichen. Worauf es ankommt:");
  console.log('  1. Klingt „Ninakwenda" flüssig? Zerhackt = Teilstring-Ersetzung, dann stoppen.');
  console.log("  2. Liegt die Betonung auf der vorletzten Silbe (soKOni, raFIki, NYUMba)?");
  console.log('  3. Sind die Vokale offen — „kubwa" mit dem u aus „Kuss", nicht aus „Kuh"?');
}

async function main() {
  if (diagnose) {
    await runDiagnose();
    return;
  }
  if (probe) {
    await runProbe();
    return;
  }

  const deviations = checkExamples();
  if (selftest || deviations.length) {
    console.log(
      `Selbsttest gegen das PDF: ${PDF_EXAMPLES.length} Fälle, ${deviations.length} Abweichungen.`,
    );
    for (const d of deviations) {
      console.log(`  ${d.word}: erwartet /${d.ipa}/, bekommen /${d.got}/`);
    }
    if (deviations.length) process.exit(1);
    if (selftest) {
      console.log("Alle Prüffälle stimmen. 🎉");
      return;
    }
  }

  const texts = await collectTexts();
  const counts = tokenize(texts);

  // Nach Häufigkeit sortieren, damit --limit die wichtigsten behält und nicht
  // alphabetisch abschneidet (der Pool ist alphabetisch sortiert — ohne diese
  // Sortierung endete ein Limit bei „ku…" und ließe den Rest liegen).
  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => ({ word, ipa: toIPA(word) }))
    .filter((e) => e.ipa);

  // Default ist die Menge, die tatsächlich in einen Request passt. Ohne
  // Grenze entstünden 5 Wörterbücher, von denen 2 nie zum Einsatz kämen.
  const selected = ranked.slice(0, LIMIT ?? MAX_DICTS_PER_REQUEST * RULES_PER_DICT);

  /**
   * Ausgewählt wird nach Häufigkeit, **geschrieben** nach Länge absteigend.
   *
   * Die Doku sagt, das Wörterbuch werde „von vorn bis hinten geprüft und nur
   * die allererste Ersetzung verwendet", legt sich aber nicht fest, ob nur
   * ganze Wörter greifen oder auch Teilstrings. Bei Teilstring-Semantik würde
   * die Regel für `ya` in `yake` und `yangu` hineinschlagen — und `ya` ist die
   * häufigste Form überhaupt, stünde also ganz vorn. Längste zuerst kostet
   * nichts und macht diesen Fall unmöglich: `yake` trifft vor `ya`.
   */
  const ordered = [...selected].sort(
    (a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word),
  );

  const chunks = [];
  for (let i = 0; i < ordered.length; i += RULES_PER_DICT) {
    chunks.push(ordered.slice(i, i + RULES_PER_DICT));
  }

  const chars = texts.reduce((n, t) => n + t.length, 0);
  console.log(`Texte: ${texts.length} (${chars} Zeichen im Klartext).`);
  console.log(`Distinkte Wortformen: ${counts.size}, davon aufgenommen: ${selected.length}.`);
  console.log(`Wörterbücher: ${chunks.length} à max. ${RULES_PER_DICT} Regeln.`);

  const dropped = counts.size - selected.length;
  if (dropped > 0) {
    const kept = selected.reduce((n, e) => n + counts.get(e.word), 0);
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    console.log(
      `Ohne Regel: ${dropped} seltene Formen — abgedeckt bleiben ${((100 * kept) / total).toFixed(1)} % aller Vorkommen.`,
    );
  }
  if (chunks.length > MAX_DICTS_PER_REQUEST) {
    console.warn(
      `\nWarnung: ${chunks.length} Wörterbücher, nutzbar sind nur ${MAX_DICTS_PER_REQUEST}.\n`,
    );
  }

  const written = [];
  for (const [i, chunk] of chunks.entries()) {
    const name = `swahili-pocket-${i + 1}`;
    const file = path.join(LIB_DIR, `${name}.pls`);
    if (!dryRun) await writeFile(file, toPls(chunk));
    written.push({ name, file, rules: chunk.length });
    console.log(`  ${path.relative(ROOT, file)} — ${chunk.length} Regeln`);
  }

  console.log("\nStichprobe der häufigsten Wortformen:");
  for (const e of selected.slice(0, 12)) console.log(`  ${e.word.padEnd(14)} /${e.ipa}/`);

  if (!upload) {
    console.log(
      dryRun
        ? "\n(Dry-Run — nichts geschrieben.)"
        : "\nFertig. Mit --upload bei ElevenLabs anlegen und die Locators speichern.",
    );
    return;
  }

  const locators = [];
  for (const { name, file } of written.slice(0, MAX_DICTS_PER_REQUEST)) {
    const pls = await readFile(file, "utf8");
    console.log(`Lade hoch: ${name} …`);
    locators.push(await uploadDict(name, pls));
  }
  await writeFile(LOCATOR_FILE, JSON.stringify({ locators }, null, 1));
  console.log(
    `\n${locators.length} Wörterbücher angelegt, Locators in ${path.relative(ROOT, LOCATOR_FILE)}.`,
  );
  console.log("generate-audio.mjs nutzt sie ab dem nächsten Lauf automatisch.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
