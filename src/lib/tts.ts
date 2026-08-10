import { APP_CONFIG } from "@/config/app.config";

// Sprachausgabe: bevorzugt vorab generierte ElevenLabs-MP3s aus public/audio/
// (erzeugt via scripts/generate-audio.mjs, nachgeschlagen über manifest.json).
// Für Texte ohne fertiges Audio: Fallback auf die Web Speech API.

const LANG = APP_CONFIG.targetLanguageCode.split("-")[0];

// ---------------------------------------------------------------------------
// Vorab generiertes Audio (ElevenLabs)
// ---------------------------------------------------------------------------

type AudioManifest = Record<string, string>;

let manifestPromise: Promise<AudioManifest | null> | null = null;

function loadManifest(): Promise<AudioManifest | null> {
  if (!manifestPromise) {
    manifestPromise = fetch("/audio/manifest.json")
      .then((r) => (r.ok ? (r.json() as Promise<AudioManifest>) : null))
      .catch(() => null);
  }
  return manifestPromise;
}

let currentAudio: HTMLAudioElement | null = null;

// Winzige stille WAV-Datei: einmaliges play() innerhalb der User-Geste
// schaltet das Element auf iOS/Safari für spätere src-Wechsel frei.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

/**
 * In einem Click-Handler aufrufen und an speak() durchreichen, damit die
 * MP3-Wiedergabe auch nach asynchronen Zwischenschritten (Manifest-Fetch)
 * als nutzerinitiiert gilt.
 */
export function createUnlockedAudio(): HTMLAudioElement | undefined {
  if (typeof window === "undefined" || typeof Audio === "undefined") return undefined;
  const a = new Audio(SILENT_WAV);
  a.play().catch(() => {});
  return a;
}

/** Spielt eine Manifest-Datei ab. false = Wiedergabe kam nicht zustande. */
function playFile(file: string, preUnlocked?: HTMLAudioElement): Promise<boolean> {
  return new Promise((resolve) => {
    const a = preUnlocked ?? new Audio();
    currentAudio = a;
    let settled = false;
    const settle = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (currentAudio === a) currentAudio = null;
      resolve(ok);
    };
    a.onended = () => settle(true);
    a.onerror = () => settle(false);
    // Abbruch via cancelSpeech(): als erledigt werten, kein TTS-Fallback.
    a.onpause = () => {
      if (!a.ended) settle(true);
    };
    a.src = `/audio/${file}`;
    a.play().catch(() => settle(false));
  });
}

// ---------------------------------------------------------------------------
// Fallback: Web Speech API
// ---------------------------------------------------------------------------

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
  if (currentAudio) {
    const a = currentAudio;
    currentAudio = null;
    a.pause();
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

// ---------------------------------------------------------------------------
// Öffentliche API
// ---------------------------------------------------------------------------

/** Text vorlesen. Bricht laufende Ausgaben ab. */
export async function speak(text: string, preUnlocked?: HTMLAudioElement): Promise<void> {
  if (!text) return;
  stopAll();
  const manifest = await loadManifest();
  const file = manifest?.[text.trim()];
  if (file && (await playFile(file, preUnlocked))) return;
  await speakUtterance(text);
}

export type SpeakItem = { text: string };

// Zählt bei jedem Abbruch hoch, damit laufende Sequenzen aussteigen statt
// nach cancelSpeech() mit dem nächsten Satz weiterzumachen.
let cancelToken = 0;

export async function speakSequence(items: (string | SpeakItem)[]): Promise<void> {
  const token = ++cancelToken;
  // Ein freigeschaltetes Element für die ganze Sequenz wiederverwenden.
  const audio = createUnlockedAudio();
  for (const it of items) {
    if (cancelToken !== token) return;
    const text = typeof it === "string" ? it : it.text;
    await speak(text, audio);
    if (cancelToken !== token) return;
    await new Promise((r) => setTimeout(r, 250));
  }
}

export function cancelSpeech() {
  cancelToken++;
  stopAll();
}
