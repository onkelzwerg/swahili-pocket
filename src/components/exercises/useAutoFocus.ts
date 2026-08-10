import { useEffect, useRef } from "react";

/**
 * Fokus setzen, ohne die Seite zu scrollen.
 *
 * `autoFocus` (bzw. ein nacktes `focus()`) scrollt das Element in den
 * sichtbaren Bereich — im Review-Screen schob das den Kopf mit Fortschritt
 * und Zurück-Button aus dem Bild, obwohl gar nichts zu scrollen war.
 * `preventScroll` behält die Tastaturbedienung und lässt das Layout stehen.
 */
export function useAutoFocus<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus({ preventScroll: true });
  }, [enabled]);
  return ref;
}
