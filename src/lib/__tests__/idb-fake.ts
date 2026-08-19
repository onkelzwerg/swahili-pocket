import type { ReviewLogEntry, VocabEntry } from "../types";

// Ein `idb-keyval`-Doppelgänger für die Tests.
//
// Seit Datenversion 3 liegen Karten und Log in eigenen Stores mit eigenen
// Schlüsseln (siehe lib/db.ts). Ein `new Map<string, unknown>()` je Testdatei
// reicht dafür nicht mehr: gebraucht werden Store-Trennung, zusammengesetzte
// Schlüssel (`[ts, id]`) und vor allem die **Sortierung nach Schlüssel** —
// darauf verlässt sich das Log, statt selbst zu sortieren.
//
// Ein Modul, eine Instanz: die vi.mock-Factory und die Testdatei importieren
// dasselbe Modul und teilen sich deshalb den Zustand.

/** Was `createStore()` zurückgibt — hier nur ein Namensschild. */
interface FakeStore {
  __name: string;
}

const DEFAULT_STORE = "keyval";

interface Slot {
  key: IDBValidKey;
  value: unknown;
}

const stores = new Map<string, Map<string, Slot>>();

function nameOf(store?: unknown): string {
  return (store as FakeStore | undefined)?.__name ?? DEFAULT_STORE;
}

function slots(store?: unknown): Map<string, Slot> {
  const name = nameOf(store);
  let s = stores.get(name);
  if (!s) stores.set(name, (s = new Map()));
  return s;
}

/** Stabile Identität eines Schlüssels — `[1, "a"]` muss sich selbst wiederfinden. */
function idOf(key: IDBValidKey): string {
  return JSON.stringify(key);
}

/**
 * Schlüsselvergleich wie IndexedDB: Zahlen vor Strings, Arrays elementweise.
 * Nur so weit ausgeführt, wie die App Schlüssel bildet (string und [number, string]).
 */
function compareKeys(a: IDBValidKey, b: IDBValidKey): number {
  const arrA = Array.isArray(a);
  const arrB = Array.isArray(b);
  if (arrA && arrB) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (i >= a.length) return -1;
      if (i >= b.length) return 1;
      const c = compareKeys(a[i] as IDBValidKey, b[i] as IDBValidKey);
      if (c !== 0) return c;
    }
    return 0;
  }
  if (arrA !== arrB) return arrA ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

function sorted(store?: unknown): Slot[] {
  return [...slots(store).values()].sort((x, y) => compareKeys(x.key, y.key));
}

/**
 * Kunstpause vor jedem Zugriff.
 *
 * Standard 0 — die meisten Tests wollen es schnell. Der Nebenläufigkeitstest
 * dreht sie hoch: echte IndexedDB-Zugriffe sind asynchron, nicht
 * mikrotask-schnell, und ohne diese Pause kann sich per Konstruktion nichts
 * überlappen. Ein Test gegen ein sofort auflösendes Fake wäre dort wertlos.
 */
let latencyMs = 0;

export function setLatency(ms: number): void {
  latencyMs = ms;
}

const pause = () =>
  latencyMs > 0 ? new Promise((r) => setTimeout(r, latencyMs)) : Promise.resolve();

/** Die Nachbildung selbst — wird als Modul `idb-keyval` eingesetzt. */
export const fake = {
  createStore: (dbName: string, storeName: string): FakeStore => ({
    __name: `${dbName}/${storeName}`,
  }),
  get: async (key: IDBValidKey, store?: unknown) => {
    await pause();
    return slots(store).get(idOf(key))?.value;
  },
  set: async (key: IDBValidKey, value: unknown, store?: unknown) => {
    await pause();
    slots(store).set(idOf(key), { key, value });
  },
  setMany: async (entries: [IDBValidKey, unknown][], store?: unknown) => {
    await pause();
    for (const [key, value] of entries) slots(store).set(idOf(key), { key, value });
  },
  del: async (key: IDBValidKey, store?: unknown) => {
    await pause();
    slots(store).delete(idOf(key));
  },
  delMany: async (keys: IDBValidKey[], store?: unknown) => {
    await pause();
    for (const key of keys) slots(store).delete(idOf(key));
  },
  clear: async (store?: unknown) => {
    await pause();
    slots(store).clear();
  },
  keys: async (store?: unknown) => {
    await pause();
    return sorted(store).map((s) => s.key);
  },
  values: async (store?: unknown) => {
    await pause();
    return sorted(store).map((s) => s.value);
  },
  entries: async (store?: unknown) => {
    await pause();
    return sorted(store).map((s) => [s.key, s.value]);
  },
};

// ---------------------------------------------------------------------------
// Zugriff für die Tests
// ---------------------------------------------------------------------------

const CARDS = "swahili-pocket-vocab/cards";
const LOG = "swahili-pocket-log/entries";
const LOG_ARCHIVE = "swahili-pocket-log-archive/entries";

export function resetDb(): void {
  stores.clear();
}

/** Wert unter einem Schlüssel des Standard-Stores (Stats, Settings, Version …). */
export function kv<T = unknown>(key: string): T | undefined {
  return slots().get(idOf(key))?.value as T | undefined;
}

export function setKv(key: string, value: unknown): void {
  slots().set(idOf(key), { key, value });
}

/** Karten im Kartenstore, so wie die App sie liest (neueste zuerst). */
export function allCards(): VocabEntry[] {
  return (sorted({ __name: CARDS }).map((s) => s.value) as VocabEntry[])
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function cardById(id: string): VocabEntry | undefined {
  return slots({ __name: CARDS }).get(idOf(id))?.value as VocabEntry | undefined;
}

/** Karten direkt in den Store legen (Testaufbau, ohne Migration). */
export function seedCards(cards: VocabEntry[]): void {
  const store = slots({ __name: CARDS });
  for (const card of cards) store.set(idOf(card.id), { key: card.id, value: card });
}

/** Log-Einträge in chronologischer Reihenfolge. */
export function allLogEntries(): ReviewLogEntry[] {
  return sorted({ __name: LOG }).map((s) => s.value) as ReviewLogEntry[];
}

/** Log-Einträge direkt einsetzen (Testaufbau für den Ringpuffer). */
export function seedLogEntries(entries: ReviewLogEntry[]): void {
  const store = slots({ __name: LOG });
  for (const e of entries) {
    const key: [number, string] = [e.ts, e.id];
    store.set(idOf(key), { key, value: e });
  }
}

export function allArchivedLogEntries(): ReviewLogEntry[] {
  return sorted({ __name: LOG_ARCHIVE }).map((s) => s.value) as ReviewLogEntry[];
}
