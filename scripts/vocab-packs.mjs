#!/usr/bin/env node
/**
 * Nimmt neue Vokabeln in den Kern-Pool und in die Themenpakete auf (W4.12).
 *
 * Hintergrund: beim Glossieren der 23 Dialoge fehlten 97 Grundformen im Pool.
 * 41 davon sind Alltagswortschatz und gehören allen, 56 sind themengebunden.
 * Letztere landen in Paketen, die der Nutzer bei Bedarf aktiviert — ein
 * Anfänger soll die Sprache lernen können, ohne „Erosion" und „Zinssatz" im
 * Stapel zu haben.
 *
 * Die Aufteilung steht in scripts/lib/pool-additions.json und ist die
 * Auftragsliste. Dieses Skript prüft, was daraus geschrieben wurde, und fügt
 * es zusammen.
 *
 * Verwendung:
 *   node scripts/vocab-packs.mjs                       (was fehlt noch?)
 *   node scripts/vocab-packs.mjs --brief core-1        (Auftrag ausgeben)
 *   node scripts/vocab-packs.mjs --check <datei…>      (eine Lieferung prüfen)
 *   node scripts/vocab-packs.mjs --build               (einpflegen + Index)
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAN_FILE = path.join(ROOT, "scripts", "lib", "pool-additions.json");
const WORK_DIR = path.join(ROOT, "scripts", "lib", "additions");
const POOL_FILE = path.join(ROOT, "public", "vocab-pool.json");
const PACK_DIR = path.join(ROOT, "public", "vocab-packs");
const PACK_INDEX = path.join(PACK_DIR, "index.json");

/** Kern-Wörter werden in Gruppen dieser Größe vergeben. */
const CORE_GROUP_SIZE = 11;

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const value = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d;
};

const plan = JSON.parse(await readFile(PLAN_FILE, "utf8"));
const pool = JSON.parse(await readFile(POOL_FILE, "utf8"));
const poolWords = new Set(pool.map((e) => e.swahili.toLowerCase()));

/** Die Arbeitspakete: Kern in Gruppen, dazu je ein Paket. */
function groups() {
  const out = [];
  for (let i = 0; i < plan.core.length; i += CORE_GROUP_SIZE) {
    out.push({
      id: `core-${out.length + 1}`,
      kind: "core",
      title: "Kern-Pool",
      words: plan.core.slice(i, i + CORE_GROUP_SIZE),
      target: path.join("scripts", "lib", "additions", `core-${out.length + 1}.json`),
    });
  }
  for (const [id, pack] of Object.entries(plan.packs)) {
    out.push({
      id,
      kind: "pack",
      title: pack.title,
      emoji: pack.emoji,
      description: pack.description,
      words: pack.words,
      target: path.join("public", "vocab-packs", `${id}.json`),
    });
  }
  return out;
}

const ALL = groups();
const byId = new Map(ALL.map((g) => [g.id, g]));

// ---------------------------------------------------------------------------
// Prüfung
// ---------------------------------------------------------------------------

/**
 * Enthält der Beispielsatz das Wort wirklich — in irgendeiner gebeugten Form?
 *
 * Ohne diese Prüfung wandern Sätze durch, die das Stichwort gar nicht zeigen.
 * Das wäre doppelt schlimm: als Lernmaterial nutzlos, und die Bandzuordnung
 * rechnet aus genau diesen Sätzen die Häufigkeit.
 */
function exampleShowsWord(sw, word) {
  const text = sw.toLowerCase();
  // Verben: der Stamm ohne ku- steckt in jeder konjugierten Form.
  // Nomen/Adjektive: der Wortkörper ohne Klassenpräfix.
  const loose = new Set();
  const strict = new Set([word]);

  if (word.startsWith("ku") && word.length > 3) {
    const stem = word.slice(2);
    // Der Verbstamm steckt in jeder konjugierten Form: kuuma → kinauma.
    // Deshalb schon ab drei Zeichen als Teilstring erlaubt — sonst müsste man
    // „Kichwa kinauma" meiden, den natürlichsten Satz, den es für das Wort gibt.
    if (stem.length >= 3) loose.add(stem);
    // Konjunktiv und Objektform tauschen den Endvokal: kueleza → nieleze.
    if (stem.length >= 4) loose.add(stem.slice(0, -1));
  }
  if (word.length > 4) loose.add(word.slice(1));
  for (const part of word.split(" ")) if (part.length >= 3) strict.add(part);

  for (const s of loose) if (s.length >= 3 && text.includes(s)) return true;

  for (const s of strict) {
    // Lange Stämme dürfen irgendwo im Wort stecken — genau das macht die
    // Beugung aus (kuandaa → ninaandaa).
    if (s.length >= 4) {
      if (text.includes(s)) return true;
      continue;
    }
    // Kurze Stichwörter nur als ganzes Wort. Ein Substring-Treffer wäre hier
    // Zufall: „ipi" steckt auch in „kipimo". Ohne diese Zeile fiele jedes
    // dreibuchstabige Stichwort grundsätzlich durch.
    if (new RegExp(`(^|[^a-zà-ÿ])${s}([^a-zà-ÿ]|$)`, "i").test(text)) return true;
  }
  return false;
}

function checkEntries(entries, expected, label, errors) {
  const seen = new Set();
  const wanted = new Map(expected.map((w) => [w.sw, w]));

  for (const e of entries) {
    const w = e?.swahili?.toLowerCase();
    const at = `${label}: "${e?.swahili ?? "(ohne swahili)"}"`;
    if (!w) {
      errors.push(`${label}: Eintrag ohne "swahili".`);
      continue;
    }
    if (!wanted.has(w)) errors.push(`${at} steht nicht auf der Auftragsliste.`);
    if (seen.has(w)) errors.push(`${at} kommt doppelt vor.`);
    seen.add(w);
    if (poolWords.has(w)) errors.push(`${at} steht bereits im Vokabelpool.`);
    if (!e.german?.trim()) errors.push(`${at}: kein deutsches Feld.`);
    if (!["noun", "verb", "adjective", "adverb", "other"].includes(e.partOfSpeech)) {
      errors.push(`${at}: partOfSpeech "${e.partOfSpeech}" ist ungültig.`);
    }
    if (e.partOfSpeech === "noun" && !e.nounClass) {
      errors.push(`${at}: Nomen ohne nounClass.`);
    }
    if (!Array.isArray(e.examples) || e.examples.length !== 2) {
      errors.push(`${at}: genau zwei Beispielsätze erwartet.`);
      continue;
    }
    e.examples.forEach((ex, i) => {
      const exAt = `${at}, Beispiel ${i + 1}`;
      if (!ex?.sw?.trim()) errors.push(`${exAt}: kein Swahili-Satz.`);
      if (!ex?.de?.trim()) errors.push(`${exAt}: keine Übersetzung.`);
      if (typeof ex?.sw === "string" && /\d/.test(ex.sw)) {
        errors.push(`${exAt}: Ziffern im Swahili-Satz (Zahlen ausschreiben).`);
      }
      if (typeof ex?.sw === "string" && !exampleShowsWord(ex.sw, w)) {
        errors.push(`${exAt}: der Satz enthält "${w}" in keiner erkennbaren Form.`);
      }
    });
  }

  for (const w of wanted.keys()) {
    if (!seen.has(w)) errors.push(`${label}: "${w}" fehlt.`);
  }
}

// ---------------------------------------------------------------------------
// Modi
// ---------------------------------------------------------------------------

async function readDelivery(group) {
  const full = path.join(ROOT, group.target);
  if (!existsSync(full)) return null;
  const raw = JSON.parse(await readFile(full, "utf8"));
  return Array.isArray(raw) ? { entries: raw } : raw;
}

if (has("--brief")) {
  const group = byId.get(value("--brief", ""));
  if (!group) {
    console.error(`Fehler: keine Gruppe "${value("--brief", "")}".`);
    console.error(`  Vorhanden: ${ALL.map((g) => g.id).join(", ")}`);
    process.exit(1);
  }
  const isPack = group.kind === "pack";
  console.log(`Du schreibst Vokabeleinträge für eine Swahili-Lern-App.

${isPack ? `THEMENPAKET: ${group.title} ${group.emoji}\n${group.description}` : "ZIEL: der Kern-Vokabelpool (Alltagswortschatz für alle)"}

Diese ${group.words.length} Wörter fehlen und sollen aufgenommen werden:

${group.words.map((w) => `  ${w.sw.padEnd(16)} ${w.de}   [${w.pos}${w.class ? ", " + w.class : ""}]`).join("\n")}

--- REGELN ---

- Für jedes Wort **genau zwei** Beispielsätze, jeweils Swahili und Deutsch.
- **Jeder Satz muss das Stichwort wirklich enthalten**, gern gebeugt
  (kuandaa → "Ninaandaa chakula"). Ein Satz ohne das Wort ist wertlos: er ist
  kein Lernmaterial, und die Bandzuordnung der App rechnet die Worthäufigkeit
  aus genau diesen Sätzen.
- Benutze im Satz sonst möglichst **einfachen, häufigen** Wortschatz. Die Sätze
  sind Anfängermaterial, nicht Stilproben.
- Zahlen ausschreiben, nie als Ziffern.
- Tansanisches Kiswahili sanifu, natürliche Sätze aus dem Alltag.
- Die deutsche Übersetzung ist natürlich, nicht Wort für Wort.

--- ERGEBNIS ---

Schreib nach ${group.target}:

${
  isPack
    ? `{
 "id": ${JSON.stringify(group.id)},
 "title": ${JSON.stringify(group.title)},
 "emoji": ${JSON.stringify(group.emoji)},
 "description": ${JSON.stringify(group.description)},
 "entries": [ … ]
}`
    : `[ … ]   (nur das Array der Einträge)`
}

Jeder Eintrag hat genau diese Form:

{
 "swahili": "kuandaa",
 "german": "vorbereiten",
 "partOfSpeech": "verb",
 "nounClass": null,
 "examples": [
  { "de": "Ich bereite das Essen vor.", "sw": "Ninaandaa chakula." },
  { "de": "Wir haben alles vorbereitet.", "sw": "Tumeandaa kila kitu." }
 ],
 "topics": []
}

"nounClass" nur bei Nomen füllen (M-Wa, M-Mi, Ki-Vi, N, U, Ji-Ma, Pa-Ku-Mu, Ku),
sonst null. Übernimm Bedeutung, Wortart und Klasse aus der Liste oben.

--- PRÜFUNG ---

    node scripts/vocab-packs.mjs --check ${group.target}

Bessere nach, bis nichts mehr beanstandet wird.`);
} else if (has("--check")) {
  const files = args.slice(args.indexOf("--check") + 1);
  const errors = [];
  for (const rel of files) {
    const group = ALL.find((g) => path.basename(g.target) === path.basename(rel));
    if (!group) {
      errors.push(`${rel}: gehört zu keiner bekannten Gruppe.`);
      continue;
    }
    const data = await readDelivery(group);
    if (!data) {
      errors.push(`${rel}: nicht vorhanden.`);
      continue;
    }
    checkEntries(data.entries ?? [], group.words, path.basename(rel), errors);
    if (group.kind === "pack") {
      for (const f of ["id", "title", "emoji", "description"]) {
        if (!data[f]) errors.push(`${rel}: Feld "${f}" fehlt.`);
      }
    }
  }
  if (errors.length === 0) {
    console.log(`✓ ${files.length} Datei(en) in Ordnung.`);
  } else {
    console.error(`✗ ${errors.length} Beanstandungen:`);
    for (const e of errors) console.error(`    ${e}`);
    process.exitCode = 1;
  }
} else if (has("--build")) {
  const errors = [];
  const coreEntries = [];
  const packs = [];

  for (const group of ALL) {
    const data = await readDelivery(group);
    if (!data) {
      errors.push(`${group.id}: Lieferung fehlt (${group.target}).`);
      continue;
    }
    checkEntries(data.entries ?? [], group.words, group.id, errors);
    if (group.kind === "core") coreEntries.push(...(data.entries ?? []));
    else packs.push({ group, data });
  }
  if (errors.length > 0) {
    console.error(`✗ ${errors.length} Beanstandungen — nichts geschrieben:`);
    for (const e of errors) console.error(`    ${e}`);
    process.exit(1);
  }

  // Kern in den Pool, alphabetisch wie der Bestand.
  const merged = [...pool, ...coreEntries].sort((a, b) =>
    a.swahili.toLowerCase().localeCompare(b.swahili.toLowerCase(), "sw"),
  );
  await writeFile(POOL_FILE, "[\n" + merged.map((e) => JSON.stringify(e)).join(",\n") + "\n]\n");

  // Pakete normalisiert zurückschreiben und indizieren.
  await mkdir(PACK_DIR, { recursive: true });
  const index = { version: 1, packs: [] };
  for (const { group, data } of packs.sort((a, b) => a.group.id.localeCompare(b.group.id))) {
    const entries = [...data.entries].sort((a, b) =>
      a.swahili.toLowerCase().localeCompare(b.swahili.toLowerCase(), "sw"),
    );
    await writeFile(
      path.join(PACK_DIR, `${group.id}.json`),
      JSON.stringify({ ...data, entries }, null, 1),
    );
    index.packs.push({
      id: group.id,
      title: data.title,
      emoji: data.emoji,
      description: data.description,
      wordCount: entries.length,
    });
  }
  await writeFile(PACK_INDEX, JSON.stringify(index, null, 1));

  console.log(
    `${coreEntries.length} Wörter in den Kern-Pool (${pool.length} → ${merged.length}), ` +
      `${index.packs.length} Pakete mit ${index.packs.reduce((n, p) => n + p.wordCount, 0)} Wörtern.`,
  );
} else {
  // Bestandsaufnahme.
  console.log(
    `Auftragsliste: ${plan.core.length} Kernwörter, ` +
      `${Object.keys(plan.packs).length} Pakete mit ` +
      `${Object.values(plan.packs).reduce((n, p) => n + p.words.length, 0)} Wörtern.\n`,
  );
  console.log("Gruppe                      Wörter  Lieferung");
  for (const g of ALL) {
    const done = existsSync(path.join(ROOT, g.target));
    console.log(
      `  ${g.id.padEnd(26)} ${String(g.words.length).padStart(4)}  ${done ? "da" : "offen"}`,
    );
  }
  await mkdir(WORK_DIR, { recursive: true });
}
