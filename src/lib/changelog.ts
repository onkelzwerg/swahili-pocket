export type ChangelogEntry = {
  version: string;
  date: string; // ISO YYYY-MM-DD
  title: string;
  changes: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    version: "0.4.0",
    date: "2026-08-09",
    title: "Ehrlicheres Wiederholen: vier Antwortstufen & Wochenziel",
    changes: [
      "Statt Richtig/Falsch gibt es vier Stufen: Nochmal, Schwer, Gut, Einfach — mit Vorschau, wann die Karte wiederkommt.",
      "Neue Lernmethode „Adaptiv (FSRS)“: passt die Abstände an jede einzelne Karte an. Umschaltbar in den Einstellungen, dein Fortschritt bleibt dabei erhalten.",
      "Box-5-Karten kommen nach 90 Tagen zurück — gemeistert heißt lange Abstände, nicht nie wieder.",
      "Das Sprachlevel zählt jetzt gefestigte Wörter: Wörter, die du nach mindestens einer Woche Pause noch konntest.",
      "Wochenziel mit Mo–So-Ring, Streak-Joker für verpasste Tage und eine freundliche Rückkehr-Runde nach längeren Pausen.",
      "Tagesziel (5/10/20 Karten) und Wochenziel (3–7 Tage) sind frei wählbar.",
    ],
  },
  {
    version: "0.3.1",
    date: "2026-06-09",
    title: "Verbesserte Account-Verwaltung & Datenschutz",
    changes: [
      "Account löschen entfernt jetzt zuverlässig alle deine Daten (inkl. Einstufung & Meldungen).",
      "Hinweis im Account-Bereich, wie lange Backups nachhallen können.",
      "Für Admins: Nutzerverwaltung mit Inaktivitäts-Filter und protokollierter Löschung.",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-06-08",
    title: "Einstufungstest & passende Startvokabeln",
    changes: [
      "Neuer Einstufungstest: bestimmt dein CEFR-Niveau in ca. 3 Minuten.",
      "Drei Frageformate: Ngeli zuordnen, Übersetzungen und Lückentexte.",
      "Wir füllen deine Lernkartei automatisch mit passenden Startvokabeln.",
      "Generierte Dialoge werden auf deine Stufe abgestimmt.",
      "Den Test findest du jederzeit im Ngeli-Bereich zum Wiederholen.",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-30",
    title: "Stabilere Vorschläge & Melden",
    changes: [
      "Vorschläge aus dem Pool liefern jetzt exakt die gewünschte Anzahl an Vokabeln.",
      "Vokabeln können direkt auf der Übersetzungsseite der Lernkarte gemeldet werden.",
      "Audio-Fallback stabilisiert: keine endlos drehenden Ladeindikatoren mehr.",
      "Login-Redirect-Schleife behoben.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-01",
    title: "Erste öffentliche Version",
    changes: [
      "Lexikon mit kuratierten und KI-erweiterten Vokabeln.",
      "Persönliche Lernkarten mit Leitner-System.",
      "Dialoge und Grammatik-Kurzreferenz.",
    ],
  },
];

export const currentVersion = changelog[0];
