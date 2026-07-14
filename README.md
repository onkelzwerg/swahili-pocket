# Swahili Pocket 🌴

**App:** https://app.swahili-pocket.de · **Website:** https://swahili-pocket.de

Eine kostenlose, werbefreie **Progressive Web App** zum Swahili-Lernen für
Deutschsprachige. Karteikarten nach dem Leitner-System, über 1.000 kuratierte
Vokabeln, Grammatik-Referenz und Alltagsdialoge — **ohne Konto, ohne Cloud,
voll offline**. Alle Lerndaten bleiben auf dem Gerät.

> _Pole pole ndio mwendo._ — Langsam, langsam ist der Weg.

## Features

- **Karteikarten (Leitner-System):** 5 Boxen — Wiederholung nach 1/2/4/7 Tagen,
  Box 5 gilt als gemeistert. Swipe- oder Button-Bedienung, Karte zum Umdrehen antippen.
- **1.000+ Vokabeln im Pool:** durchsuchbar, filterbar nach Wortart und
  Ngeli-Klasse, jede mit Beispielsätzen — per Klick als Lernkarte übernehmen.
- **Gezieltes Kartenziehen:** Anzahl per Slider (5–20), Bereich als Freitext
  („Küche", „Reisen", „M-Wa-Klasse") oder Themen-Chip.
- **Eigene Vokabeln** mit Wortart, Ngeli und eigenen Beispielsätzen anlegen.
- **Ngeli-Grammatik:** alle Swahili-Nomenklassen mit Präfix-Tabellen und Beispielen.
- **Dialoge:** 13 alltagsnahe Beispieldialoge als Chat-Ansicht mit Vorlesefunktion.
- **Sprachausgabe (TTS)** über die Web Speech API des Browsers.
- **Motivation:** Tages-Streak, XP und CEFR-orientierte Level (A1.1 bis C2).
- **100 % privat:** IndexedDB-Speicher, JSON-Backup zum Export/Import, kein Tracking.

## Tech-Stack

- [TanStack Start](https://tanstack.com/start) (React 19, TanStack Router/Query)
- Vite 7, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion
- IndexedDB (`idb-keyval`) als lokale Datenschicht — kein Backend
- Build-Target: **Cloudflare Workers** (`@cloudflare/vite-plugin`, Wrangler)

## Lokale Entwicklung

```sh
npm install
npm run dev      # Dev-Server auf http://localhost:8080
npm run build    # Produktions-Build
npm run lint     # ESLint + Prettier
```

## Deployment

Statischer Build auf Cloudflare Workers — **keine Environment-Variablen nötig**:

```sh
npm run build
npx wrangler deploy
```

Details in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Vokabel-Pool aktualisieren

Der Pool wird als statisches JSON ausgeliefert (`public/vocab-pool.json`).
Neuen Content einspielen:

```sh
node scripts/pool-from-csv.mjs pfad/zur/shared_vocab.csv
```

## Datenschutz

Die App speichert alles ausschließlich lokal im Browser (IndexedDB). Es gibt
kein Backend, keine Anmeldung, kein Analytics und keine externen Requests
außer dem Laden von Google Fonts. Für ein Geräte-Backup oder den Umzug auf
ein neues Gerät dient der JSON-Export im Bereich „Mehr".
