import { useEffect } from "react";

/**
 * Springt zum Element, dessen Id im Hash steht — und klappt ein `<details>`
 * auf, falls das Ziel darin liegt.
 *
 * Nötig, weil die Grammatik ihre Nebenabschnitte eingeklappt zeigt: Ein
 * Deep-Link aus dem Trainer („Warum?") würde sonst auf eine zugeklappte
 * Zeile scrollen und nichts erklären. Der kurze Timeout wartet auf den
 * ersten Paint — vorher gibt es das Ziel im DOM noch nicht.
 */
export function useHashTarget(deps: unknown[] = []) {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!id) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.closest("details")?.setAttribute("open", "");
      el.scrollIntoView({ block: "start", behavior: "smooth" });
      // Kurzes Aufblinken: Bei langen Tafeln sieht man sonst nicht, welche
      // Zeile gemeint war.
      el.classList.add("ring-2", "ring-primary", "rounded-2xl");
      window.setTimeout(() => el.classList.remove("ring-2", "ring-primary", "rounded-2xl"), 2000);
    }, 80);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
