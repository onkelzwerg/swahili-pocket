import { get, set } from "idb-keyval";
import type { UserStats, VocabEntry } from "./types";
import { readCachedVocab, cacheVocab, readCachedStats, cacheStats, normalizeStats } from "./offline";
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
export const DATA_VERSION = 2;

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
  const vocab = (await readCachedVocab()) ?? [];
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
  if (migrated.length > 0) await cacheVocab(migrated);

  const rawStats = await readCachedStats();
  const stats: UserStats = normalizeStats(rawStats);
  // Ein Willkommens-Joker.
  const nextStats: UserStats = { ...stats, freezes: Math.max(stats.freezes, 1) };
  await cacheStats(nextStats);

  // Bestandsnutzer behalten Leitner — an ihrem Lernrhythmus ändert sich
  // ungefragt nichts. Neu-User starten adaptiv (FSRS).
  const existingUser = (rawStats?.totalReviewed ?? 0) > 0;
  const settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    scheduler: existingUser ? "leitner" : "fsrs",
  };
  await writeSettings(settings);
}

const MIGRATIONS: Record<number, () => Promise<void>> = {
  2: migrateTo2,
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
  })();
  return running;
}

/** Nur für Tests / Backup-Import: Migrationslauf erneut zulassen. */
export function resetMigrationState() {
  running = null;
}
