import { get, set } from "idb-keyval";
import type { PoolEntry } from "./pool";

// Themenpakete (W4.13): Wortschatz, den der Nutzer bei Bedarf zuschaltet.
//
// Der Kern-Pool ist Alltagswortschatz und gilt für alle. Wörter wie `riba`
// (Zins), `mmomonyoko` (Erosion) oder `mahojiano` (Vorstellungsgespräch)
// gehören nicht in den Stapel eines Anfängers — wohl aber in den von jemandem,
// der sich für das Thema interessiert. Deshalb liegen sie in Paketen.
//
// Ein Paket zu aktivieren hat zwei Wirkungen: seine Wörter stehen im Pool zur
// Auswahl, und Inhalte, die sie benutzen, werden sichtbar. Letzteres ist kein
// Zusatz, sondern notwendig — ein Dialog mit Wörtern außerhalb des Pools kann
// die Freischaltschwelle nie erreichen, weil diese Lemmata nie als gelernt
// zählen können. Ohne Filterung stünde er ewig gesperrt in der Liste.

const K_ACTIVE = "packs:active";

export interface PackMeta {
  id: string;
  title: string;
  emoji: string;
  description: string;
  wordCount: number;
}

export interface Pack extends PackMeta {
  entries: PoolEntry[];
}

interface PackIndex {
  version: 1;
  packs: PackMeta[];
}

// ---------------------------------------------------------------------------
// Bestand laden
// ---------------------------------------------------------------------------

let indexPromise: Promise<PackMeta[]> | null = null;
const packPromises = new Map<string, Promise<Pack | null>>();

/** Alle verfügbaren Pakete. Leer, solange es keine gibt — kein Fehlerfall. */
export function loadPackIndex(): Promise<PackMeta[]> {
  if (!indexPromise) {
    indexPromise = fetch("/vocab-packs/index.json")
      .then((r) => (r.ok ? (r.json() as Promise<PackIndex>) : null))
      .then((data) => data?.packs ?? [])
      .catch(() => []);
  }
  return indexPromise;
}

export function loadPack(id: string): Promise<Pack | null> {
  let p = packPromises.get(id);
  if (!p) {
    p = fetch(`/vocab-packs/${id}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Pack>) : null))
      .catch(() => null);
    packPromises.set(id, p);
  }
  return p;
}

// ---------------------------------------------------------------------------
// Aktivierung
// ---------------------------------------------------------------------------

let activeCache: string[] | null = null;

export async function activePacks(): Promise<string[]> {
  if (activeCache) return activeCache;
  activeCache = (await get<string[]>(K_ACTIVE)) ?? [];
  return activeCache;
}

export async function setPackActive(id: string, on: boolean): Promise<string[]> {
  const current = new Set(await activePacks());
  if (on) current.add(id);
  else current.delete(id);
  const next = [...current].sort();
  await set(K_ACTIVE, next);
  activeCache = next;
  return next;
}

/** Für Tests und den Backup-Import. */
export function resetPacksCache(): void {
  activeCache = null;
}

/**
 * Die Vokabeln aller aktiven Pakete, zum Anhängen an den Pool.
 * Ein Paket, dessen Datei fehlt, wird stillschweigend übersprungen: der Nutzer
 * hat es irgendwann aktiviert, und dass es die App inzwischen nicht mehr
 * ausliefert, ist kein Grund, ihm den Wortschatz-Bildschirm zu zerschießen.
 */
export async function activePackEntries(): Promise<PoolEntry[]> {
  const ids = await activePacks();
  if (ids.length === 0) return [];
  const packs = await Promise.all(ids.map(loadPack));
  return packs.flatMap((p) => p?.entries ?? []);
}

/**
 * Darf dieser Inhalt gezeigt werden?
 *
 * `requiresPacks` ist im Index abgeleitet, nicht gepflegt (scripts/lib/packs.mjs).
 * Ein Inhalt ohne Paketbedarf ist immer sichtbar.
 */
export function isContentAvailable(requiresPacks: string[] | undefined, active: string[]): boolean {
  if (!requiresPacks || requiresPacks.length === 0) return true;
  return requiresPacks.every((p) => active.includes(p));
}

/** Die Pakete, die diesem Inhalt noch fehlen — für den Hinweis in der Liste. */
export function missingPacks(requiresPacks: string[] | undefined, active: string[]): string[] {
  return (requiresPacks ?? []).filter((p) => !active.includes(p));
}
