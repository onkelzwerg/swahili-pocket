# Deployment

Die App ist eine **rein lokale PWA**: kein Backend, keine Datenbank, keine
API-Keys. Alle Lerndaten liegen in IndexedDB auf dem Gerät; Backup/Restore
läuft über JSON-Export im Bereich „Mehr".

**App (Custom Domain, geplant):** https://app.swahili-pocket.de
**Website (Bewerbung der PWA):** https://swahili-pocket.de

> Die Custom Domain ist noch nicht in Cloudflare eingerichtet (TLD noch nicht
> final bestätigt). Bis dahin läuft der Worker unter seiner internen
> `*.workers.dev`-Preview-URL. Nach Domain-Einrichtung: `workers_dev` abschalten,
> damit ausschließlich `app.swahili-pocket.de` ausgeliefert wird.

## Build & Deploy (Cloudflare Workers)

```sh
npx wrangler login   # einmalig
npm run deploy       # baut (vite build) und deployt in einem Schritt
```

**Es sind keine Environment-Variablen nötig.** Der Cloudflare Free Plan reicht
vollständig.

### Warum zwei Wrangler-Configs?

- `wrangler.jsonc` — für den **Vite-Build**. `main` zeigt auf den virtuellen
  Entry `@tanstack/react-start/server-entry`, den nur der Vite-Build
  (`@cloudflare/vite-plugin`) auflöst.
- `wrangler.deploy.jsonc` — für **`wrangler deploy`**. `main` zeigt auf den
  bereits gebauten Worker `dist/server/server.js`, statische Assets aus
  `dist/client`. Diese Trennung ist nötig, weil der hier verwendete
  Lovable-Vite-Wrapper den Cloudflare-Deploy nicht automatisch verdrahtet.

Das `npm run deploy`-Script kombiniert beide Schritte korrekt.

Custom Domain: Cloudflare-Dashboard → Workers & Pages → `swahili-pocket`
→ Settings → Domains & Routes.

## Vokabel-Pool aktualisieren

Der Pool wird als statisches JSON ausgeliefert (`public/vocab-pool.json`).
Neuen Content einspielen:

```sh
node scripts/pool-from-csv.mjs pfad/zur/shared_vocab.csv
```

Erwartet einen CSV-Export der ehemaligen `shared_vocab`-Tabelle
(Spalten: swahili, german, part_of_speech, noun_class, examples, topics,
is_active, review_status). Fehlt die Datei, fällt die App auf den
Seed-Wortschatz aus `src/lib/seed.ts` zurück.

## Neue Sprachvariante

1. Repo forken/duplizieren.
2. `src/config/app.config.ts` anpassen (Sprache, Sprachcode, Themen).
3. `src/lib/seed.ts` (Wortschatz, Dialoge, Sprichwörter) und
   `public/vocab-pool.json` in der neuen Sprache kuratieren.
4. Theme-Farben in `src/styles.css` (oklch-Tokens) anpassen.
5. Deployen — fertig. Keine Datenbank, keine Secrets.
