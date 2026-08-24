export type ChangelogEntry = {
  version: string;
  date: string; // ISO YYYY-MM-DD
  title: string;
  changes: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    version: "0.8.0",
    date: "2026-08-23",
    title: "Ganze Sätze üben",
    changes: [
      "Neu im Grammatik-Gym: der Reiter „Sätze“. Statt einer einzelnen Form baust du den ganzen Satz — Nomen, Adjektiv und Verb müssen zusammenpassen. Du entscheidest einmal über Singular oder Plural und musst ihn dann durch den Satz durchhalten: aus „kitabu kizuri kinaanguka“ wird „vitabu vizuri vinaanguka“. Die falschen Antworten sind echte Formen — nur eben die einer anderen Klasse.",
      "Die Sätze ergeben auch etwas: Nomen und Verb werden nicht wahllos zusammengewürfelt. Ein Kind isst, schläft und lacht, ein Gerät geht kaputt und brennt, fallen kann beides — „die Bücher essen“ kommt nicht vor. Dafür stehen im Satztrainer nur Verben, die ohne Objekt einen ganzen Satz ergeben.",
      "„Jambo“ und „Hakuna matata“ sind raus. Beides sind Reiseführer-Floskeln, die im gesprochenen Swahili kaum vorkommen; gegrüßt wird mit „hujambo“ oder „habari“. Die echten Formeln stehen weiterhin im Glossar der Dialoge, nur nicht mehr als Vokabelkarte. Wer die Karten schon hatte, verliert sie beim nächsten Start.",
      "Ngeli und Verben & Zeitformen ließen sich aus der Bibliothek heraus manchmal nicht öffnen — ein Tipp, und nichts passierte. Grund war ein Bereich, dessen Programmteil noch nirgends zwischengespeichert war; ohne Netz lief der Aufruf ins Leere. Die App lädt jetzt alle Bereiche im Hintergrund vor, sobald sie Netz hat, und ist damit auch offline vollständig bedienbar.",
      "„Grammatik üben“ öffnet jetzt den Reiter, den die Kachel verspricht: von der Ngeli-Seite die Ngeli-Aufgaben, von den Verben die Verbformen.",
    ],
  },
  {
    version: "0.7.0",
    date: "2026-08-13",
    title: "Zwanzig Geschichten, dreiundzwanzig Dialoge zum Mitreden",
    changes: [
      "Fünfzehn neue Geschichten — jetzt sind es zwanzig, zehn auf der ersten und zehn auf der zweiten Stufe.",
      "Alle Dialoge lassen sich mitspielen, nicht mehr nur drei: 85 Stellen, an denen du wählst, was du sagst. Jede falsche Antwort ist plausibel falsch — falsche Zeit, falsche Person, falsche Klasse — und sagt dir, woran es lag.",
      "Im Dialog kannst du jetzt jedes Wort antippen und siehst, was es heißt — wie in den Geschichten.",
      "Dialoge schalten sich frei wie Geschichten: ab 95 % bekannter Wörter. Bei gesperrten steht, wie viele noch fehlen, und ein Tipp bringt dich direkt zu genau diesen Wörtern.",
      "Neu: Themenpakete in der Bibliothek. Sechs Wortschatzpakete — Arbeit, Umwelt, Geld & Behörden, Politik, Gesundheit, Schule — die du einzeln zuschaltest. Ein eingeschaltetes Paket bringt seine Wörter in deine Auswahl und macht die Inhalte sichtbar, die sie brauchen.",
      "Der Grundwortschatz ist auf 1.268 Wörter gewachsen, dazu 56 in den Paketen. Neu dabei: Lokative, feste Wendungen und die Zehnerzahlen, die bisher fehlten.",
      "Zwei neue Meilensteine — zehn freigeschaltete Dialoge und fünf fehlerfrei mitgespielte.",
    ],
  },
  {
    version: "0.6.0",
    date: "2026-08-10",
    title: "Lesen, mitspielen, nachprüfen",
    changes: [
      "Neu: Geschichten. Kurze Texte auf Swahili, zu jedem Wort ein Glossar — antippen genügt.",
      "Eine Geschichte schaltet sich frei, sobald du 95 % ihrer Wörter kennst. Bei gesperrten steht, wie viele noch fehlen — und ein Tipp bringt dich direkt zu genau diesen Wörtern.",
      "Dialoge kann man jetzt mitspielen: du übernimmst eine Rolle und wählst, was du sagst. Bei einer falschen Antwort erklärt ein Satz, warum sie nicht passt.",
      "Neu: Langzeit-Check. Er erscheint von selbst, wenn genug Wörter über zwei Monate liegen, und sagt dir ehrlich, was davon noch sitzt.",
      "Die untere Leiste hat statt sechs nur noch fünf Einträge. Dialoge und Ngeli findest du jetzt unter „Bibliothek“.",
      "Vier neue Meilensteine — für die erste Geschichte, das Lesen ohne Übersetzung, einen bestandenen Langzeit-Check und einen fehlerfrei mitgespielten Dialog.",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-08-10",
    title: "Echte Abruf-Übungen: tippen, hören, Lücken füllen",
    changes: [
      "Eine Runde mischt jetzt vier Übungsarten: Karte, Tippen, Hören und Lückensatz — abschaltbar unter Einstellungen › Übungsarten.",
      "Beim Tippen zählen Tippfehler nicht als Fehler: fehlende Apostrophe (ngombe für ng'ombe) und vertauschte Buchstaben werden erkannt und nur korrigiert.",
      "Kanntest du eine andere richtige Übersetzung? „Meine Antwort war auch richtig“ wertet sie als gewusst.",
      "Neu: Grammatik-Gym unter /trainer — Verbformen aus Bausteinen bauen und Ngeli-Kongruenz üben, mit Aufgaben aus deinem eigenen Wortschatz.",
      "Der Abschluss einer Runde zeigt jetzt, was sie gebracht hat: Trefferquote, neu gefestigte Wörter und den Stand deines Wochenziels.",
      "Meilensteine: zwölf Marken, die an Können hängen — nicht daran, wie oft du die App geöffnet hast. Sammelansicht in den Einstellungen.",
    ],
  },
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
