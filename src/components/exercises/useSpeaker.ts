import { useCallback, useRef, useState } from "react";

// Kleine Hülle um die `speak`-Prop der Übungsmodi: merkt sich, welcher
// Auslöser gerade spricht, damit Buttons einen Ladezustand zeigen können.
// Getrennt von den Komponenten, damit Fast Refresh sauber bleibt.

export interface Speaker {
  /** Schlüssel des gerade sprechenden Auslösers, sonst null. */
  speaking: string | null;
  play(key: string, text: string): void;
}

export function useSpeaker(speak: (text: string) => Promise<void>): Speaker {
  const [speaking, setSpeaking] = useState<string | null>(null);
  const busy = useRef(false);

  const play = useCallback(
    (key: string, text: string) => {
      if (busy.current || !text) return;
      busy.current = true;
      setSpeaking(key);
      void speak(text).finally(() => {
        busy.current = false;
        setSpeaking(null);
      });
    },
    [speak],
  );

  return { speaking, play };
}
