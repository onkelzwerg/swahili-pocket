import { clear } from "idb-keyval";
import type { UserStats, VocabEntry } from "./types";
import { cacheVocab, cacheStats, readCachedVocab, readCachedStats } from "./offline";
import { APP_CONFIG } from "@/config/app.config";

// JSON-Backup der Lerndaten. Schutz gegen IndexedDB-Verlust
// (Browserdaten löschen, Gerätewechsel).

interface BackupFile {
  app: string;
  version: 1;
  exportedAt: string;
  vocab: VocabEntry[];
  stats: UserStats | null;
}

export async function exportBackup(): Promise<void> {
  const [vocab, stats] = await Promise.all([readCachedVocab(), readCachedStats()]);
  const payload: BackupFile = {
    app: APP_CONFIG.appName,
    version: 1,
    exportedAt: new Date().toISOString(),
    vocab: vocab ?? [],
    stats,
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
  const data = JSON.parse(text) as Partial<BackupFile>;
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
    await cacheStats(data.stats);
  }
  return { vocabCount: vocab.length };
}

/** Alle lokalen Daten löschen (Werkseinstellungen). */
export async function resetAllData(): Promise<void> {
  await clear();
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
