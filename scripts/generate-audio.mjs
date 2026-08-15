#!/usr/bin/env node
/**
 * Erzeugt MP3-Audio für Dialoge, Phrasen und Vokabeln über die ElevenLabs-API.
 *
 * Reihenfolge der Vertonung:
 *   1. Dialoge (seed.ts + dialogues-extra.ts) — Sprecher A/B/C bekommen je
 *      eine eigene Stimme (Default s.u., überschreibbar via Dialogue.voiceMap).
 *   2. Geschichten (public/stories/*.json), absatzweise, nach Band sortiert —
 *      Band 1 zuerst. Vor den Vokabeln, weil eine halb vertonte Geschichte
 *      unbenutzbar ist, eine halb vertonte Wortliste dagegen nicht: der Reader
 *      fiele bei jedem fehlenden Absatz auf die Web-Speech-Stimme zurück, und
 *      die spricht Swahili zu unzuverlässig aus, um einen Text zu tragen.
 *   3. Phrasen des Tages (seed.ts phraseOfDay)
 *   4. Seed-Vokabeln inkl. Beispiele (seed.ts seedVocab)
 *   5. Pool-Vokabeln (public/vocab-pool.json): erst Wörter, dann Beispielsätze.
 *
 * - Ziel: public/audio/<hash>.mp3 + public/audio/manifest.json
 *   (Manifest: Text → Dateiname; wird von src/lib/tts.ts geladen).
 * - Wiederaufnehmbar: Texte, die schon im Manifest stehen, werden übersprungen.
 *   Das Manifest wird nach jeder Datei gespeichert — Abbruch ist jederzeit ok.
 * - Budget: Free-Tier hat 10.000 Credits/Monat, Eleven v3 rechnet ~1 Zeichen
 *   = 1 Credit. Default-Budget pro Lauf: 9.000 Zeichen (Puffer fürs Konto).
 *
 * Verwendung:
 *   ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs
 *   ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs --budget 5000
 *   ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs --band 1
 *   node scripts/generate-audio.mjs --dry-run   (zeigt nur, was passieren würde)
 *   node scripts/generate-audio.mjs --prune     (Waisen entfernen, kostet nichts)
 *
 * --band <1..4> grenzt **nur die Beispielsätze** auf Trägerwörter bis
 * einschließlich dieses Bandes ein — dieselbe Rangheuristik wie die
 * Geschichten-Pipeline (scripts/lib/story-bands.mjs), also keine zweite
 * Wahrheit über den Wortschatz. Nötig, weil der Pool alphabetisch sortiert
 * ist: ohne Filter vertont der erste Lauf die Sätze zu `abiria` und `ada` und
 * lässt `kwenda` liegen. Die Bänder sind kumulativ, `--band 2` schließt Band 1
 * ein; was schon im Manifest steht, wird ohnehin übersprungen.
 * Wörter, Dialoge, Geschichten und Phrasen filtert `--band` nicht: die Wörter
 * sind zusammen keine 2 % der Arbeit und schalten die Übungsart „Hören" frei,
 * der Rest hat gar keinen Bandrang.
 *
 * --prune löscht Manifest-Einträge und MP3s, deren Text es in der App nicht
 * mehr gibt. Das Manifest ist nach exaktem Text geschlüsselt — wird eine
 * Vokabel oder ein Beispielsatz geändert, bleibt die alte Aufnahme als Waise
 * liegen. Mit --dry-run kombinierbar, braucht keinen API-Key.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { rankPool, bandForRank, CORE_BAND } from "./lib/story-bands.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POOL_FILE = path.join(ROOT, "public", "vocab-pool.json");
const STORIES_DIR = path.join(ROOT, "public", "stories");
const AUDIO_DIR = path.join(ROOT, "public", "audio");
const MANIFEST_FILE = path.join(AUDIO_DIR, "manifest.json");

// Eleven v3 ist das einzige ElevenLabs-Modell mit Swahili-Support.
const MODEL_ID = "eleven_v3";
const OUTPUT_FORMAT = "mp3_44100_64";
const API_BASE = "https://api.elevenlabs.io/v1";

// Reihenfolge identisch zu APP_CONFIG.elevenlabsVoiceIds (src/config/app.config.ts).
// `profile` ist der Schlüssel, den Dialogue.voiceMap referenziert.
const VOICES = [
  { name: "Neema", profile: "neema", id: "zw6zMBO3821KTR5PyClL" },
  { name: "Juma", profile: "juma", id: "ZCxLldjTfQRRQvq80pEI" },
  { name: "Zawadi", profile: "zawadi", id: "wbMtjZ3Tz2AyyRCKYqby" },
];

// Default-Stimmen für Dialog-Sprecher; pro Dialog via voiceMap überschreibbar,
// z. B. voiceMap: { A: "zawadi", B: "juma" }.
const SPEAKER_DEFAULT = { A: "juma", B: "neema", C: "zawadi" };

function voiceByProfile(profile) {
  return VOICES.find((v) => v.profile === profile);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const prune = args.includes("--prune");
const budgetIdx = args.indexOf("--budget");
const BUDGET = budgetIdx >= 0 ? Number(args[budgetIdx + 1]) : 9000;
const bandIdx = args.indexOf("--band");
const MAX_BAND = bandIdx >= 0 ? Number(args[bandIdx + 1]) : null;
const apiKey = process.env.ELEVENLABS_API_KEY;

if (bandIdx >= 0 && !(Number.isInteger(MAX_BAND) && MAX_BAND >= 1 && MAX_BAND <= 4)) {
  console.error(
    `Fehler: --band erwartet eine ganze Zahl von 1 bis 4 (bekommen: ${args[bandIdx + 1]}).`,
  );
  process.exit(1);
}

// --prune schreibt keine Audios und braucht deshalb keinen Key.
if (!dryRun && !prune && !apiKey) {
  console.error("Fehler: ELEVENLABS_API_KEY ist nicht gesetzt.");
  console.error("  ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs");
  process.exit(1);
}

/** Alle Beispiele eines Wortes bekommen dieselbe Stimme wie das Wort selbst. */
function voiceForWord(word) {
  const h = createHash("sha1").update(word).digest();
  return VOICES[h[0] % VOICES.length];
}

function fileNameFor(text, voiceId) {
  return createHash("sha1").update(`${voiceId}|${text}`).digest("hex").slice(0, 16) + ".mp3";
}

async function loadManifest() {
  if (!existsSync(MANIFEST_FILE)) return {};
  return JSON.parse(await readFile(MANIFEST_FILE, "utf8"));
}

async function saveManifest(manifest) {
  await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 1));
}

async function ttsRequest(text, voiceId) {
  const url = `${API_BASE}/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({ text, model_id: MODEL_ID }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());

    const body = await res.text();
    if (body.includes("quota_exceeded")) {
      throw Object.assign(new Error("Monats-Kontingent aufgebraucht."), { quota: true });
    }
    if (res.status === 429 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 5000 * attempt));
      continue;
    }
    throw new Error(`ElevenLabs ${res.status}: ${body.slice(0, 300)}`);
  }
}

/**
 * Lädt Dialoge, Phrasen und Seed-Vokabeln aus den TypeScript-Quellen.
 * esbuild bündelt die Module (löst extensionslose Imports auf und entfernt
 * Typen), das Ergebnis wird als Data-URL importiert — keine Temp-Dateien.
 */
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

/**
 * Geschichten aus public/stories/, nach Band sortiert.
 * Der Index bleibt außen vor: er wird aus den Einzeldateien gebaut und würde
 * hier nur eine zweite Wahrheit über den Bestand aufmachen.
 */
async function loadStories() {
  if (!existsSync(STORIES_DIR)) return [];
  const files = (await readdir(STORIES_DIR)).filter(
    (f) => f.endsWith(".json") && f !== "index.json",
  );
  const stories = [];
  for (const file of files) {
    stories.push(JSON.parse(await readFile(path.join(STORIES_DIR, file), "utf8")));
  }
  return stories.sort((a, b) => (a.band ?? 9) - (b.band ?? 9) || a.id.localeCompare(b.id));
}

/**
 * Schreibweise → Band, für `--band`. Wortgleich mit der Bandzuordnung der
 * Geschichten-Pipeline: erst der Häufigkeitsrang, dann `CORE_BAND` additiv
 * darüber — ein Wort kann in ein früheres Band gezogen werden, keines verliert
 * seinen Platz. Ohne diese Ergänzung lägen `kuwa` und `lakini` außerhalb von
 * Band 1, und ihre Beispielsätze kämen als Letztes an die Reihe.
 */
function bandByWord(pool) {
  const band = new Map();
  rankPool(pool).forEach((entry, rank) => band.set(entry.swahili, bandForRank(rank)));
  for (const [lemma, coreBand] of CORE_BAND) {
    const entry = pool.find((e) => e.swahili.toLowerCase() === lemma);
    if (entry) band.set(entry.swahili, Math.min(band.get(entry.swahili) ?? 9, coreBand));
  }
  return band;
}

/**
 * Waisen entfernen: Manifest-Einträge, deren Text es in der App nicht mehr
 * gibt, samt ihrer MP3s. Zusätzlich MP3s, auf die kein Eintrag mehr zeigt —
 * die entstehen, wenn ein Lauf zwischen Datei- und Manifest-Schreiben abbricht.
 *
 * Eine Datei wird nur gelöscht, wenn **kein** bleibender Eintrag sie noch
 * referenziert. Zwei Texte können sich zwar nach Konstruktion keine Datei
 * teilen (der Dateiname ist der Hash aus Stimme und Text), aber sich darauf zu
 * verlassen hieße, eine Löschung an eine Annahme zu hängen.
 */
async function pruneOrphans(manifest, requiredTexts) {
  const orphanTexts = Object.keys(manifest).filter((t) => !requiredTexts.has(t));
  const kept = Object.fromEntries(Object.entries(manifest).filter(([t]) => requiredTexts.has(t)));
  const stillUsed = new Set(Object.values(kept));

  const onDisk = existsSync(AUDIO_DIR)
    ? (await readdir(AUDIO_DIR)).filter((f) => f.endsWith(".mp3"))
    : [];
  const referenced = new Set(Object.values(manifest));
  const unreferenced = onDisk.filter((f) => !referenced.has(f));

  const toDelete = [
    ...orphanTexts.map((t) => manifest[t]).filter((f) => f && !stillUsed.has(f)),
    ...unreferenced,
  ];

  const orphanChars = orphanTexts.reduce((n, t) => n + t.length, 0);
  console.log(
    `Manifest: ${Object.keys(manifest).length} Einträge, davon ${orphanTexts.length} verwaist.`,
  );
  console.log(`MP3s auf der Platte: ${onDisk.length}, davon ${unreferenced.length} ohne Eintrag.`);
  if (orphanTexts.length === 0 && unreferenced.length === 0) {
    console.log("\nNichts zu entfernen. 🎉");
    return;
  }

  console.log(`\nZu entfernen: ${toDelete.length} Dateien, ${orphanTexts.length} Einträge`);
  console.log(`(${orphanChars} Zeichen, die einmal bezahlt wurden — verloren, nicht erstattbar)\n`);
  for (const t of orphanTexts) console.log(`  ${JSON.stringify(t)}`);
  for (const f of unreferenced) console.log(`  ${f} (ohne Manifest-Eintrag)`);

  if (dryRun) {
    console.log("\n(Dry-Run — nichts gelöscht.)");
    return;
  }

  let removed = 0;
  for (const file of toDelete) {
    await unlink(path.join(AUDIO_DIR, file)).then(
      () => removed++,
      () => {}, // schon weg — kein Fehlerfall
    );
  }
  await saveManifest(kept);
  console.log(
    `\nFertig: ${removed} Dateien gelöscht, Manifest auf ${Object.keys(kept).length} Einträge gekürzt.`,
  );
}

async function main() {
  const pool = JSON.parse(await readFile(POOL_FILE, "utf8"));
  const { dialogues, extraDialogues, phraseOfDay, seedVocab } = await loadAppData();
  const stories = await loadStories();
  const manifest = await loadManifest();

  // Aufgabenliste in Prioritäts-Reihenfolge (s. Kopfkommentar).
  const tasks = [];

  // 1. Dialoge — Stimme pro Sprecher (voiceMap des Dialogs oder Default).
  for (const d of [...dialogues, ...extraDialogues]) {
    for (const turn of d.turns) {
      const profile = d.voiceMap?.[turn.speaker] ?? SPEAKER_DEFAULT[turn.speaker];
      const voice = voiceByProfile(profile) ?? VOICES[0];
      if (turn.sw) tasks.push({ text: turn.sw.trim(), voice, kind: "Dialog" });
    }
  }

  // 2. Geschichten, absatzweise. Eine Geschichte = eine Stimme: sie ist ein
  //    zusammenhängender Text, kein Wechselgespräch, und ein Sprecherwechsel
  //    zwischen Absatz zwei und drei klänge nach Fehler.
  for (const story of stories) {
    const voice = voiceForWord(story.id);
    for (const p of story.paragraphs ?? []) {
      if (p?.sw) tasks.push({ text: p.sw.trim(), voice, kind: `Geschichte B${story.band}` });
    }
  }

  // 3. Phrasen des Tages.
  for (const p of phraseOfDay) {
    if (p.sw) tasks.push({ text: p.sw.trim(), voice: voiceForWord(p.sw), kind: "Phrase" });
  }

  // 4. Seed-Vokabeln inkl. Beispiele.
  for (const v of seedVocab()) {
    const voice = voiceForWord(v.swahili);
    tasks.push({ text: v.swahili.trim(), voice, kind: "Seed-Wort" });
    for (const ex of v.examples ?? []) {
      if (ex.sw) tasks.push({ text: ex.sw.trim(), voice, kind: "Seed-Beispiel" });
    }
  }

  // 5. Pool: erst alle Wörter (billig, werden am häufigsten abgespielt),
  //    dann alle Beispielsätze — jeweils in Pool-Reihenfolge.
  //    Wörter laufen immer mit, auch bei --band: sie sind zusammen keine 2 %
  //    der Arbeit und entscheiden, ob eine Karte im Hörmodus vorkommt.
  for (const entry of pool) {
    const voice = voiceForWord(entry.swahili);
    tasks.push({ text: entry.swahili.trim(), voice, kind: "Wort" });
  }
  const band = MAX_BAND === null ? null : bandByWord(pool);
  for (const entry of pool) {
    if (band && (band.get(entry.swahili) ?? 9) > MAX_BAND) continue;
    const voice = voiceForWord(entry.swahili);
    for (const ex of entry.examples ?? []) {
      if (ex.sw) tasks.push({ text: ex.sw.trim(), voice, kind: "Beispiel" });
    }
  }

  // Duplikate (gleicher Text) nur einmal erzeugen, Erledigtes überspringen.
  const seen = new Set();
  const open = tasks.filter((t) => {
    if (!t.text || seen.has(t.text) || manifest[t.text]) return false;
    seen.add(t.text);
    return true;
  });

  if (prune) {
    // Für die Waisenprüfung zählt der **Gesamtbestand**, nie die gefilterte
    // Aufgabenliste: sonst löschte `--prune --band 1` jede Aufnahme ab Band 2.
    // Deshalb die Beispielsätze hier noch einmal vollständig dazu — ohne
    // --band ist das ein No-op, mit --band die Rettung.
    const required = new Set(tasks.map((t) => t.text).filter(Boolean));
    for (const entry of pool) {
      for (const ex of entry.examples ?? []) if (ex.sw) required.add(ex.sw.trim());
    }
    await pruneOrphans(manifest, required);
    return;
  }

  const openChars = open.reduce((n, t) => n + t.text.length, 0);
  console.log(`Manifest: ${Object.keys(manifest).length} vorhanden.`);
  console.log(`Offen: ${open.length} Texte, ${openChars} Zeichen.`);
  const byKind = new Map();
  for (const t of open) {
    const s = byKind.get(t.kind) ?? { n: 0, chars: 0 };
    s.n++;
    s.chars += t.text.length;
    byKind.set(t.kind, s);
  }
  for (const [kind, s] of byKind) {
    console.log(`  ${kind}: ${s.n} Texte, ${s.chars} Zeichen`);
  }
  if (MAX_BAND !== null) {
    console.log(`Filter: Beispielsätze bis einschließlich Band ${MAX_BAND} (Wörter ungefiltert).`);
  }
  console.log(`Budget dieser Lauf: ${BUDGET} Zeichen.${dryRun ? " (Dry-Run)" : ""}\n`);

  await mkdir(AUDIO_DIR, { recursive: true });

  let usedChars = 0;
  let generated = 0;
  for (const task of open) {
    if (usedChars + task.text.length > BUDGET) {
      console.log(`\nBudget erreicht (${usedChars}/${BUDGET} Zeichen).`);
      break;
    }
    const file = fileNameFor(task.text, task.voice.id);
    console.log(`[${task.voice.name}] ${task.kind}: ${task.text}`);
    if (!dryRun) {
      try {
        const audio = await ttsRequest(task.text, task.voice.id);
        await writeFile(path.join(AUDIO_DIR, file), audio);
        manifest[task.text] = file;
        await saveManifest(manifest);
      } catch (err) {
        console.error(`\nAbbruch: ${err.message}`);
        break;
      }
      // Free-Tier erlaubt wenig Parallelität — bewusst sequenziell mit Pause.
      await new Promise((r) => setTimeout(r, 400));
    }
    usedChars += task.text.length;
    generated++;
  }

  const remaining = open.length - generated;
  const remainingChars = open.slice(generated).reduce((n, t) => n + t.text.length, 0);
  console.log(`\nFertig: ${generated} Dateien, ${usedChars} Zeichen verbraucht.`);
  if (remaining > 0) {
    console.log(
      `Noch offen: ${remaining} Texte (${remainingChars} Zeichen) — Skript im nächsten Monat einfach erneut ausführen.`,
    );
  } else {
    console.log("Alle Texte sind vertont. 🎉");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
