/**
 * Deterministischer Validator für Dialog-Glossare (W4.3).
 *
 * Gegenstück zu scripts/lib/story-validate.mjs, mit einem entscheidenden
 * Unterschied: **es gibt keine Bandprüfung.** Eine Geschichte wird für ein Band
 * geschrieben, ein Dialog ist Bestand — sein Wortschatz ist, was er ist. Der
 * Validator stellt hier nur sicher, dass das Glossar den Text vollständig und
 * ohne Überhang beschreibt; die Abdeckung rechnet danach die App aus.
 *
 * Warum ein Glossar überhaupt: ohne Token→Grundform-Abbildung gibt es keine
 * ehrliche Abdeckung. Eine Zahl wie „noch 12 Wörter bis zur Freischaltung" ist
 * nur so viel wert wie die Lemma-Liste dahinter — geraten wäre schlimmer als
 * gar nicht angezeigt.
 *
 * `tokenize` kommt von außen herein (storyTokens aus src/lib/stories.ts), damit
 * Dialog-Ansicht, Reader und beide Validatoren dieselbe Wortgrenze ziehen.
 */

import { STRUCTURE_LEMMAS } from "./story-validate.mjs";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/** Alle Swahili-Zeilen eines Dialogs — die Züge, nicht die Distraktoren. */
export function dialogueLines(dialogue) {
  return (dialogue.turns ?? []).map((t) => t.sw).filter(isNonEmptyString);
}

/** Erlaubte Zahl an Antwortoptionen je Entscheidungspunkt. */
const MIN_CHOICES = 3;
const MAX_CHOICES = 4;

/**
 * Die Entscheidungspunkte eines Dialogs prüfen.
 *
 * Sie liegen als { "<zugIndex>": DialogueChoice[] } neben dem Glossar, nicht
 * mehr an den Zügen in seed.ts. Der Grund ist inhaltlich wie praktisch: Text
 * und Aufgabe sind zwei Dinge, und der Text ist Bestand, während die Aufgaben
 * nachwachsen. Nebeneffekt: die Distraktoren landen nicht im JS-Bündel, sondern
 * werden erst geladen, wenn jemand wirklich mitspielt.
 *
 * Die harten Regeln sichern das ab, was die Rollenspiel-Ansicht voraussetzt:
 * genau eine richtige Antwort, und diese ist **wortgleich** mit dem Zug — sonst
 * spielt die App nach der richtigen Wahl eine andere Zeile vor, als der Nutzer
 * angeklickt hat. Jede falsche Antwort braucht eine Begründung; ein „falsch"
 * ohne Grund ist im Rollenspiel wertlos.
 */
function validateChoices(rawChoices, { dialogue, fail }) {
  const out = {};
  if (rawChoices === undefined) return out;
  if (!rawChoices || typeof rawChoices !== "object" || Array.isArray(rawChoices)) {
    fail('Feld "choices" muss ein Objekt { "<zugIndex>": [...] } sein.');
    return out;
  }

  for (const [key, list] of Object.entries(rawChoices)) {
    const index = Number(key);
    const where = `Entscheidungspunkt an Zug ${key}`;

    if (!Number.isInteger(index) || index < 0 || index >= dialogue.turns.length) {
      fail(`${where}: "${key}" ist kein gültiger Zug-Index (0..${dialogue.turns.length - 1}).`);
      continue;
    }
    if (!Array.isArray(list) || list.length < MIN_CHOICES || list.length > MAX_CHOICES) {
      fail(`${where}: ${Array.isArray(list) ? list.length : 0} Optionen, erlaubt sind ${MIN_CHOICES}–${MAX_CHOICES}.`);
      continue;
    }

    const turn = dialogue.turns[index];
    const correct = list.filter((c) => c?.correct === true);
    if (correct.length !== 1) {
      fail(`${where}: ${correct.length} als richtig markierte Optionen, genau eine ist erlaubt.`);
    } else if (correct[0].sw?.trim() !== turn.sw?.trim()) {
      // Sonst spielt die App nach der Wahl eine andere Zeile vor als die
      // angeklickte — der Fehler fällt beim Testen kaum auf und beim Hören sofort.
      fail(
        `${where}: die richtige Option lautet "${correct[0].sw}", der Zug aber "${turn.sw}". ` +
          `Beide müssen wortgleich sein.`,
      );
    }

    const seen = new Set();
    list.forEach((choice, i) => {
      const at = `${where}, Option ${i + 1}`;
      if (!isNonEmptyString(choice?.sw)) fail(`${at}: kein Swahili-Text.`);
      if (!isNonEmptyString(choice?.de)) fail(`${at}: keine Übersetzung.`);
      if (typeof choice?.sw === "string" && /\d/.test(choice.sw)) {
        fail(`${at}: Ziffern im Swahili-Text (Zahlen ausschreiben).`);
      }
      const key2 = choice?.sw?.trim().toLowerCase();
      if (key2) {
        if (seen.has(key2)) fail(`${at}: "${choice.sw}" steht doppelt zur Wahl.`);
        seen.add(key2);
      }
      // Ein Distraktor ohne Begründung lehrt nichts — der Nutzer erfährt nur,
      // dass er danebenlag, nicht warum.
      if (choice?.correct !== true && !isNonEmptyString(choice?.feedback)) {
        fail(`${at}: falsche Option ohne "feedback".`);
      }
      if (choice?.correct === true && choice?.feedback !== undefined) {
        fail(`${at}: die richtige Option braucht kein "feedback".`);
      }
    });

    out[index] = list.map((c) => ({
      sw: c.sw.trim(),
      de: c.de.trim(),
      correct: c.correct === true,
      ...(c.correct === true ? {} : { feedback: c.feedback.trim() }),
    }));
  }

  return out;
}

/**
 * Glossar und Entscheidungspunkte eines Dialogs prüfen und normalisieren.
 *
 * @param {object} raw       { id, glosses: {...}, choices?: {...} }
 * @param {object} opts
 * @param {object} opts.dialogue  Der Dialog aus seed.ts/dialogues-extra.ts.
 * @param {(text: string) => string[]} opts.tokenize
 * @param {Set<string>} [opts.poolLemmas]  Grundformen aus vocab-pool.json.
 * @returns {{ errors: string[], entry: object | null }}
 */
export function validateDialogueGloss(raw, { dialogue, tokenize, poolLemmas }) {
  const errors = [];
  const fail = (msg) => errors.push(msg);

  if (!raw || typeof raw !== "object") return { errors: ["Kein Objekt."], entry: null };
  if (!isNonEmptyString(raw.id)) fail('Feld "id" fehlt oder ist leer.');
  if (raw.id !== dialogue.id) fail(`Id "${raw.id}" passt nicht zum Dialog "${dialogue.id}".`);
  if (!raw.glosses || typeof raw.glosses !== "object") fail("Kein glosses-Objekt.");
  if (errors.length > 0) return { errors, entry: null };

  // Ziffern verschluckt der Tokenizer stillschweigend — dann stünde im Dialog
  // ein Wort, das niemand antippen kann. Dieselbe Regel wie bei Geschichten,
  // hier aber als Befund über Bestandsdaten: sie zwingt zur Textkorrektur.
  dialogue.turns.forEach((turn, i) => {
    if (typeof turn.sw === "string" && /\d/.test(turn.sw)) {
      fail(`Zug ${i + 1}: Ziffern im Swahili-Text (Zahlen ausschreiben).`);
    }
  });

  const glosses = {};
  for (const [key, value] of Object.entries(raw.glosses)) {
    if (!isNonEmptyString(key)) {
      fail("Leerer Glossar-Schlüssel.");
      continue;
    }
    if (!value || !isNonEmptyString(value.lemma) || !isNonEmptyString(value.de)) {
      fail(`Glossareintrag "${key}" ist unvollständig (lemma/de).`);
      continue;
    }
    const lemma = value.lemma.trim().toLowerCase();
    glosses[key.trim().toLowerCase()] = {
      lemma,
      de: value.de.trim(),
      ...(value.proper === true ? { proper: true } : {}),
      // Abgeleitet, nicht übernommen — dieselbe Liste wie bei den Geschichten.
      ...(STRUCTURE_LEMMAS.has(lemma) ? { structure: true } : {}),
    };
  }

  // 1. Jedes Token jeder Zeile muss im Glossar stehen.
  const used = new Set();
  dialogue.turns.forEach((turn, i) => {
    for (const token of tokenize(turn.sw ?? "")) {
      used.add(token);
      if (!glosses[token]) fail(`Zug ${i + 1}: Token "${token}" fehlt im Glossar.`);
    }
  });

  // 2. Kein Eintrag ohne Vorkommen — sonst verfälscht das Glossar die Abdeckung.
  for (const key of Object.keys(glosses)) {
    if (!used.has(key)) fail(`Glossareintrag "${key}" kommt im Dialog nicht vor.`);
  }

  const choices = validateChoices(raw.choices, { dialogue, fail });

  if (errors.length > 0) return { errors, entry: null };

  // Eigennamen und geschlossene Wortklassen zählen nicht: ein Ortsname ist
  // keine Vokabel, und `ya` lernt man im Grammatik-Gym.
  const lemmas = new Set();
  for (const gloss of Object.values(glosses)) {
    if (gloss.proper || gloss.structure) continue;
    lemmas.add(gloss.lemma);
  }

  // Grundformen, die der Vokabelpool nicht kennt. Kein Fehler — ein Dialog darf
  // Wörter enthalten, die keine Karteikarte sind. Aber ein Signal: solange ein
  // Lemma nicht auf eine Pool-Schreibweise trifft, kann die Abdeckung es nie
  // als „gelernt" verbuchen, und der häufigste Grund dafür ist ein Tippfehler
  // oder eine unübliche Grundform, kein echtes Loch im Pool.
  const unknownLemmas = poolLemmas
    ? [...lemmas].filter((l) => !poolLemmas.has(l)).sort()
    : [];

  return {
    errors: [],
    entry: { id: dialogue.id, lemmas: [...lemmas].sort(), glosses, choices },
    unknownLemmas,
  };
}

/**
 * Listen-Index aus geprüften Glossaren bauen.
 *
 * `hasAudio` wird aus dem Audio-Manifest abgeleitet statt in den Daten
 * gepflegt: gepflegte Felder driften, ein Blick ins Manifest kann es nicht.
 * Ein Dialog gilt nur als vertont, wenn **jede** Zeile eine Aufnahme hat —
 * ein halb vertonter Dialog fällt mittendrin auf die Web-Speech-Stimme
 * zurück, und der Wechsel ist deutlicher hörbar als durchgehend synthetisch.
 */
export function buildDialogueIndex(entries, { dialogues, tokenize, manifest = {} }) {
  const byId = new Map(entries.map((e) => [e.id, e]));

  return {
    version: 1,
    dialogues: dialogues
      .filter((d) => byId.has(d.id))
      .map((d) => {
        const lines = dialogueLines(d);
        const entry = byId.get(d.id);
        const choicePoints = Object.keys(entry.choices ?? {});
        return {
          id: d.id,
          title: d.title,
          titleDe: d.titleDe ?? null,
          level: d.level ?? null,
          lemmas: entry.lemmas,
          turnCount: d.turns.length,
          wordCount: lines.reduce((n, sw) => n + tokenize(sw).length, 0),
          choicePoints: choicePoints.length,
          // Wer im Rollenspiel zur Wahl steht — die Liste bietet nur diese
          // Rollen an, sonst wäre „Mitspielen" dasselbe wie Zuhören.
          playableSpeakers: [
            ...new Set(choicePoints.map((i) => d.turns[Number(i)].speaker)),
          ].sort(),
          hasAudio: lines.length > 0 && lines.every((sw) => !!manifest[sw.trim()]),
        };
      }),
  };
}
