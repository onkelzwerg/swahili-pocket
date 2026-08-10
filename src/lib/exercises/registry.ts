import type { SessionModeId } from "../types";
import type { ExerciseMode } from "./types";
import { flipMode } from "./flip";
import { typedMode } from "./typed";
import { audioMode } from "./audio";
import { clozeMode } from "./cloze";

// Registry aller Übungsmodi (Entscheidung C).
// Ein neuer Modus wird hier eingetragen — der Session-Builder und der
// Review-Screen brauchen dafür keine Änderung.
//
// `ExerciseModeId` selbst lebt in `lib/types.ts`, weil `ReviewLogEntry` den
// Typ schon seit Welle 1 braucht; hier nur re-exportiert.
export type { ExerciseModeId, SessionModeId } from "../types";
export type { ExerciseMode, ExerciseContext, ExerciseProps } from "./types";

export const EXERCISE_MODES: ExerciseMode[] = [flipMode, typedMode, audioMode, clozeMode];

/** Fallback, wenn kein Modus greift — immer verfügbar. */
export const FALLBACK_MODE: SessionModeId = "flip";

export function getMode(id: SessionModeId): ExerciseMode | undefined {
  return EXERCISE_MODES.find((m) => m.id === id);
}

/**
 * Modi, die der Nutzer in den Einstellungen abschalten kann.
 * „flip" fehlt bewusst: es ist der Fallback, ohne den Karten ohne zulässigen
 * Modus dastünden.
 */
export type ToggleableModeId = Exclude<SessionModeId, "flip">;
export const TOGGLEABLE_MODES: ToggleableModeId[] = ["typed", "audio", "cloze"];
