import { createStore, type UseStore } from "idb-keyval";

// Eigene IndexedDB-Stores für die beiden Datenmengen, die *wachsen*:
// Karten und Review-Log.
//
// Bis Datenversion 2 lagen beide als je ein großes Array unter einem Schlüssel.
// Das ist bequem, aber jede beantwortete Karte schrieb damit den kompletten
// Bestand zurück: ~400 KB Kartenliste plus das gesamte Log — bei der eigenen
// Obergrenze von 20.000 Einträgen mehrere Megabyte. Für eine Antwort, die drei
// Zahlen ändert.
//
// Ein Schlüssel je Datensatz macht aus dem Schreibvorgang das, was er ist:
// ein Datensatz. Gelesen wird weiterhin am Stück (`values()`), das war nie das
// Problem — und beide Module halten ohnehin einen Cache.
//
// Die Schlüssel des Logs sind `[ts, id]`: IndexedDB sortiert Array-Schlüssel
// elementweise, `values()` liefert die Einträge also chronologisch, ohne dass
// jemand sortieren müsste. Genau darauf verlässt sich der Ringpuffer.

/**
 * Bewusst faul angelegt: `createStore()` öffnet die Datenbank sofort, und beim
 * serverseitigen Rendern gibt es kein `indexedDB`. Auf Modulebene angelegt
 * würde der Import allein schon jede SSR-Anfrage zerlegen.
 */
let cardStoreRef: UseStore | undefined;
let logStoreRef: UseStore | undefined;
let logArchiveStoreRef: UseStore | undefined;

/** Ein Schlüssel je Karte (`VocabEntry.id`). */
export function cardStore(): UseStore {
  return (cardStoreRef ??= createStore("swahili-pocket-vocab", "cards"));
}

/** Ein Schlüssel je Log-Eintrag (`[ts, id]`). */
export function logStore(): UseStore {
  return (logStoreRef ??= createStore("swahili-pocket-log", "entries"));
}

/**
 * Ausgelagerte Alteinträge des Rings — dieselbe Schlüsselform.
 *
 * Eigene Datenbank, nicht nur ein zweiter Objektspeicher: `createStore()` legt
 * den Speicher im Upgrade der *neu angelegten* Datenbank an. Ein zweiter Aufruf
 * mit demselben Datenbanknamen fände die Datenbank bereits in Version 1 vor,
 * ohne seinen Speicher — und liefe in einen NotFoundError.
 */
export function logArchiveStore(): UseStore {
  return (logArchiveStoreRef ??= createStore("swahili-pocket-log-archive", "entries"));
}

/** Schlüssel eines Log-Eintrags. Chronologisch sortierbar. */
export function logKey(entry: { ts: number; id: string }): [number, string] {
  return [entry.ts, entry.id];
}

/** Nur für Tests: angelegte Store-Referenzen vergessen. */
export function resetStoreRefs(): void {
  cardStoreRef = undefined;
  logStoreRef = undefined;
  logArchiveStoreRef = undefined;
}
