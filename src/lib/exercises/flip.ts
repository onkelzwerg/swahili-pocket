import type { ExerciseMode } from "./types";

// Der Bestandsmodus: Karte ansehen, umdrehen, selbst bewerten.
// Immer erlaubt — er ist der Fallback, wenn kein anderer Modus greift.
// Deshalb Gewicht 1 und keine Eignungsprüfung.

export const flipMode: ExerciseMode = {
  id: "flip",
  isEligible: () => true,
  weight: () => 1,
};
