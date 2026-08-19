import { clear, get, set } from "idb-keyval";
import type { ReviewLogEntry, UserStats, VocabEntry } from "./types";
import {
  cacheStats,
  readCachedVocab,
  readCachedStats,
  normalizeStats,
  K_VOCAB_LEGACY,
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
import { activePacks, resetPacksCache } from "./packs";
import { cardStore, logArchiveStore, logStore } from "./db";
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

interface BackupFileV5 extends Omit<BackupFileV4, "version"> {
  version: 5;
  /**
   * Aktivierte Themenpakete (W4.13). Ohne sie fiele der Nutzer nach einem
   * Import auf den Kern-Wortschatz zurück, und die Inhalte, die er dafür
   * freigeschaltet hatte, verschwänden wieder aus den Listen.
   */
  activePacks: string[];
}

/**
 * Was der Importer entgegennimmt: v1 bis v4, jedes Feld optional.
 * (Kein `Partial<V1 & V4>` — die Versionsnummern schließen sich aus und
 * die Schnittmenge wäre `never`.)
 */
type AnyBackup = Partial<Omit<BackupFileV1, "version">> &
  Partial<Omit<BackupFileV5, "version">> & { version?: number };

/** Aktuelle Backup-Formatversion. */
const BACKUP_VERSION = 5;

// ---------------------------------------------------------------------------
// Eingangsprüfung
// ---------------------------------------------------------------------------

/**
 * Eine Karte aus einer Backup-Datei geradeziehen — oder verwerfen.
 *
 * Die Datei kommt vom Nutzer selbst, das ist kein Angriffsszenario. Sie kann
 * aber alt, halb geschrieben oder von Hand bearbeitet sein, und dann sind die
 * Folgen still: eine `box` außerhalb von 1..5 indiziert BOX_INTERVALS_DAYS ins
 * Leere und macht die Fälligkeit zu NaN — die Karte ist danach nie mehr fällig
 * und fehlt einfach, ohne Fehlermeldung. Deshalb hier klemmen statt hoffen.
 */
function sanitizeVocabEntry(raw: unknown): VocabEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Partial<VocabEntry>;
  if (typeof v.id !== "string" || !v.id) return null;
  if (typeof v.swahili !== "string" || !v.swahili.trim()) return null;
  if (typeof v.german !== "string" || !v.german.trim()) return null;

  const num = (value: unknown, fallback: number): number =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

  const createdAt = num(v.createdAt, Date.now());
  const box = Math.min(5, Math.max(1, Math.round(num(v.box, 1)))) as VocabEntry["box"];
  // `fsrs` aus dem Rest herauslösen: sonst brächte das Spread unten den
  // ungeprüften Zustand wieder herein und die Prüfung liefe ins Leere.
  const { fsrs: rawFsrs, ...rest } = v;
  const fsrs =
    rawFsrs &&
    typeof rawFsrs === "object" &&
    Number.isFinite(rawFsrs.stability) &&
    Number.isFinite(rawFsrs.due)
      ? rawFsrs
      : undefined;

  return {
    ...rest,
    id: v.id,
    swahili: v.swahili,
    german: v.german,
    partOfSpeech: v.partOfSpeech ?? "other",
    examples: Array.isArray(v.examples)
      ? v.examples.filter((e) => e && typeof e.sw === "string")
      : [],
    box,
    nextReview: num(v.nextReview, createdAt),
    createdAt,
    ...(fsrs ? { fsrs } : {}),
  };
}

/**
 * Kartenliste einer Backup-Datei prüfen. Doppelte Ids fliegen raus: sie würden
 * bei jedem Patch gemeinsam beschrieben und wären in der Liste nicht mehr
 * auseinanderzuhalten. Der erste Treffer gewinnt.
 */
export function sanitizeVocab(raw: unknown[]): VocabEntry[] {
  const seen = new Set<string>();
  const out: VocabEntry[] = [];
  for (const item of raw) {
    const entry = sanitizeVocabEntry(item);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    out.push(entry);
  }
  return out;
}

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
    packs,
  ] = await Promise.all([
    readCachedVocab(),
    readCachedStats(),
    getSettings(),
    readReviewLog(),
    getTrainerStats(),
    getStoriesRead(),
    getDialogueStats(),
    getRetentionChecks(),
    activePacks(),
  ]);
  const payload: BackupFileV5 = {
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
    activePacks: packs,
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
  const vocab = sanitizeVocab(data.vocab);
  if (vocab.length === 0) {
    throw new Error("Ungültige Backup-Datei: keine brauchbaren Karten enthalten.");
  }
  // Der Bestand geht an den Alt-Schlüssel, nicht direkt in den Kartenstore:
  // eine Backup-Datei bringt das Datenmodell ihrer Zeit mit, und die
  // Migrationskette unten hebt es an. Ein v1-Backup braucht migrateTo2
  // (FSRS-Zustand, leitnerDue, maturedAt), und erst migrateTo3 räumt in den
  // Store um. Direkt in den Store geschrieben liefe migrateTo2 ins Leere und
  // die Karten kämen ohne Scheduler-Zustand an.
  await set(K_VOCAB_LEGACY, vocab).catch(() => {});

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
  resetPacksCache();

  if (data.settings) await writeSettings(data.settings);
  await writeReviewLog(Array.isArray(data.reviewLog) ? data.reviewLog : []);
  await writeTrainerStats(normalizeTrainerStats(data.trainerStats));
  await writeStoriesRead(data.storiesRead ?? {});
  await writeDialogueStats(normalizeDialogueStats(data.dialogueStats));
  await writeRetentionChecks(Array.isArray(data.retentionChecks) ? data.retentionChecks : []);
  await set("packs:active", Array.isArray(data.activePacks) ? data.activePacks : []).catch(
    () => {},
  );
  if (data.milestones) await set("milestones:achieved", data.milestones).catch(() => {});

  // v1-Backup (oder eines ohne Settings) über die Migration schicken, damit
  // FSRS-Zustand, leitnerDue und maturedAt nachgezogen werden.
  // Datenversion der *Datei* setzen und die Kette laufen lassen — sie hebt den
  // Bestand von dort auf den aktuellen Stand. Eine v1-Datei braucht den vollen
  // Weg (Scheduler-Zustand ergänzen, dann umräumen), ab Backup-v2 entspricht
  // das Kartenmodell der Datenversion 2 und es fehlt nur noch der Umzug in die
  // eigenen Stores (Datenversion 3). Die Backup-Versionen 3 bis 5 fügen nur
  // neue, eigenständige Schlüssel mit eigenen Defaults hinzu.
  const cardModelVersion = (data.version ?? 1) >= 2 ? 2 : 1;
  await set(K_VERSION, cardModelVersion).catch(() => {});
  resetMigrationState();
  await runMigrations();

  return { vocabCount: vocab.length };
}

/** Alle lokalen Daten löschen (Werkseinstellungen). */
export async function resetAllData(): Promise<void> {
  // Drei Stores, drei Aufrufe: `clear()` ohne Argument räumt nur den
  // Standard-Store. Karten, Log und Archiv liegen seit Datenversion 3 in
  // eigenen Datenbanken (siehe db.ts) und blieben sonst stehen — die App
  // sähe nach dem Zurücksetzen den alten Bestand wieder.
  await clear();
  await clear(cardStore()).catch(() => {});
  await clear(logStore()).catch(() => {});
  await clear(logArchiveStore()).catch(() => {});
  resetSettingsCache();
  resetReviewLogCache();
  resetTrainerStatsCache();
  resetMilestoneCache();
  resetStoriesReadCache();
  resetDialogueStatsCache();
  resetRetentionCache();
  resetPacksCache();
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
