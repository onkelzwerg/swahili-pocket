import type { AnyRouter } from "@tanstack/react-router";

/**
 * Route-Bündel vorwärmen, solange Netz da ist (Leitplanke 1: offline-first).
 *
 * Der Router teilt jede Route in ein eigenes Bündel auf; geladen wird es erst
 * beim ersten Aufruf. Der Service Worker legt `/assets/`-Dateien zwar ab, aber
 * nur solche, die schon einmal geholt wurden — ein nie besuchter Bereich hat
 * also keinen Cache-Eintrag.
 *
 * Offline endet ein Tipp darauf im Nichts: der dynamische Import scheitert,
 * `ChunkReloadGuard` lädt die Seite neu, die Neuladung landet wieder auf der
 * Bibliothek — und der zweite Versuch tut binnen zehn Sekunden gar nichts
 * mehr (Drosselung in `tryHardReload`). Von außen sieht das aus wie eine tote
 * Kachel, und genau so wurde es gemeldet: „Ngeli" und „Verben & Zeitformen"
 * reagierten nicht, während „Geschichten" und „Dialoge" gingen — die waren
 * schon einmal offen und damit im Cache.
 *
 * Deshalb holt die App die Bündel einmal im Leerlauf nach vorne. Danach liegt
 * jeder Bereich im Cache und ist auch ohne Netz erreichbar.
 */

/**
 * Alle Ziele ohne Pfadparameter. Bewusst eine Liste statt eines Laufs über den
 * Routenbaum: `/stories/$storyId` und `/dialogues/$dialogueId` brauchen ein
 * Argument, und ein erfundenes würde nur einen Ladefehler vorwärmen.
 */
const WARM_PATHS = [
  "/",
  "/review",
  "/trainer",
  "/lexicon",
  "/lexicon/new",
  "/library",
  "/stories",
  "/dialogues",
  "/classes",
  "/verbs",
  "/words/today",
  "/words/mastered",
  "/account",
] as const;

/** Pause zwischen zwei Vorladungen — der sichtbare Bereich hat Vorrang. */
const GAP_MS = 150;

/** Vorlauf nach dem Start, damit die aktuelle Seite zuerst fertig wird. */
const IDLE_MS = 2500;

const warmed = new Set<string>();

function whenIdle(run: () => void, delay: number): () => void {
  const timer = window.setTimeout(run, delay);
  return () => window.clearTimeout(timer);
}

async function warmOnce(router: AnyRouter): Promise<void> {
  for (const path of WARM_PATHS) {
    if (warmed.has(path)) continue;
    // Kein Netz mehr? Dann bringt der Rest nichts — beim nächsten `online`
    // läuft der Lauf weiter, die schon geholten Pfade bleiben übersprungen.
    if (!navigator.onLine) return;
    try {
      await router.preloadRoute({ to: path });
      warmed.add(path);
    } catch {
      // Ein einzelner Fehlschlag (Netz weg, 404 nach Deploy) darf den Lauf
      // nicht abbrechen — der Pfad bleibt ungemerkt und kommt später dran.
    }
    await new Promise((r) => setTimeout(r, GAP_MS));
  }
}

/**
 * Vorwärmen starten. Gibt eine Aufräumfunktion zurück (für `useEffect`).
 *
 * Läuft erneut, sobald das Gerät wieder online geht: Wer die App zum ersten
 * Mal ohne Netz öffnet, soll die Bündel nicht für immer vermissen.
 */
export function startRouteWarmup(router: AnyRouter): () => void {
  if (typeof window === "undefined") return () => {};

  let cancelled = false;
  const run = () => {
    if (cancelled || !navigator.onLine) return;
    void warmOnce(router);
  };

  const cancelIdle = whenIdle(run, IDLE_MS);
  window.addEventListener("online", run);

  return () => {
    cancelled = true;
    cancelIdle();
    window.removeEventListener("online", run);
  };
}

/** Nur für Tests: den Merker leeren. */
export function resetRouteWarmup(): void {
  warmed.clear();
}
