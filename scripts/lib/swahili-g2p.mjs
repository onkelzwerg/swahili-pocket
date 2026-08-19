/**
 * Swahili-Orthografie → IPA (Graphem-zu-Phonem).
 *
 * Quelle der Regeln ist `01_Kiswahili_Aussprache.pdf` (Standardswahili).
 * Zweck ist die ElevenLabs-Aussprachesteuerung: `eleven_v3` akzeptiert
 * IPA-Phoneme, aber nur, wenn wir sie liefern — von sich aus liest das Modell
 * Swahili-Text mit der Lautzuordnung einer anderen Sprache und legt die
 * Betonung falsch.
 *
 * Warum ein Regelwerk und keine gepflegte Wortliste: Swahili ist nahezu
 * perfekt phonemisch verschriftet. Jeder Buchstabe steht für genau einen Laut,
 * die Silbenstruktur ist streng CV, und die Betonung ist positionsgebunden
 * statt lexikalisch. Damit ist die Aussprache aus der Schreibung berechenbar —
 * eine Wortliste wäre 3.000 Einträge, die dieselbe Information redundant und
 * pflegebedürftig wiederholen. Ausnahmen gibt es genau eine (s. STRESS_EXCEPTIONS).
 *
 * Zwei Stellen, an denen das PDF unscharf ist, und wie hier entschieden wurde:
 *
 *   1. `ng` am Wortanfang. Das PDF beschreibt `nguo`/`ngoma` als getrennt
 *      gesprochenes „n" + „g" (wie „angezogen"), medial dagegen als [ŋg].
 *      Hier gilt durchgängig [ŋg] — das ist die übliche Beschreibung des
 *      Standardswahili, und eine Sonderregel nach Wortposition brächte einen
 *      Unterschied, den die Lernenden nicht hören, aber im Code jeder Leser
 *      erklärt bekommen müsste.
 *
 *   2. `mmoja`. Das PDF nennt „Betonung auf dem ersten m" und widerspricht
 *      damit der Vorletzte-Silbe-Regel, die es selbst aufstellt (m̩-mo-ja →
 *      „mo"). Als Einzelausnahme eingetragen, die Regel bleibt sonst unberührt.
 *
 * Nicht im PDF, hier ergänzt: `ny` [ɲ] (nyama, nyumba) fehlt in dessen
 * Konsonantenliste schlicht. Ohne die Regel zerfiele es in [n] + [y] = [nj].
 */

/** Digraphen zuerst und längster Treffer zuerst — `ng'` vor `ng` vor `n`. */
const DIGRAPHS = [
  ["ng'", "ŋ"], // nasales ŋ ohne Plosiv (ng'ombe)
  ["ch", "tʃ"],
  ["dh", "ð"],
  ["th", "θ"],
  ["gh", "ɣ"],
  ["kh", "x"],
  ["sh", "ʃ"],
  ["ng", "ŋg"],
  ["ny", "ɲ"],
];

/** Nur die Buchstaben, deren Lautwert vom deutschen Lesen abweicht. */
const CONSONANTS = {
  j: "dʒ", // wie engl. „Journalist", nicht wie deutsches j
  y: "j", // wie deutsches j
  v: "v", // wie deutsches w
  w: "w", // wie engl. w
  s: "s", // immer stimmlos
  z: "z", // immer stimmhaft
};

/** Kurz und offen — das ist der hörbarste Unterschied zum Deutschen. */
const VOWELS = { a: "a", e: "ɛ", i: "ɪ", o: "ɔ", u: "ʊ" };

/**
 * Swahili kennt genau drei Diphthonge. Jede andere Vokalfolge ist Hiat, also
 * zwei getrennte Silben — `sijui` ist si-ju-i, nicht si-jui.
 */
const DIPHTHONGS = { ai: "aɪ̯", ei: "ɛɪ̯", au: "aʊ̯" };

/**
 * Pränasalierung: Nasal + homorganer Plosiv bilden **einen** Silbenanlaut,
 * kein eigenes Silbenzentrum. Homorgan heißt gleiche Artikulationsstelle:
 * m+p/b (labial), n+t/d/s/z (alveolar), n+tʃ/dʒ (palatal), ŋ+g/k (velar).
 *
 * Das ist die Trennlinie zum silbischen Nasal, und sie entscheidet die
 * Betonung: `ndizi` ist ndi-zi (2 Silben, /ˈndɪzɪ/), `mkate` dagegen m̩-ka-te
 * (3 Silben, /m̩ˈkatɛ/), weil m+k nicht homorgan ist. Ohne die Unterscheidung
 * läge die Betonung reihenweise eine Silbe zu weit vorn.
 */
const HOMORGANIC = {
  m: ["b", "p", "v"],
  n: ["d", "t", "z", "s", "dʒ", "tʃ"],
  ŋ: ["g", "k"],
};

/**
 * Betonung abweichend von der Vorletzte-Silbe-Regel, als Silbenindex.
 * Schlüssel ist die kleingeschriebene Schreibweise.
 */
export const STRESS_EXCEPTIONS = new Map([["mmoja", 0]]);

/** Ein Segment ist ein Laut plus die Eigenschaften, die die Silbenbildung braucht. */
function segment(word) {
  const out = [];
  let i = 0;
  while (i < word.length) {
    const digraph = DIGRAPHS.find((d) => word.startsWith(d[0], i));
    if (digraph) {
      out.push({ ipa: digraph[1], vowel: false });
      i += digraph[0].length;
      continue;
    }

    const char = word[i];
    const pair = word.slice(i, i + 2);

    if (DIPHTHONGS[pair]) {
      out.push({ ipa: DIPHTHONGS[pair], vowel: true });
      i += 2;
      continue;
    }

    if (VOWELS[char]) {
      // Doppelvokal am Wortende = Länge (und zieht die Betonung auf sich),
      // sonst zwei eigenständige Silben. „Alles was geschrieben wird, wird
      // auch ausgesprochen" — kaanga ist ka-a-nga, saa dagegen /saː/.
      if (word[i + 1] === char) {
        if (i + 2 >= word.length) {
          out.push({ ipa: VOWELS[char] + "ː", vowel: true, finalLong: true });
        } else {
          out.push({ ipa: VOWELS[char], vowel: true });
          out.push({ ipa: VOWELS[char], vowel: true });
        }
        i += 2;
        continue;
      }
      out.push({ ipa: VOWELS[char], vowel: true });
      i += 1;
      continue;
    }

    // Doppelkonsonanten bleiben zwei Segmente (nne, mmoja) — sie werden
    // einzeln gesprochen, und der erste trägt bei nne die Betonung.
    out.push({ ipa: CONSONANTS[char] ?? char, vowel: false });
    i += 1;
  }
  return out;
}

/** Segmente → Silben. Swahili ist streng CV, plus silbische Nasale. */
function syllabify(segments) {
  const syllables = [];
  let current = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    current.push(seg);

    if (seg.vowel) {
      syllables.push(current);
      current = [];
      continue;
    }

    const next = segments[i + 1];
    const prenasalized = next && (HOMORGANIC[seg.ipa] ?? []).includes(next.ipa);
    const isNasal = seg.ipa === "m" || seg.ipa === "n";
    if (isNasal && !prenasalized && current.length === 1 && next && !next.vowel) {
      seg.ipa += "̩"; // COMBINING VERTICAL LINE BELOW = silbisch
      syllables.push(current);
      current = [];
    }
  }

  // Auslautende Konsonanten gibt es im Swahili praktisch nicht; falls doch
  // (Lehnwörter), an die letzte Silbe hängen statt eine leere zu erzeugen.
  if (current.length) {
    if (syllables.length) syllables[syllables.length - 1].push(...current);
    else syllables.push(current);
  }
  return syllables;
}

/**
 * Wort → IPA-Transkription mit Betonungszeichen, ohne umschließende Schrägstriche.
 * Erwartet ein einzelnes Wort ohne Satzzeichen; Groß-/Kleinschreibung egal.
 */
export function toIPA(word) {
  const normalized = word.toLowerCase().trim();
  if (!normalized) return "";

  const syllables = syllabify(segment(normalized));
  if (!syllables.length) return "";

  // Einsilber bekommen kein Betonungszeichen — es trüge keine Information.
  if (syllables.length === 1) {
    return syllables[0].map((s) => s.ipa).join("");
  }

  const exception = STRESS_EXCEPTIONS.get(normalized);
  const endsLong = syllables[syllables.length - 1].some((s) => s.finalLong);
  const stressed = exception ?? (endsLong ? syllables.length - 1 : syllables.length - 2);

  return syllables
    .map((syl, n) => (n === stressed ? "ˈ" : "") + syl.map((s) => s.ipa).join(""))
    .join("");
}

/**
 * Prüffälle: jedes Beispielwort aus dem PDF mit der dort genannten Aussprache,
 * plus Kontrollwörter für die Regeln, die das PDF nur beschreibt statt sie
 * vorzuführen (Pränasalierung, silbischer Nasal, ny).
 */
export const PDF_EXAMPLES = [
  // Betonung: vorletzte Silbe, verschiebt sich beim Anhängen von Nachsilben
  { word: "Ahsante", ipa: "aˈhsantɛ" },
  { word: "Ahsanteni", ipa: "ahsaˈntɛnɪ" },
  { word: "Karibu", ipa: "kaˈrɪbʊ" },
  { word: "Karibuni", ipa: "karɪˈbʊnɪ" },
  // Hiat: „u" und „i" einzeln, Betonung dadurch auf dem „u"
  { word: "sijui", ipa: "sɪˈdʒʊɪ" },
  // Doppelbuchstaben werden einzeln gesprochen
  { word: "nne", ipa: "ˈn̩nɛ" },
  { word: "mmoja", ipa: "ˈm̩mɔdʒa" },
  { word: "kaanga", ipa: "kaˈaŋga" },
  { word: "maandamano", ipa: "maandaˈmanɔ" },
  { word: "kiislamu", ipa: "kɪɪˈslamʊ" },
  { word: "kiingereza", ipa: "kɪɪŋgɛˈrɛza" },
  { word: "maandazi", ipa: "maaˈndazɪ" },
  // Doppelvokal am Wortende: Länge, Betonung ausnahmsweise hinten
  { word: "kaa", ipa: "kaː" },
  { word: "juu", ipa: "dʒʊː" },
  { word: "kichaa", ipa: "kɪˈtʃaː" },
  { word: "zaa", ipa: "zaː" },
  { word: "saa", ipa: "saː" },
  { word: "Shikamoo", ipa: "ʃɪkaˈmɔː" },
  { word: "sanaa", ipa: "saˈnaː" },
  // ng: hier durchgängig [ŋg] (s. Kopfkommentar)
  { word: "nguo", ipa: "ˈŋgʊɔ" },
  { word: "ngoja", ipa: "ˈŋgɔdʒa" },
  { word: "ngoma", ipa: "ˈŋgɔma" },
  { word: "ningependa", ipa: "nɪŋgɛˈpɛnda" },
  // Kontrollwörter: pränasaliert vs. silbischer Nasal, ny, ch, ng'
  { word: "asante", ipa: "aˈsantɛ" },
  { word: "ndizi", ipa: "ˈndɪzɪ" },
  { word: "mtu", ipa: "ˈm̩tʊ" },
  { word: "mkate", ipa: "m̩ˈkatɛ" },
  { word: "nyumba", ipa: "ˈɲʊmba" },
  { word: "chakula", ipa: "tʃaˈkʊla" },
  { word: "habari", ipa: "haˈbarɪ" },
  { word: "ng'ombe", ipa: "ˈŋɔmbɛ" },
];

/** Selbsttest gegen PDF_EXAMPLES. Gibt die Liste der Abweichungen zurück. */
export function checkExamples() {
  return PDF_EXAMPLES.filter((e) => toIPA(e.word) !== e.ipa).map((e) => ({
    ...e,
    got: toIPA(e.word),
  }));
}
