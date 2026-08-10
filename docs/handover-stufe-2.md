# Handover: Stufe 2 → Stufe 3

Stand: 2026-08-10. Bezug: `IMPLEMENTATION-PLAN.md` (Welle 2), `docs/handover-stufe-1.md`.
Alle Pfade sind repo-relativ zum Projekt-Root (`swahili-pocket/`).

---

## 1. Was umgesetzt wurde

Welle 2 komplett (W2.1–W2.8) auf `feature/welle-2-uebungen`, abgezweigt von
`main` (Welle 1 und die ElevenLabs-Arbeit sind dort bereits gemergt — die
offenen Branch-Fragen aus Handover 1 haben sich damit erledigt).

| Paket | Ist-Stand |
|---|---|
| W2.1 | `src/lib/exercises/` (Registry + 4 Modus-Module), `src/lib/session.ts`, `FlipCard.tsx` aus `review.tsx` gelöst, `review.tsx` ist Session-Host |
| W2.2 | `src/lib/answer-check.ts` — Normalisierung, Zielvarianten, Apostroph-Pass, Damerau-Levenshtein, Kurzwortregel |
| W2.3 | `TypedAnswer.tsx` + `AnswerFeedback.tsx` (geteilt mit Cloze), Override-Link |
| W2.4 | `AudioQuiz.tsx`, `exercises/audio.ts` mit `pickDistractors()` |
| W2.5 | `ClozeSentence.tsx`, `exercises/cloze.ts` mit `makeCloze()` |
| W2.6 | Abschluss-Screen mit Trefferquote, Gefestigten, Wochenstand, Meilenstein |
| W2.7 | `src/lib/morphology.ts`, `src/routes/_authenticated/trainer.tsx`, `src/lib/trainer-stats.ts` |
| W2.8 | `src/lib/milestones.ts` (12 Meilensteine), `MilestonesSection.tsx` |
| — | `ExerciseModesSection.tsx` (Modus-Schalter), Backup v3, Changelog 0.5.0 |

---

## 2. Abweichungen vom Plan

1. **`ExerciseModeId` wurde aufgeteilt** (`src/lib/types.ts`):
   `SessionModeId` = `flip | typed | audio | cloze`, `TrainerModeId` =
   `morph-verb | morph-ngeli`, `ExerciseModeId` ist die Vereinigung.
   Der Plan wollte einen Typ; ohne die Trennung müsste jede Modus→Komponente-
   Zuordnung Einträge für die Trainer-Modi erfinden, die es als Session-Modus
   nicht gibt. Die Registry arbeitet mit `SessionModeId`, das Log mit
   `ExerciseModeId`.
2. **Modus-Typen liegen in `src/lib/exercises/types.ts`,** nicht in
   `registry.ts` (Plan W2.1). Sonst importiert jedes Modus-Modul die Registry,
   die die Modus-Module importiert — derselbe Zyklus wie bei `lib/srs/`,
   das dort schon so aufgeteilt ist.
3. **`isEligible(card, ctx)` bekommt mehr als `{ hasAudio }`:**
   `ExerciseContext` enthält zusätzlich `vocab`, weil der Audio-Modus prüfen
   muss, ob es überhaupt drei brauchbare Distraktoren gibt.
4. **`buildSession()` nimmt ein Options-Objekt** statt nur `limit`, damit die
   Comeback-Runde aus Welle 1 (`?comeback=true`) dieselbe Modus-Zuweisung
   bekommt statt an ihr vorbeizulaufen.
5. **`hasAudio` heißt: eine vorab generierte MP3 existiert** (neu:
   `loadAudioIndex()` in `src/lib/tts.ts`). Der Web-Speech-Fallback zählt
   bewusst nicht — die Systemstimmen sprechen Swahili zu unzuverlässig aus,
   um darauf eine Verständnisfrage zu stellen.
6. **Der Ngeli-Trainer deckt sechs von acht Klassen ab** (M-Wa, M-Mi, Ki-Vi,
   Ji-Ma, N, U). Pa-Ku-Mu und Ku treten mit Adjektiven praktisch nicht auf;
   geübte Formen wären konstruiert. Steht als Kommentar in `morphology.ts`.
7. **Adjektivstämme sind auf konsonantischen Anlaut beschränkt.**
   `-eupe`/`-eusi` lösen Gleitlautregeln aus (`mweupe`, `cheupe`, `nyeupe`) —
   eine eigene Regel, die eine eigene Tabelle bräuchte.
8. **Der Trainer vergibt nur XP** (neu: `awardXp()` in `store.ts`), er zählt
   **nicht** als Review: `totalReviewed`, Streak und Lerntage bleiben den
   Karten vorbehalten. Siehe offene Frage 2.
9. **`countReviewsOnDay()` filtert auf Karten-Modi.** Trainer-Einträge stehen
   im selben Log (so wollte es der Plan, damit Meilensteine sie sehen), würden
   sonst aber das Tagesziel „7 / 10 Karten heute" nach ein paar Verbformen
   erfüllen.
10. **Kein `DATA_VERSION`-Sprung.** Welle 2 legt nur neue Schlüssel an
    (`stats:trainer`, `milestones:achieved`), die eigene Defaults haben —
    an `VocabEntry`/`UserStats` hat sich nichts geändert. Das Backup ist
    trotzdem auf **v3** gegangen, weil `trainerStats` mitgesichert wird;
    v1 und v2 bleiben importierbar.

---

## 3. Zentrale Entscheidungen

**Der Modus wird pro Karte neu gewürfelt, nicht blockweise vergeben.**
Interleaving (Rohrer & Taylor 2007) schlägt Blöcke desselben Formats.
`assignModes()` in `src/lib/session.ts` ist die Stelle.

**„Tippen" ist hart auf 40 % der Runde gedeckelt** (`maxShare` in
`exercises/typed.ts`). Ohne Deckel gewinnt es über sein Gewicht (2) fast
jede Auswahl und die Runde wird zur Tipparbeit. Der Deckel rundet auf
mindestens 1 auf, damit Tippen in kurzen Runden nicht ganz verschwindet.

**Fehlendes Apostroph ist `exact`, kein Tippfehler.** `ngombe` für `ng'ombe`
ist richtig — das Zeichen fehlt auf deutschen Tastaturen schlicht. Der
Tippfehler-Toleranz bleibt vorbehalten, was wirklich ein Vertipper ist.

**Bei Wörtern bis vier Zeichen zählen nur Vertauschungen als Tippfehler,
keine Ersetzungen.** Sonst würde `kupa` als `kula` durchgehen — Distanz 1
bei Länge 4 liegt innerhalb der Schwelle. Test: `answer-check.test.ts`,
„kula / kupa ist falsch".

**`typo` wertet fest als „Gut", `wrong` fest als „Nochmal".** Nur bei `exact`
darf der Nutzer zwischen Gut und Einfach wählen. Eine Selbstbewertung nach
einer erkannt falschen Antwort wäre reine Höflichkeit.

**Escape-Hatch statt perfekter Datenbank:** „Meine Antwort war auch richtig"
wertet als Gut und setzt `override: true` im Log. Damit sind fehlende
Zielformen im Bestand auffindbar, ohne dass der Nutzer im Lernfluss
blockiert wird.

**Meilensteine laufen nur am Session-Ende** (`checkMilestones(summary)`),
nie mitten in der Runde. Sessionbezogene Prüfungen (z. B. „fehlerfrei
getippt") bekommen die Rundenzusammenfassung übergeben, statt sie aus dem
Log zu rekonstruieren — Session-Grenzen stehen dort nicht drin.

**N-Klasse und Ji-Ma sind kuratiert, nicht gerechnet.** `-refu` → `ndefu`,
`-kubwa` → `kubwa`, `gari jipya`: die Nasalverschmelzung ist zu
unregelmäßig für eine Regel, die man einem Lernenden vorsetzen will.
Tabelle in `ADJECTIVE_STEMS` (`morphology.ts`), Test deckt jede Klasse ×
jeden Stamm ab.

**`focus({ preventScroll: true })` statt `autoFocus`** (neu:
`components/exercises/useAutoFocus.ts`). Mit `autoFocus` schob der Browser
den Review-Kopf (Fortschritt, Zurück-Button) aus dem Bild, obwohl nichts zu
scrollen war. Im Browser reproduziert und behoben.

**Enter wird explizit abgefangen** (`onKeyDown` in `TypedAnswer`,
`ClozeSentence`, `trainer.tsx`). Auf die implizite Formularabsendung ist über
Software-Tastaturen hinweg kein Verlass.

---

## 4. Geänderte und neue Dateien

Vollständige Liste: `git diff --name-status main..feature/welle-2-uebungen`

**Neu — Logik**
| Datei | Zuständig für |
|---|---|
| `src/lib/exercises/types.ts` | `ExerciseMode`, `ExerciseContext`, `ExerciseProps`, `ExerciseResultMeta` |
| `src/lib/exercises/registry.ts` | `EXERCISE_MODES`, `TOGGLEABLE_MODES`, Re-Export der Typen |
| `src/lib/exercises/flip.ts` | Fallback-Modus, immer zulässig |
| `src/lib/exercises/typed.ts` | `isTypedReady()`, Box-/Stabilitätsschwelle, `maxShare` |
| `src/lib/exercises/audio.ts` | `pickDistractors()`, `hasEnoughDistractors()` |
| `src/lib/exercises/cloze.ts` | `makeCloze()` — Lücke aus Beispielsatz |
| `src/lib/session.ts` | `assignModes()` (rein), `buildSession()` — einzige Stelle, die eine Runde baut |
| `src/lib/answer-check.ts` | `checkAnswer()`, `damerauLevenshtein()`, `highlightCorrection()` |
| `src/lib/morphology.ts` | `buildVerbTask()`, `buildNgeliTask()`, Konkordanztabellen |
| `src/lib/trainer-stats.ts` | `stats:trainer` — Zähler je Aufgabentyp und Nomenklasse |
| `src/lib/milestones.ts` | Deklarative Liste, `findNewMilestones()` (rein), `checkMilestones()` |

**Neu — UI**
| Datei | Zuständig für |
|---|---|
| `src/components/exercises/FlipCard.tsx` | Bestandsmodus, aus review.tsx gelöst |
| `src/components/exercises/TypedAnswer.tsx` | DE → SW tippen |
| `src/components/exercises/ClozeSentence.tsx` | Lückensatz mit Kontext |
| `src/components/exercises/AudioQuiz.tsx` | Hören → Bedeutung wählen |
| `src/components/exercises/AnswerFeedback.tsx` | Ergebnis-Karte für alle Eingabemodi |
| `src/components/exercises/useSpeaker.ts` | Ladezustand je Abspiel-Auslöser |
| `src/components/exercises/useAutoFocus.ts` | Fokus ohne Scrollsprung |
| `src/components/settings/ExerciseModesSection.tsx` | Modus-Schalter |
| `src/components/settings/MilestonesSection.tsx` | Meilenstein-Sammelansicht |
| `src/routes/_authenticated/trainer.tsx` | Grammatik-Gym |

**Geändert**
| Datei | Was |
|---|---|
| `src/lib/types.ts` | `SessionModeId`/`TrainerModeId`, `ReviewLogEntry.override` |
| `src/lib/srs/index.ts` | `applyReview(..., meta)` schreibt `override` ins Log |
| `src/lib/store.ts` | `awardXp()` |
| `src/lib/review-log.ts` | `appendTrainerResult()`, `countReviewsOnDay()` filtert Karten-Modi |
| `src/lib/settings.ts` | `enabledModes` auf `SessionModeId` |
| `src/lib/tts.ts` | `loadAudioIndex()` |
| `src/lib/backup.ts` | Backup v3 mit `trainerStats`, Cache-Resets |
| `src/lib/changelog.ts` | Eintrag 0.5.0 |
| `src/routes/_authenticated/review.tsx` | Session-Host + Abschluss-Screen (486 Zeilen ersetzt) |
| `src/routes/_authenticated/index.tsx` | Grammatik-Gym-Karte |
| `src/routes/_authenticated/classes.tsx` | Einstieg in den Trainer |
| `src/routes/_authenticated/account.tsx` | Übungsarten- und Meilenstein-Sektion |
| `src/config/translations.ts` | `T.exercises`, `T.milestones`, `T.trainer`, `T.settings.modes`, `T.review.done.*` |
| `src/styles.css` | `.flip-inner[data-instant]` entfernt (Karten remounten jetzt) |

---

## 5. Verifikation

```bash
npm run test
```
Erwartung: 15 Dateien, 176 Tests grün (Welle 1 hatte 101).

```bash
npx tsc --noEmit
```
Erwartung: keine Ausgabe.

```bash
npx eslint src
```
Erwartung: 0 Fehler, 6 Warnungen (`react-refresh` in `src/components/ui/*`,
shadcn-Bestand). **`npm run lint` bricht ab,** siehe Abschnitt 6.

```bash
npm run build
```

Dev-Server über `preview_start`, nie über Bash.

**Manuell im Browser durchgespielt** (IndexedDB-DB `keyval-store`):

1. `/review` — die Runde mischt Karte / Tippen / Lückensatz; der Modus steht
   rechts über dem Fortschrittsbalken.
2. Lückensatz `___ yako?` mit `Habri` beantwortet → gelbe Karte „Fast — kleine
   Schreibkorrektur", fehlendes `a` in `Habari` unterstrichen, ein „Weiter".
3. Tippen `essen` mit `ndugu` beantwortet → rote Karte, `kula`, „Deine
   Antwort: ndugu", Link „Meine Antwort war auch richtig".
4. Rundenende → Kacheln Treffer / Gefestigt / Streak, „Mo erledigt — 1 von
   4 Tagen", Meilenstein „Mwanzo".
5. `/trainer` — „ich + Perfekt + kula" über Chips zu `nimekula` gebaut;
   Ngeli-Tab: `pesa ___ (schlecht)` → `mbaya`, mit Rücklink auf die Klasse.
6. `/account` — Übungsarten-Schalter, Meilensteine „1 von 12", Changelog 0.5.0.
7. XP nach 2 Reviews + 2 Trainer-Aufgaben = 40, „Karten" unverändert 15
   (Trainer zählt nicht als Review).

---

## 6. Lücken, Workarounds, Schulden

- **`npm run lint` bricht mit `RangeError: Invalid string length` ab,** sobald
  ein `dist/`-Build existiert: `eslint .` linted den Build mit, der
  stylish-Formatter erstickt an der Ausgabemenge. `eslint.config.js` ignoriert
  `dist`, `.output`, `.vinxi` — offenbar greift das nicht für alles.
  **Workaround: `npx eslint src`.** Ursache nicht untersucht.
- **Audio-Modus in der Praxis selten.** `hasAudio` verlangt einen exakten
  Treffer im Manifest (`public/audio/manifest.json`, Schlüssel = getrimmter
  Text). Wörter ohne generierte MP3 bekommen nie den Hör-Modus. Ob die
  Abdeckung reicht, wurde nicht gemessen.
- **Kein Test für `buildSession()` selbst,** nur für die reine
  `assignModes()`. Die asynchrone Hülle (IndexedDB, Manifest-Fetch, Kappung)
  ist ungetestet.
- **`highlightCorrection()` gibt bei Längenänderung durch die Normalisierung
  auf** und markiert dann nichts (siehe Kommentar). Betrifft Ziele mit
  Leerzeichen oder Randsatzzeichen. In der Praxis nicht aufgefallen.
- **Ringpuffer im Review-Log weiterhin ungetestet** (Schuld aus Welle 1).
- **`.claude/launch.json` im Repo ist weiterhin uncommittet** (`vokabel-app`
  → `swahili-pocket`) — die Frage aus Handover 1 ist offen geblieben.
  Zusätzlich liegt jetzt **außerhalb des Repos** eine
  `Swahili-Pocket/.claude/launch.json`, weil `preview_start` im
  Elternverzeichnis sucht; sie ruft `npm --prefix swahili-pocket run dev`.
- **`IMPLEMENTATION-PLAN.md` und `docs/handover-stufe-1.md` sind untracked.**
  Dieses Dokument liegt im selben Ordner. Entscheiden, ob die Planungsdokumente
  ins Repo gehören.
- **Keine CI** (Schuld aus Welle 1).

---

## 7. Git-Stand

- **Stufe-2-Branch:** `feature/welle-2-uebungen`, abgezweigt von `main`
  (`479ecb6`). Ein Commit.
- **Noch nicht gepusht, kein Pull Request.**
- **Uncommittet:** `.claude/launch.json`; untracked: `IMPLEMENTATION-PLAN.md`.

---

## 8. Für Stufe 3

**Einstiegspunkte**

- `src/lib/session.ts` — `buildSession()` ist die einzige Stelle, die eine
  Runde zusammenstellt. Der Retention-Check (W3.5) hängt sich mit
  `{ cards: [...] }` daran, genau wie die Comeback-Runde.
- `src/lib/milestones.ts` — `first-story` liegt schon in der Liste und liefert
  `false`. W3.3 tauscht nur den `check` aus; `MilestoneContext` müsste um die
  gelesenen Geschichten erweitert werden.
- `src/lib/exercises/registry.ts` — ein neuer Session-Modus ist ein Modul plus
  ein Eintrag in `EXERCISE_MODES` und in `EXERCISE_COMPONENTS`
  (`review.tsx`); `SessionModeId` in `types.ts` mitziehen.
- `src/components/exercises/AnswerFeedback.tsx` — fertige Ergebnis-Karte für
  alles mit freier Eingabe. Der Reader (W3.3) kann sie nicht nutzen, der
  Retention-Check schon.
- `src/lib/answer-check.ts` — `checkAnswer()` ist auch die Prüfstelle für die
  Dialog-Auswahl (W3.4), falls dort Freitext dazukommt.
- `src/lib/trainer-stats.ts` — Muster für einen eigenen, kleinen Zählerspeicher
  neben dem Review-Log; `stories:read` und `retention:checks` können das
  genauso machen.

**Fallstricke**

- Neue Felder auf `VocabEntry` oder `UserStats` **immer** über
  `src/lib/migrations.ts` (`DATA_VERSION` hochzählen) — und `backup.ts`
  mitziehen. Neue eigenständige Schlüssel brauchen keine Migration, aber
  einen Eintrag im Backup (dort dann `BACKUP_VERSION` erhöhen).
- `applyReview()` bleibt die einzige Stelle, die Boxen und Fälligkeiten
  schreibt. Der Retention-Check ist ein echtes Review und geht dort durch.
- Wer im Review-Log einen Modus ergänzt, muss prüfen, ob er in `CARD_MODES`
  (`review-log.ts`) gehört — sonst zählt er falsch aufs Tagesziel.
- Tests mit IndexedDB brauchen den `vi.mock("idb-keyval")`-Block **und** die
  `reset*Cache()`-Aufrufe. Neu dazugekommen: `resetTrainerStatsCache()`,
  `resetMilestoneCache()`.
- `npx eslint src` statt `npm run lint`, solange Abschnitt 6 offen ist.
- Dev-Server nur über `preview_start`.

**Fragen an dich**

1. Reicht die Audio-Abdeckung für den Hör-Modus, oder soll `hasAudio` den
   Web-Speech-Fallback doch zulassen?
2. Soll eine Trainer-Sitzung die Streak am Leben halten? Aktuell nicht —
   wer einen Tag lang nur Grammatik übt, verliert sie. Das ist bewusst so
   entschieden, aber es ist eine Wertung, keine Notwendigkeit.
3. Gehören `IMPLEMENTATION-PLAN.md` und die Handover-Dokumente ins Repo?
4. `.claude/launch.json` (Umbenennung) committen?
