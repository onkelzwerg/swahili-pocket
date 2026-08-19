import { del, get, set, setMany } from "idb-keyval";
import type { ReviewLogEntry, UserStats, VocabEntry } from "./types";
import {
  readCachedStats,
  cacheStats,
  normalizeStats,
  serializeWrite,
  K_VOCAB_LEGACY,
} from "./offline";
import { cardStore, logArchiveStore, logKey, logStore } from "./db";
import { K_ARCHIVE_LEGACY, K_LOG_LEGACY, resetReviewLogCache } from "./review-log";
import { boxToFsrsSeed } from "./srs/fsrs";
import { DEFAULT_SETTINGS, writeSettings, type AppSettings } from "./settings";

// Versionierte Datenmigration. Läuft einmal beim App-Start (aus ensureSeeded()),
// bevor irgendetwas anderes IndexedDB liest.
//
// Regel: Migration N bringt Version N-1 → N. Nach jedem Schritt wird die
// Version persistiert, damit ein Absturz mittendrin nicht doppelt migriert.
// Leitplanke 2: keine stillen Datenverluste — alte Backups bleiben importierbar.

const K_VERSION = "data:version";

/** Aktuelle Zielversion des lokalen Datenmodells. */
export const DATA_VERSION = 3;

/** Ab dieser Box galt eine Bestandskarte als gefestigt (Grandfathering, siehe unten). */
const GRANDFATHER_MATURED_FROM_BOX = 4;

async function readVersion(): Promise<number> {
  const v = await get<number>(K_VERSION).catch(() => undefined);
  return typeof v === "number" ? v : 1;
}

/**
 * v1 → v2: FSRS-Parallelzustand, Leitner-Fälligkeit, Reifegrad, Wochen-Stats
 * und Settings anlegen. Für den Nutzer ändert sich dabei sichtbar nichts.
 */
async function migrateTo2(): Promise<void> {
  // Bewusst direkt am Alt-Schlüssel: zu Datenversion 1 lag der Bestand als ein
  // Array dort, und erst v3 zieht ihn in den Kartenstore um. Über
  // readCachedVocab() zu gehen hieße, die Welt von heute auf die Daten von
  // gestern anzuwenden — die Migration liefe ins Leere.
  const vocab = (await get<VocabEntry[]>(K_VOCAB_LEGACY).catch(() => null)) ?? [];
  const now = Date.now();

  const migrated: VocabEntry[] = vocab.map((card) => {
    const lastReviewAt = card.lastReviewAt ?? card.updatedAt ?? card.createdAt;
    const next: VocabEntry = {
      ...card,
      leitnerDue: card.leitnerDue ?? card.nextReview,
      fsrs: card.fsrs ?? boxToFsrsSeed(card.box, now, lastReviewAt),
      lastReviewAt,
    };
    // Bestandsschutz: Box 4 hat 4-Tage-Intervalle überstanden — das werten
    // wir als "gefestigt", sonst würden Bestandsnutzer Level verlieren.
    if (!next.maturedAt && card.box >= GRANDFATHER_MATURED_FROM_BOX) {
      next.maturedAt = lastReviewAt;
    }
    return next;
  });
  if (migrated.length > 0) await set(K_VOCAB_LEGACY, migrated).catch(() => {});

  // Durch dieselbe Kette wie getStats()/recordReview(): der Home-Screen liest
  // die Stats parallel zum Migrationslauf (Promise.all in index.tsx), und ohne
  // Serialisierung überschreibt einer den anderen — der Willkommens-Joker oder
  // der Streak-Verfall wäre weg. Die Reihenfolge ist dabei egal: normalizeStats
  // füllt Defaults, und Math.max hält den Joker in beiden Reihenfolgen.
  const rawStats = await readCachedStats();
  await serializeWrite(async () => {
    const stats: UserStats = normalizeStats(await readCachedStats());
    // Ein Willkommens-Joker.
    await cacheStats({ ...stats, freezes: Math.max(stats.freezes, 1) });
  });

  // Bestandsnutzer behalten Leitner — an ihrem Lernrhythmus ändert sich
  // ungefragt nichts. Neu-User starten adaptiv (FSRS).
  const existingUser = (rawStats?.totalReviewed ?? 0) > 0;
  const settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    scheduler: existingUser ? "leitner" : "fsrs",
  };
  await writeSettings(settings);
}

/**
 * v2 → v3: Karten und Review-Log aus ihren Sammel-Arrays in eigene Stores
 * umziehen — ein Schlüssel je Datensatz (Begründung in db.ts).
 *
 * Reihenfolge mit Absicht: erst kopieren, dann die Altlast löschen. Bricht es
 * dazwischen ab, bleibt die Version auf 2 und der Lauf wiederholt sich; das
 * Kopieren ist idempotent (gleiche Schlüssel, gleiche Werte). Fehlt die
 * Altlast bereits, ist nichts zu tun — dann hat ein früherer Lauf sie
 * abgeräumt, und der Store trägt die Wahrheit. Auf keinen Fall wird der Store
 * geleert, wenn die Quelle leer ist: das wäre der stille Totalverlust.
 */
async function migrateTo3(): Promise<void> {
  const legacyVocab = await get<VocabEntry[]>(K_VOCAB_LEGACY).catch(() => null);
  if (Array.isArray(legacyVocab) && legacyVocab.length > 0) {
    await setMany(
      legacyVocab.map((card) => [card.id, card] as [string, VocabEntry]),
      cardStore(),
    );
    await del(K_VOCAB_LEGACY).catch(() => {});
  }

  const legacyLog = await get<ReviewLogEntry[]>(K_LOG_LEGACY).catch(() => null);
  if (Array.isArray(legacyLog) && legacyLog.length > 0) {
    await setMany(
      legacyLog.map((e) => [logKey(e), e] as [[number, string], ReviewLogEntry]),
      logStore(),
    );
    await del(K_LOG_LEGACY).catch(() => {});
  }

  const legacyArchive = await get<ReviewLogEntry[]>(K_ARCHIVE_LEGACY).catch(() => null);
  if (Array.isArray(legacyArchive) && legacyArchive.length > 0) {
    await setMany(
      legacyArchive.map((e) => [logKey(e), e] as [[number, string], ReviewLogEntry]),
      logArchiveStore(),
    );
    await del(K_ARCHIVE_LEGACY).catch(() => {});
  }

  resetReviewLogCache();
}

const MIGRATIONS: Record<number, () => Promise<void>> = {
  2: migrateTo2,
  3: migrateTo3,
};

let running: Promise<void> | null = null;

/** Ausstehende Migrationen anwenden. Mehrfachaufrufe teilen sich einen Lauf. */
export function runMigrations(): Promise<void> {
  running ??= (async () => {
    let version = await readVersion();
    while (version < DATA_VERSION) {
      const step = MIGRATIONS[version + 1];
      if (step) await step();
      version += 1;
      await set(K_VERSION, version).catch(() => {});
    }
  })().catch((err) => {
    // Eine gescheiterte Migration darf sich nicht festsetzen: sonst liefert
    // jeder weitere Aufruf dieselbe Ablehnung, und da getVocab() und
    // getStats() darauf warten, bliebe die App bis zum Neuladen tot.
    // Der nächste Aufruf versucht es neu — die Version ist schrittweise
    // persistiert, ein erneuter Lauf wiederholt also nichts Erledigtes.
    running = null;
    throw err;
  });
  return running;
}

/** Nur für Tests / Backup-Import: Migrationslauf erneut zulassen. */
export function resetMigrationState() {
  running = null;
}
