import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fisher-Yates: gleichverteilte Permutation.
 * Bewusst nicht `sort(() => Math.random() - 0.5)` — das ist stark verzerrt
 * (Vergleichsfunktion ist nicht konsistent) und bevorzugt die Ausgangsordnung.
 */
export function shuffle<T>(list: T[], rng: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
