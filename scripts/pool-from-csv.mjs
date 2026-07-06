#!/usr/bin/env node
// Konvertiert einen Supabase-Table-Editor-CSV-Export von `shared_vocab`
// nach public/vocab-pool.json (statischer Pool für die lokale App).
//
// Nutzung: node scripts/pool-from-csv.mjs [pfad/zur/shared_vocab.csv]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const input = resolve(process.argv[2] ?? "shared_vocab.csv");
const output = resolve("public/vocab-pool.json");

// Minimaler CSV-Parser mit Quote-Support (Supabase quotet Felder mit ", "" als Escape).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

// Array-Feld: JSON (["a","b"]) oder Postgres-Literal ({"a","b"}) → string[]
function parseArrayField(s) {
  if (!s || s === "{}" || s === "[]" || s === "null") return [];
  if (s.startsWith("[")) {
    try {
      const arr = JSON.parse(s);
      return Array.isArray(arr) ? arr.filter((t) => typeof t === "string") : [];
    } catch {
      return [];
    }
  }
  return s
    .replace(/^\{|\}$/g, "")
    .split(",")
    .map((t) => t.replace(/^"|"$/g, "").trim())
    .filter(Boolean);
}

const csv = readFileSync(input, "utf8");
const rows = parseCsv(csv);
const header = rows[0];
const col = (name) => header.indexOf(name);

const iSw = col("swahili");
const iDe = col("german");
const iPos = col("part_of_speech");
const iNc = col("noun_class");
const iEx = col("examples");
const iTopics = col("topics");
const iActive = col("is_active");
const iStatus = col("review_status");

if (iSw < 0 || iDe < 0) {
  console.error("CSV-Header unerwartet. Gefunden:", header.join(", "));
  process.exit(1);
}

const seen = new Set();
const pool = [];
let skipped = 0;

for (const r of rows.slice(1)) {
  const active = iActive < 0 || r[iActive] === "true" || r[iActive] === "t";
  const status = iStatus < 0 ? "approved" : r[iStatus];
  if (!active || !["approved", "auto_approved"].includes(status)) {
    skipped++;
    continue;
  }
  const swahili = (r[iSw] ?? "").trim();
  const german = (r[iDe] ?? "").trim();
  if (!swahili || !german || seen.has(swahili.toLowerCase())) {
    skipped++;
    continue;
  }
  seen.add(swahili.toLowerCase());

  let examples = [];
  try {
    const parsed = JSON.parse(r[iEx] || "[]");
    if (Array.isArray(parsed)) {
      examples = parsed
        .filter((e) => e && typeof e.sw === "string" && typeof e.de === "string")
        .slice(0, 3);
    }
  } catch {
    /* Beispiele optional */
  }

  pool.push({
    swahili,
    german,
    partOfSpeech: r[iPos]?.trim() || "other",
    nounClass: r[iNc]?.trim() || null,
    examples,
    topics: iTopics >= 0 ? parseArrayField(r[iTopics]) : [],
  });
}

pool.sort((a, b) => a.swahili.localeCompare(b.swahili, "sw"));
writeFileSync(output, JSON.stringify(pool));
console.log(`✔ ${pool.length} Vokabeln → ${output} (${skipped} übersprungen)`);
