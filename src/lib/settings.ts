import { get, set } from "idb-keyval";
import { useEffect, useState } from "react";
import type { ExerciseModeId, SchedulerId } from "./types";

// Zentrale App-Einstellungen. Versioniert, damit spätere Felder migrierbar
// bleiben; Zugriff ausschließlich über getSettings()/updateSettings().
// Cache + Subscriber analog zum useOnlineStatus-Muster in TabBar.tsx.

const K_SETTINGS = "settings:app";

export interface AppSettings {
  version: 1;
  scheduler: SchedulerId;
  dailyGoalCards: 5 | 10 | 20;
  weeklyGoalDays: 3 | 4 | 5 | 6 | 7;
  /** Nicht gesetzt = an. Wird erst ab Welle 2 wirksam. */
  enabledModes: Partial<Record<ExerciseModeId, boolean>>;
}

/** Default für Neu-User. Bestandsdaten bekommen in der Migration "leitner". */
export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  scheduler: "fsrs",
  dailyGoalCards: 10,
  weeklyGoalDays: 4,
  enabledModes: {},
};

export const DAILY_GOAL_OPTIONS = [5, 10, 20] as const;
export const WEEKLY_GOAL_OPTIONS = [3, 4, 5, 6, 7] as const;

let cache: AppSettings | null = null;
const subscribers = new Set<(s: AppSettings) => void>();

/** Unbekannte/kaputte Felder auf Defaults zurückfallen lassen. */
function normalize(raw: Partial<AppSettings> | null | undefined): AppSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  return {
    version: 1,
    scheduler: raw.scheduler === "leitner" ? "leitner" : "fsrs",
    dailyGoalCards: (DAILY_GOAL_OPTIONS as readonly number[]).includes(raw.dailyGoalCards ?? -1)
      ? (raw.dailyGoalCards as AppSettings["dailyGoalCards"])
      : DEFAULT_SETTINGS.dailyGoalCards,
    weeklyGoalDays: (WEEKLY_GOAL_OPTIONS as readonly number[]).includes(raw.weeklyGoalDays ?? -1)
      ? (raw.weeklyGoalDays as AppSettings["weeklyGoalDays"])
      : DEFAULT_SETTINGS.weeklyGoalDays,
    enabledModes: raw.enabledModes ?? {},
  };
}

export async function getSettings(): Promise<AppSettings> {
  if (cache) return cache;
  const raw = await get<Partial<AppSettings>>(K_SETTINGS).catch(() => null);
  cache = normalize(raw);
  return cache;
}

/** Synchroner Zugriff auf den Cache (null, solange nie geladen). */
export function peekSettings(): AppSettings | null {
  return cache;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const next = normalize({ ...current, ...patch });
  cache = next;
  await set(K_SETTINGS, next).catch(() => {});
  for (const fn of subscribers) fn(next);
  return next;
}

/** Nur für Migration/Import: Settings direkt setzen, ohne vorher zu lesen. */
export async function writeSettings(settings: AppSettings): Promise<AppSettings> {
  const next = normalize(settings);
  cache = next;
  await set(K_SETTINGS, next).catch(() => {});
  for (const fn of subscribers) fn(next);
  return next;
}

/** Nur für Tests: Modul-Cache leeren. */
export function resetSettingsCache() {
  cache = null;
}

export function useSettings(): AppSettings | null {
  const [settings, setSettings] = useState<AppSettings | null>(cache);
  useEffect(() => {
    let alive = true;
    void getSettings().then((s) => {
      if (alive) setSettings(s);
    });
    subscribers.add(setSettings);
    return () => {
      alive = false;
      subscribers.delete(setSettings);
    };
  }, []);
  return settings;
}
