# Website-Briefing: Swahili Pocket

> Briefing für die Gestaltung einer Marketing-/Landing-Page zur App
> **Swahili Pocket**. Alle Farben, Schriften, Texte und Feature-Beschreibungen
> in diesem Dokument sind aus dem tatsächlichen App-Code extrahiert und
> verbindlich — nichts erfinden, nichts umbenennen.

---

## 1. Das Produkt in einem Satz

**Swahili Pocket** ist eine kostenlose, werbefreie Progressive Web App (PWA),
mit der Deutschsprachige Swahili-Vokabeln lernen — mit Karteikarten-System,
über 1.000 kuratierten Vokabeln, Grammatik-Referenz und Dialogen.
**Ohne Konto, ohne Cloud: alle Lerndaten bleiben auf dem Gerät.**

- **Name:** Swahili Pocket (Projektname: „Jifunze Pocket" — *jifunze* = Swahili für „lerne!")
- **Plattform:** Browser / PWA, installierbar auf iOS, Android und Desktop; voll offline-fähig
- **Sprache der App:** Deutsch (Zielsprache: tansanisches Kiswahili sanifu)
- **Preis:** kostenlos, keine Werbung, kein Tracking, keine Registrierung

## 2. Zielgruppe

- Deutschsprachige, die nach Tansania/Kenia/Ostafrika reisen (Urlaub, Safari, Kilimandscharo, Sansibar)
- Menschen mit Familien- oder Partnerschaftsbezug nach Ostafrika
- Freiwilligendienstler:innen, NGO-Mitarbeiter:innen, Expats
- Sprachinteressierte, die eine afrikanische Sprache lernen wollen

Tonalität der Ansprache: **warm, ermutigend, unkompliziert** — per Du.
Kein Corporate-Sprech, kein Gamification-Geschrei. Eher „dein Begleiter"
als „die ultimative Lernmaschine".

## 3. Farbpalette (verbindlich)

Erdtöne, inspiriert von ostafrikanischer Landschaft: Terrakotta-Erde,
Savannen-Ocker, tiefes Waldgrün, Cremeweiß. Warm, natürlich, ruhig.

| Rolle | Name | Hex | oklch (App-Original) |
|---|---|---|---|
| Primärfarbe / CTA | **Terrakotta** | `#c2522a` | `oklch(0.58 0.17 38)` |
| Sekundär / Erfolg | **Tiefgrün (Forest)** | `#2d5a3d` | `oklch(0.45 0.12 150)` |
| Akzent | **Ocker** | `#d9a441` | `oklch(0.72 0.15 70)` |
| Hintergrund | **Cremeweiß** | `#faf5ec` | `oklch(0.97 0.015 75)` |
| Karten/Flächen | Off-White | `#fdfbf7` | `oklch(0.99 0.008 75)` |
| Text | Dunkles Warmbraun | `#3a322b` | `oklch(0.22 0.02 60)` |
| Gedämpfter Text | Graubraun | `#7d746a` | `oklch(0.5 0.03 60)` |
| Ränder/Linien | Sand | `#e3dccf` | `oklch(0.88 0.02 75)` |

Signatur-Verlauf der App (Lernkarten-Vorderseite):
**Terrakotta → Ocker** (`linear-gradient(135deg, #c2522a, #d9a441)`).
Dieser Verlauf ist das visuelle Markenzeichen und sollte im Hero der
Website auftauchen.

Es existiert ein Dark Theme mit denselben Hues auf dunklem Warmbraun
(`oklch(0.18 0.02 50)`), die Website darf es optional unterstützen.

## 4. Typografie (verbindlich)

| Rolle | Schrift | Verwendung |
|---|---|---|
| Display/Headlines | **Fraunces** (Google Fonts, Serif, opsz 9–144, Gewichte 400/600/700/900) | Alle Überschriften, große Zahlen, Wortkarten |
| Fließtext/UI | **Plus Jakarta Sans** (Google Fonts, 400/500/600/700) | Alles andere |

Charakter: Fraunces gibt Wärme und editorialen Charme (fast „Buch-Gefühl"),
Plus Jakarta Sans hält die UI modern und klar. Diese Kombination unbedingt
auf der Website übernehmen.

## 5. Design-Sprache / Look & Feel

- **Mobile-first**, die App selbst ist auf `max-width: 28rem` zentriert — die Website darf breiter sein, sollte aber App-Screens in einem Phone-Rahmen zeigen
- **Sehr runde Formen:** Buttons als Voll-Pillen (`border-radius: 9999px`), Karten mit `border-radius: 1.5rem`, Basis-Radius `1rem`
- Weiche, dezente Schatten; feine 1px-Ränder in Sand-Tönen
- Kleine Uppercase-Labels mit Letter-Spacing als Eyebrows (z. B. „MSAMIATI", „BACKUP")
- Emojis als freundliche Akzente (🌴 🎉 ☀️ 🍲 💬 🔥)
- Micro-Motion: sanfte Spring-Animationen, Konfetti bei Lernerfolgen
- Bildwelt (falls Fotos/Illustrationen): ostafrikanische Landschaft, Markt, Alltag — warm und respektvoll, keine Klischee-Safari-Stockfotos

## 6. Wording & Markensprache

Die App mischt deutsches UI mit Swahili-Signalwörtern. Diese dürfen und
sollen auf der Website vorkommen (immer mit Übersetzung beim ersten Auftreten):

- **Karibu!** — Willkommen!
- **Msamiati** — Wortschatz (Eyebrow des Lexikons)
- **Vizuri sana!** — Sehr gut! (Abschluss einer Lernrunde)
- **Hakuna kazi leo!** — Heute keine Arbeit! (leerer Übungs-Screen)
- **Ngeli** — die Swahili-Nomenklassen (Name des Grammatik-Tabs)
- **Pole pole ndio mwendo.** — „Langsam, langsam ist der Weg." (Sprichwort, passt perfekt als Marken-Claim für Spaced Repetition)

Navigation der App (exakt so benennen): **Home · Lexikon · Üben · Dialoge · Ngeli · Mehr**

## 7. Features (exakt, nichts dazuerfinden)

1. **Karteikarten mit Spaced Repetition (Leitner-System):**
   5 Boxen mit Intervallen 1/2/4/7/30 Tage. Karten swipen (rechts = gewusst,
   links = nochmal) oder Buttons. Karte antippen zum Umdrehen:
   vorne Swahili, hinten Deutsch + bis zu 2 Beispielsätze.
2. **Über 1.000 kuratierte Vokabeln im Pool:** durchsuchbar, filterbar nach
   Wortart und Ngeli-Klasse, jede mit Beispielsätzen. Per Klick als
   Lernkarte übernehmen.
3. **Gezieltes Kartenziehen:** Anzahl (5–20) per Slider wählen, Bereich als
   Freitext („Küche", „Reisen", „M-Wa-Klasse") oder Themen-Chip — die App
   findet passende, noch ungelernte Vokabeln.
4. **Eigene Vokabeln anlegen:** mit Wortart, Ngeli und eigenen Beispielsätzen.
5. **Ngeli-Grammatik-Referenz:** alle Swahili-Nomenklassen (M-Wa, M-Mi,
   Ki-Vi, N, Ji-Ma, U, Pa-Ku-Mu, Ku) mit Präfix-Tabellen, Demonstrativa
   und Beispielen.
6. **Dialoge:** 13 alltagsnahe Beispiel-Dialoge (Begrüßung, Markt, Restaurant,
   Taxi, Hotel, Notfall …) als Chat-Ansicht mit Vorlesefunktion.
7. **Vorlesefunktion (TTS):** jedes Wort, jeder Beispielsatz und ganze
   Dialoge per Lautsprecher-Button (Browser-Sprachausgabe).
8. **Motivation:** Tages-Streak 🔥, XP, Fortschritts-Level von A1.1 bis C2
   (CEFR-orientiert, nach Anzahl gelernter Wörter).
9. **Spruch des Tages:** 30 Swahili-Sprichwörter (Methali) und
   Kanga-Weisheiten mit Übersetzung.
10. **100 % offline & privat:** PWA, installierbar; alle Daten in der
    lokalen Browser-Datenbank; JSON-Backup zum Exportieren/Importieren;
    kein Konto, kein Server, kein Tracking.

## 8. USPs (Reihenfolge = Priorität)

1. **Deine Daten gehören dir.** Kein Konto, keine Cloud, kein Tracking — funktioniert komplett offline.
2. **1.000+ geprüfte Vokabeln mit echten Beispielsätzen** — nicht nur Wortlisten.
3. **Wissenschaftlich fundiert:** Leitner-Spaced-Repetition + CEFR-orientierte Level.
4. **Ngeli endlich verständlich:** die gefürchteten Nomenklassen als klare Referenz, in jede Karte integriert.
5. **Kostenlos und werbefrei.**

## 9. Vorschlag Seitenstruktur (Landing Page)

1. **Hero:** Terrakotta-Ocker-Verlauf, Fraunces-Headline, Phone-Mockup der
   Lernkarte, CTA-Pill „App öffnen" (+ Hinweis „kostenlos · ohne Anmeldung").
   - Headline-Vorschlag: „Swahili lernen. Pole pole."
   - Sub: „Karteikarten, 1.000+ Vokabeln und Grammatik — kostenlos, offline, ohne Konto."
2. **3 USP-Karten** (privat & offline / 1.000+ Vokabeln / Spaced Repetition)
3. **Feature-Sektion** mit Screenshots (Lernkarte, Lexikon, Ngeli-Tabellen, Dialoge)
4. **„So funktioniert's"** — 3 Schritte: Vokabeln ziehen → täglich üben → Level aufsteigen
5. **Privatsphäre-Sektion** (dunkelgrüner Block): „Kein Konto. Kein Server. Deine Daten bleiben auf deinem Gerät."
6. **Spruch-des-Tages-Teaser** als atmosphärisches Element (grüne Karte, wie in der App)
7. **FAQ:** Ist die App wirklich kostenlos? / Brauche ich Internet? / Was passiert mit meinen Daten? / Wie installiere ich eine PWA? / Für welches Swahili? (tansanisches Kiswahili sanifu)
8. **Footer:** Link zur App, GitHub-Repo, Impressum/Datenschutz

## 10. CTA & Installations-Hinweis

- Primärer CTA: **„App öffnen"** → https://app.swahili-pocket.de
- Sekundär: „Zum Homescreen hinzufügen" erklären (PWA-Install auf iOS: Teilen → Zum Home-Bildschirm; Android/Chrome: Installieren-Prompt)

## 11. Assets & Technisches

- App-Icons liegen im Repo: `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png` (können als Logo-Basis dienen)
- Screenshots am besten direkt aus der laufenden App im Phone-Format (390×844) erzeugen
- Repo: https://github.com/onkelzwerg/swahili-pocket
- App-URL: https://app.swahili-pocket.de (Custom Domain, in Einrichtung)
- Website-Domain: https://swahili-pocket.de
- Die Website selbst sollte statisch und leichtgewichtig sein (passt zur
  Philosophie der App) — z. B. eine einzelne HTML-Seite auf Cloudflare Pages

## 12. Don'ts

- Keine Fantasie-Features beschreiben (kein KI-Tutor, keine Community, keine App-Store-Links — es gibt nur die PWA)
- Keine kalten Blau-/Grautöne, kein Neon
- Kein „Duolingo-Klon"-Vergleich, keine fremden Markennamen
- Nicht „Konto erstellen" o. Ä. formulieren — es gibt bewusst keins
