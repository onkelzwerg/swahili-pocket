import { APP_CONFIG } from "@/config/app.config";

// Sprachausgabe rein über die Web Speech API (speechSynthesis).
// Kein Server, kein API-Key — Stimmqualität hängt vom Gerät ab.

const LANG = APP_CONFIG.targetLanguageCode.split("-")[0];

let voicesLoaded = false;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) =>
      v.lang.toLowerCase().startsWith(APP_CONFIG.targetLanguageCode.toLowerCase()),
    ) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(LANG)) ??
    null
  );
}

/** iOS/Chrome laden Stimmen asynchron — einmalig anstoßen. */
function ensureVoices() {
  if (voicesLoaded || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  voicesLoaded = true;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

function stopAll() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakUtterance(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    ensureVoices();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

/** Text vorlesen. Bricht laufende Ausgaben ab. */
export async function speak(text: string, _preUnlocked?: HTMLAudioElement): Promise<void> {
  if (!text) return;
  stopAll();
  await speakUtterance(text);
}

/**
 * Kompatibilitäts-Shim: Die Web Speech API braucht kein Audio-Unlock.
 * Bleibt erhalten, damit Aufrufer (SpeakButton) unverändert funktionieren.
 */
export function createUnlockedAudio(): HTMLAudioElement | undefined {
  return undefined;
}

export type SpeakItem = { text: string };

export async function speakSequence(items: (string | SpeakItem)[]): Promise<void> {
  for (const it of items) {
    const text = typeof it === "string" ? it : it.text;
    await speak(text);
    await new Promise((r) => setTimeout(r, 250));
  }
}

export function cancelSpeech() {
  stopAll();
}
