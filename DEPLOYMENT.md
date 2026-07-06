# Deployment

Die App ist eine **rein lokale PWA**: kein Backend, keine Datenbank, keine
API-Keys. Alle Lerndaten liegen in IndexedDB auf dem Gerät; Backup/Restore
läuft über JSON-Export im Bereich „Mehr".

## Build & Deploy (Cloudflare)

Build-Target ist Cloudflare Workers (`wrangler.jsonc`, `@cloudflare/vite-plugin`).

```sh
npm run build        # Produktions-Build
npx wrangler deploy  # Deploy auf Cloudflare (Free Plan reicht)
```

Alternativ: Git-Integration in der Cloudflare-Konsole (Push → Auto-Deploy).
Custom Domain über Cloudflare → Workers → Settings → Domains & Routes.

**Es sind keine Environment-Variablen nötig.**

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
