/**
 * Zentrale App-Konfiguration — Single Source of Truth für Marken-,
 * Sprach- und Stimm-Parameter.
 *
 * Hinweis Farben: Die `*Color`-Felder sind rein dokumentarisch. Die
 * tatsächliche Theme-Quelle für Components bleibt `src/styles.css`
 * (oklch-Tokens). Werte hier spiegeln die aktuellen Defaults und dienen
 * als Referenz für späteres Whitelabel/Theme-Switching.
 *
 * Hinweis AI-Prompts: Deutsche Prompt-Sätze in `src/lib/ai/*` bleiben
 * bewusst hartkodiert. `aiSystemPromptLanguage` ist die Zielsprach-Phrase,
 * die in Prompts für die Norm-Variante referenziert wird.
 */
export const APP_CONFIG = {
  appName: "Swahili Pocket",
  targetLanguage: "Swahili",
  targetLanguageCode: "sw-TZ",
  nativeLanguage: "Deutsch",

  // Erdtöne aus styles.css (dokumentarisch, nicht zur Laufzeit injiziert).
  primaryColor: "#c2522a", // Terrakotta / primary
  secondaryColor: "#2d5a3d", // Tiefgrün
  accentColor: "#d9a441", // Ocker
  backgroundColor: "#faf5ec", // Cremeweiß

  // Reihenfolge identisch zu VOICE_PROFILES in src/lib/voices.ts.
  elevenlabsVoiceIds: [
    "zw6zMBO3821KTR5PyClL", // Neema (weiblich, warm)
    "ZCxLldjTfQRRQvq80pEI", // Juma (männlich, ruhig)
    "wbMtjZ3Tz2AyyRCKYqby", // Zawadi (weiblich, lebhaft)
  ],

  aiSystemPromptLanguage: "tansanisches Kiswahili sanifu",
  grammarModuleName: "Grammatik",

  topicAreas: [
    "Familie",
    "Essen",
    "Transport",
    "Gesundheit",
    "Markt",
    "Natur",
    "Zuhause",
    "Arbeit",
    "Reisen",
    "Emotionen",
  ],
} as const;

export type AppConfig = typeof APP_CONFIG;
