import { useEffect, useState } from "react";

// Wie viel Platz die Software-Tastatur gerade wegnimmt.
//
// Der Review-Screen ist auf `100svh` festgenagelt und der Body-Scroll ist
// gesperrt (damit Pull-to-Refresh und die Wisch-Geste sauber bleiben). Genau
// das nimmt dem Browser die übliche Notlösung, das fokussierte Feld selbst in
// den sichtbaren Bereich zu scrollen: im Modus „Tippen“ lag die Eingabe damit
// unter der Tastatur, und man tippte blind.
//
// Die Tastatur verkleinert nicht das Layout-Viewport, sondern nur das visuelle
// — deshalb ist `visualViewport` die einzige Quelle, die sie überhaupt sieht.

/** Ab hier ist es eine Tastatur und nicht die ein-/ausfahrende Adressleiste. */
const KEYBOARD_MIN = 120;

/**
 * Die Höhe in Pixeln, die die Tastatur vom Layout-Viewport verdeckt — 0, wenn
 * keine offen ist (und immer 0 ohne `visualViewport`, etwa im SSR-Durchlauf
 * oder auf dem Desktop).
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // `offsetTop` zählt mit: iOS schiebt zusätzlich das visuelle Viewport
      // nach oben, wenn das Feld sonst unter der Tastatur läge.
      const covered = window.innerHeight - (vv.height + vv.offsetTop);
      setInset(covered >= KEYBOARD_MIN ? Math.round(covered) : 0);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
