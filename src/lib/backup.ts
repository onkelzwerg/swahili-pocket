import { clear, get, set } from "idb-keyval";
import type { ReviewLogEntry, UserStats, VocabEntry } from "./types";
import {
  cacheVocab,
  cacheStats,
  readCachedVocab,
  readCachedStats,
  normalizeStats,
} from "./offline";
import { readReviewLog, writeReviewLog, resetReviewLogCache } from "./review-log";
import { getSettings, writeSettings, resetSettingsCache, type AppSettings } from "./settings";
import { runMigrations, resetMigrationState, DATA_VERSION } from "./migrations";
import {
  getTrainerStats,
  writeTrainerStats,
  resetTrainerStatsCache,
  normalizeTrainerStats,
  type TrainerStats,
} from "./trainer-stats";
import { resetMilestoneCache } from "./milestones";
import {
  getStoriesRead,
  writeStoriesRead,
  resetStoriesReadCache,
  type StoriesRead,
} from "./stories";
import {
  getDialogueStats,
  writeDialogueStats,
  resetDialogueStatsCache,
  normalizeDialogueStats,
  type DialogueStats,
} from "./dialogue-stats";
import { getRetentionChecks, writeRetentionChecks, resetRetentionCache } from "./retention-check";
import { APP_CONFIG } from "@/config/app.config";

// JSON-Backup der Lerndaten. Schutz gegen IndexedDB-Verlust
// (Browserdaten löschen, Gerätewechsel).
//
// v2 ergänzt Settings und Review-Log, v3 den Trainer-Fortschritt,
// v4 die Welle-3-Schlüssel (gelesene Geschichten, Dialog-Rollenspiele).
// v1- bis v3-Dateien bleiben importierbar: fehlende Felder werden mit
// Defaults gefüllt und die Migration läuft anschließend darüber
// (Leitplanke 2 — keine stillen Datenverluste).

const K_VERSION = "data:version";

interface BackupFileV1 {
  app: string;
  version: 1;
  exportedAt: string;
  vocab: VocabEntry[];
  stats: UserStats | null;
}

interface BackupFileV2 {
  app: string;
  version: 2;
  exportedAt: string;
  vocab: VocabEntry[];
  stats: UserStats | null;
  settings: AppSettings | null;
  reviewLog: ReviewLogEntry[];
  /** Ab Welle 2 belegt; jetzt schon im Format, damit alte Backups gültig bleiben. */
  milestones: Record<string, number>;
  retentionChecks: { ts: number; correct: number; total: number }[];
}

interface BackupFileV3 extends Omit<BackupFileV2, "version"> {
  version: 3;
  /** Fortschritt im Morphologie-Trainer (W2.7). */
  trainerStats: TrainerStats;
}

interface BackupFileV4 extends Omit<BackupFileV3, "version"> {
  version: 4;
  /** Gelesene Geschichten (W3.3). */
  storiesRead: StoriesRead;
  /** Durchgespielte Dialoge (W3.4). */
  dialogueStats: DialogueStats;
}

/**
 * Was der Importer entgegennimmt: v1 bis v4, jedes Feld optional.
 * (Kein `Partial<V1 & V4>` — die Versionsnummern schließen sich aus und
 * die Schnittmenge wäre `never`.)
 */
type AnyBackup = Partial<Omit<BackupFileV1, "version">> &
  Partial<Omit<BackupFileV4, "version">> & { version?: number };

/** Aktuelle Backup-Formatversion. */
const BACKUP_VERSION = 4;

export async function exportBackup(): Promise<void> {
  const [
    vocab,
    stats,
    settings,
    reviewLog,
    trainerStats,
    storiesRead,
    dialogueStats,
    retentionChecks,
  ] = await Promise.all([
    readCachedVocab(),
    readCachedStats(),
    getSettings(),
    readReviewLog(),
    getTrainerStats(),
    getStoriesRead(),
    getDialogueStats(),
    getRetentionChecks(),
  ]);
  const payload: BackupFileV4 = {
    app: APP_CONFIG.appName,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    vocab: vocab ?? [],
    stats,
    settings,
    reviewLog,
    trainerStats,
    storiesRead,
    dialogueStats,
    retentionChecks,
    milestones: (await get<Record<string, number>>("milestones:achieved").catch(() => null)) ?? {},
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${APP_CONFIG.appName.toLowerCase().replace(/\s+/g, "-")}-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<{ vocabCount: number }> {
  const text = await file.text();
  const data = JSON.parse(text) as AnyBackup;
  if (!Array.isArray(data.vocab)) {
    throw new Error("Ungültige Backup-Datei: kein Vokabel-Bestand gefunden.");
  }
  // Minimale Plausibilitätsprüfung pro Eintrag.
  const vocab = data.vocab.filter(
    (v): v is VocabEntry =>
      !!v &&
      typeof v.id === "string" &&
      typeof v.swahili === "string" &&
      typeof v.german === "string",
  );
  await cacheVocab(vocab);

  if (data.stats && typeof data.stats.totalReviewed === "number") {
    await cacheStats(normalizeStats(data.stats));
  }

  // Caches leeren: die importierten Daten müssen frisch gelesen werden.
  resetSettingsCache();
  resetReviewLogCache();
  resetTrainerStatsCache();
  resetMilestoneCache();
  resetStoriesReadCache();
  resetDialogueStatsCache();
  resetRetentionCache();

  if (data.settings) await writeSettings(data.settings);
  await writeReviewLog(Array.isArray(data.reviewLog) ? data.reviewLog : []);
  await writeTrainerStats(normalizeTrainerStats(data.trainerStats));
  await writeStoriesRead(data.storiesRead ?? {});
  await writeDialogueStats(normalizeDialogueStats(data.dialogueStats));
  await writeRetentionChecks(Array.isArray(data.retentionChecks) ? data.retentionChecks : []);
  if (data.milestones) await set("milestones:achieved", data.milestones).catch(() => {});

  // v1-Backup (oder eines ohne Settings) über die Migration schicken, damit
  // FSRS-Zustand, leitnerDue und maturedAt nachgezogen werden.
  // Ab v2 ist das Datenmodell aktuell; v3 und v4 fügen nur neue Schlüssel
  // hinzu, die eigene Defaults haben — deshalb kein Versionssprung nötig.
  const modelIsCurrent = (data.version ?? 1) >= 2;
  await set(K_VERSION, modelIsCurrent ? DATA_VERSION : 1).catch(() => {});
  resetMigrationState();
  await runMigrations();

  return { vocabCount: vocab.length };
}

/** Alle lokalen Daten löschen (Werkseinstellungen). */
export async function resetAllData(): Promise<void> {
  await clear();
  resetSettingsCache();
  resetReviewLogCache();
  resetTrainerStatsCache();
  resetMilestoneCache();
  resetStoriesReadCache();
  resetDialogueStatsCache();
  resetRetentionCache();
  resetMigrationState();
}

/** Browser um persistenten Speicher bitten (best effort). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
  } catch {
    /* ignore */
  }
  return false;
}
