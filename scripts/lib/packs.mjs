/**
 * Zuordnung Grundform → Themenpaket (W4.13).
 *
 * Die Pakete unter public/vocab-packs/ sind Wortschatz, den der Nutzer bei
 * Bedarf zuschaltet. Ein Inhalt, der ein Wort daraus benutzt, ist ohne das
 * Paket nicht erreichbar: das Lemma kann nie als gelernt zählen, also bleibt
 * die Abdeckung unter der Freischaltschwelle. Deshalb bekommen Geschichten und
 * Dialoge ein `requiresPacks` — **abgeleitet, nicht gepflegt.** Wer ein Wort
 * zwischen Kern und Paket verschiebt, ändert damit automatisch mit, welcher
 * Inhalt welches Paket verlangt; eine handgepflegte Liste würde hier driften.
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PACK_DIR = path.join(ROOT, "public", "vocab-packs");

/** Map: Grundform (kleingeschrieben) → Paket-Id. Leer, solange es keine gibt. */
export async function loadPackLemmas() {
  const map = new Map();
  if (!existsSync(PACK_DIR)) return map;
  for (const file of await readdir(PACK_DIR)) {
    if (!file.endsWith(".json") || file === "index.json") continue;
    const pack = JSON.parse(await readFile(path.join(PACK_DIR, file), "utf8"));
    for (const entry of pack.entries ?? []) {
      map.set(entry.swahili.toLowerCase(), pack.id);
    }
  }
  return map;
}

/**
 * Welche Pakete verlangt dieser Lemma-Satz? Sortiert, damit der Index
 * reproduzierbar bleibt.
 */
export function requiredPacks(lemmas, packOf) {
  const needed = new Set();
  for (const l of lemmas) {
    const pack = packOf.get(l);
    if (pack) needed.add(pack);
  }
  return [...needed].sort();
}
