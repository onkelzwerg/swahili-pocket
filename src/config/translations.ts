/**
 * Zentrale Sammlung aller sichtbaren UI-Strings der User-App.
 *
 * Sprache: Deutsch. Swahili-Begriffe (Karibu, Habari, Ngeli, Msamiati, …) sind
 * bewusst Teil der App-Sprache und stehen ebenfalls hier.
 *
 * Konvention:
 *  - Statische Strings: einfache Properties.
 *  - Strings mit dynamischen Werten: Funktionen mit typisierten Argumenten.
 *  - Gruppierung nach Feature/Bereich (nav, common, review, lexicon, …).
 *
 * Nicht enthalten (bewusst):
 *  - Admin-UI (`routes/_authenticated/admin.*`, `components/admin/*`).
 *  - AI-System-Prompts (`lib/ai/*`).
 *  - Server-/Backend-Fehlertexte (`*.functions.ts`, `*.server.ts`).
 *  - shadcn-Primitives unter `components/ui/*`.
 *  - Werte, die schon über `APP_CONFIG` laufen (appName, targetLanguage,
 *    nativeLanguage).
 */

export const T = {
  common: {
    save: "Speichern",
    saving: "Speichern…",
    cancel: "Abbrechen",
    back: "Zurück",
    close: "Schließen",
    delete: "Löschen",
    loading: "Lädt…",
    loadingShort: "Lade…",
    retry: "Nochmal versuchen",
    or: "oder",
    pleaseWait: "Bitte warten…",
    selectPlaceholder: "– wählen –",
  },

  nav: {
    home: "Home",
    /** Seit W3.6 heißt der Tab „Wörter" — „Lexikon" bleibt der Seitentitel. */
    lexicon: "Wörter",
    review: "Lernen",
    library: "Bibliothek",
    dialogues: "Dialoge",
    classes: "Ngeli",
    account: "Mehr",
    admin: "Admin",
    offlineBanner: "Offline — alles funktioniert weiter, deine Daten bleiben auf dem Gerät",
  },

  root: {
    notFound: {
      headline: "Hapana! Seite nicht gefunden",
      body: "Diese Seite existiert nicht. Zurück zum Lernen?",
      cta: "Karibu nyumbani",
    },
    error: {
      headline: "Etwas ging schief",
      chunkBody: "Eine neue Version ist verfügbar. Wir laden die App neu…",
      chunkCta: "Jetzt neu laden",
    },
    meta: {
      title: "Vokabelhub — Lerne Swahili spielerisch",
      description:
        "Mobile Swahili-Lern-App mit Vokabeltrainer (Leitner), Dialogen und Grammatik- und Dialog-Modul.",
    },
  },

  login: {
    metaTitleSuffix: "Anmelden",
    metaDescription: "Melde dich an, um geräteübergreifend zu lernen.",
    headline: "Karibu! 🌍",
    subline: "Melde dich an, um deine Vokabeln überall zu lernen.",
    tabs: { signin: "Anmelden", signup: "Registrieren" },
    email: "E-Mail",
    password: "Passwort",
    signinCta: "Anmelden",
    signupCta: "Konto erstellen",
    googleCta: "Mit Google fortfahren",
    appleCta: "Mit Apple fortfahren",
    backHome: "Zurück",
    errors: {
      generic: "Fehler beim Anmelden",
      oauthFailed: (provider: "google" | "apple") =>
        `${provider === "google" ? "Google" : "Apple"}-Anmeldung fehlgeschlagen`,
    },
  },

  home: {
    metaTitleSuffix: "Dashboard",
    metaDescription:
      "Dein täglicher Swahili-Fortschritt: fällige Karten, Streak und Phrase des Tages.",
    greetings: {
      morning: { sw: "Habari za asubuhi", de: "Guten Morgen" },
      day: { sw: "Habari za mchana", de: "Guten Tag" },
      evening: { sw: "Habari za jioni", de: "Guten Abend" },
    },
    dueToday: "Heute fällig",
    cards: "Karten",
    practiceNow: "Jetzt üben",
    allDone: "Alles erledigt 🎉",
    stats: {
      streak: "Streak",
      words: "Wörter",
      mastered: "Gemeistert",
    },
    level: {
      eyebrow: (name: string) => `Sprachlevel ${name}`,
      progress: (inLevel: number, total: number) => `${inLevel}/${total} Wörter`,
      total: (known: number) => `${known} Wörter`,
      next: (remaining: number, name: string, label: string) =>
        `Noch ${Math.max(0, remaining)} Wörter bis ${name} · ${label}`,
      matured: (matured: number, total: number) => `${matured} gefestigt · ${total} Karten gesamt`,
      infoAria: "Was heißt gefestigt?",
      infoTitle: "Gefestigte Wörter",
      infoBody:
        "Ein Wort gilt als gefestigt, wenn du es nach mindestens einer Woche Pause noch abrufen konntest. Neue Karten hinzuzufügen erhöht dein Level deshalb nicht — sie erst zu behalten, schon.",
    },
    week: {
      eyebrow: "Wochenziel",
      progress: (done: number, goal: number) => `${done} von ${goal} Tagen`,
      reached: (goal: number) => `${goal} von ${goal} Tagen ✓`,
      dayLabels: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
      freezes: (n: number) => `${n} Streak-Joker`,
    },
    goal: {
      progress: (done: number, goal: number) => `${done} / ${goal} Karten heute`,
      reached: "Tagesziel erreicht 🎉",
    },
    comeback: {
      title: "Karibu tena! 🌴",
      body: (n: number) => `${n} Wörter zum Auffrischen — kein Druck, einfach weitermachen.`,
      cta: "Auffrischen",
    },
    phrase: {
      eyebrow: "Methali ya leo · Phrase des Tages",
    },
  },

  review: {
    metaTitleSuffix: "Üben",
    metaDescription: "Karteikarten-Training nach dem Leitner-System für deine Swahili-Vokabeln.",
    progress: (idx: number, total: number) => `${idx} / ${total}`,
    box: (n: number) => `Box ${n}`,
    flipHint: "Tippen zum Umdrehen",
    translationLabel: "Übersetzung",
    howDidYouKnow: "Wie hast du es gewusst?",
    wrong: "Falsch",
    correct: "Richtig",
    monosyllabic: "einsilbig",
    swipeHintCorrect: "Gut →",
    swipeHintWrong: "← Nochmal",
    grades: {
      1: "Nochmal",
      2: "Schwer",
      3: "Gut",
      4: "Einfach",
      /** Erklärt die vier Stufen einmal unter den Buttons. */
      hint: "Die Zeit darunter ist der nächste Abstand.",
    },
    goalProgress: (done: number, goal: number) => `${done} / ${goal} Karten heute`,
    empty: {
      title: "Hakuna kazi leo!",
      subtitle: "Keine Karten fällig. Hol dir neue Vokabeln aus dem Pool, um weiter zu üben.",
      cta: "Lernkarten aus dem Pool hinzufügen",
    },
    done: {
      headline: "Vizuri sana!",
      summary: (correct: number, total: number, streak: number) =>
        `${correct} von ${total} richtig · Streak: ${streak} 🔥`,
      back: "Zur Übersicht",
      /** Trefferquote der Runde. */
      accuracy: (correct: number, total: number) => `${correct}/${total} richtig`,
      accuracyLabel: "Treffer",
      /** Der eigentliche Erfolg — prominenter als XP. */
      matured: (n: number) =>
        n === 1
          ? "1 Wort sitzt jetzt seit über einer Woche"
          : `${n} Wörter sitzen jetzt seit über einer Woche`,
      maturedLabel: "Gefestigt",
      streakLabel: "Streak",
      weekStatus: (day: string, done: number, goal: number) =>
        `${day} erledigt — ${done} von ${goal} Tagen`,
      weekReached: (goal: number) => `Wochenziel erreicht — ${goal} von ${goal} Tagen ✓`,
      again: "Weiter üben",
    },
  },

  exercises: {
    /** Kurzlabels für den Modus-Hinweis über der Aufgabe. */
    modes: {
      flip: "Karte",
      typed: "Tippen",
      audio: "Hören",
      cloze: "Lückensatz",
    },
    typed: {
      prompt: "Wie heißt das auf Swahili?",
      placeholder: "Antwort tippen…",
      check: "Prüfen",
      dontKnow: "Weiß nicht",
    },
    cloze: {
      prompt: "Welches Wort fehlt?",
      translationLabel: "Bedeutung des Satzes",
      playSentence: "Satz anhören",
    },
    audio: {
      prompt: "Was hast du gehört?",
      replay: "Nochmal hören",
      replaySlow: "Langsam wiederholen",
      listenAria: "Wort abspielen",
    },
    feedback: {
      exact: "Sawa! ✓",
      typo: "Fast — kleine Schreibkorrektur:",
      wrong: "Nicht ganz.",
      yourAnswer: (answer: string) => `Deine Antwort: ${answer}`,
      noAnswer: "Keine Antwort",
      /** Escape-Hatch für Übersetzungen, die die Datenbank nicht kennt. */
      override: "Meine Antwort war auch richtig",
      overridden: "Als richtig gewertet ✓",
      next: "Weiter",
      howEasy: "Wie leicht fiel es dir?",
    },
  },

  /**
   * Meilensteine (W2.8). Bewusst an Können geknüpft, nicht an Fleiß —
   * die Texte sollen etwas über die Sprache aussagen, nicht über Disziplin.
   */
  milestones: {
    heading: "Meilensteine",
    hint: "Erreicht, wenn du etwas kannst — nicht, wenn du oft genug da warst.",
    locked: "Noch nicht erreicht",
    achievedOn: (date: string) => `Erreicht am ${date}`,
    count: (done: number, total: number) => `${done} von ${total}`,
    unlockedHeadline: "Meilenstein erreicht!",
    firstSession: {
      title: "Mwanzo",
      description: "Deine erste Übungsrunde ist durch.",
    },
    sevenDays: {
      title: "Sieben Tage",
      description: "An sieben verschiedenen Tagen gelernt.",
    },
    firstWeekGoal: {
      title: "Wochenziel",
      description: "Zum ersten Mal dein selbstgesetztes Wochenziel erreicht.",
    },
    matured50: {
      title: "50 gefestigt",
      description: "50 Wörter nach mindestens einer Woche Pause noch gewusst.",
    },
    matured150: {
      title: "150 gefestigt",
      description: "150 gefestigte Wörter — Alltagswortschatz.",
    },
    matured350: {
      title: "350 gefestigt",
      description: "350 gefestigte Wörter — ein tragfähiger Grundwortschatz.",
    },
    typedPerfect: {
      title: "Fehlerfrei getippt",
      description: "Eine Runde mit mindestens fünf getippten Wörtern ohne Fehler.",
    },
    audioSession: {
      title: "Gutes Ohr",
      description: "25 Wörter allein am Klang erkannt.",
    },
    verb100: {
      title: "100 Verbformen",
      description: "100 Verbformen im Trainer selbst gebaut.",
    },
    ngeliMaster: {
      title: "Ngeli sitzt",
      description: "Jede geübte Nomenklasse mindestens zehnmal richtig.",
    },
    longRecall: {
      title: "Langzeitgedächtnis",
      description: "Ein Wort nach über zwei Monaten Pause noch abgerufen.",
    },
    firstStory: {
      title: "Erste Geschichte",
      description: "Eine ganze Geschichte auf Swahili gelesen.",
    },
    storyUnaided: {
      title: "Ohne Hilfe gelesen",
      description: "Eine Geschichte durchgelesen, ohne die Übersetzung einzublenden.",
    },
    retentionKept: {
      title: "Es bleibt",
      description: "Beim Langzeit-Check mindestens 80 % nach über zwei Monaten gewusst.",
    },
    dialoguePlayed: {
      title: "Mitgeredet",
      description: "Einen Dialog mitgespielt und dabei nichts falsch beantwortet.",
    },
    dialoguesUnlocked: {
      title: "Zehn Dialoge offen",
      description: "Zehn Dialoge freigeschaltet — von jedem verstehst du 95 % der Wörter.",
    },
    dialoguesPerfect: {
      title: "Gesprächig",
      description: "Fünf verschiedene Dialoge fehlerfrei mitgespielt.",
    },
  },

  trainer: {
    metaTitle: "Grammatik-Gym — Swahili Pocket",
    metaDescription:
      "Verbformen, Ngeli-Kongruenz und ganze Sätze üben — Aufgaben aus deinem eigenen Wortschatz.",
    eyebrow: "Mazoezi ya sarufi",
    title: "Grammatik-Gym",
    subtitle: "Bausteine statt Vokabeln — hier übst du, Formen selbst zu bilden.",
    homeCta: "Grammatik üben",
    tabs: { verb: "Verbformen", ngeli: "Ngeli", sentence: "Sätze" },
    difficulty: { chips: "Bausteine", typing: "Frei tippen" },
    verb: {
      prompt: (subject: string, tense: string, stem: string) => `${subject} + ${tense} + ${stem}`,
      hint: "Setz die Form zusammen.",
      negated: "verneint",
      monosyllabic: "Einsilbiges Verb — das ku- bleibt.",
      /** Verneint übernimmt der Marker (-ku-, -ja-) die Betonung: hamjala, nicht hamjakula. */
      monosyllabicNegated: "Einsilbiges Verb — hier ersetzt der Marker das ku-.",
      why: (tense: string, negated: boolean) =>
        negated ? `Wie verneint man ${tense}?` : `${tense} nachlesen`,
    },
    ngeli: {
      prompt: (noun: string, cue: string, tail: string) =>
        `${noun} ___${tail ? ` ${tail}` : ""} (${cue})`,
      /** Überschrift der Aufgabe — sagt, welche Konkordanz gefragt ist. */
      variants: {
        adjective: "Welche Adjektivform passt?",
        possessive: "Welches Possessiv passt?",
        demonstrative: "Welches Demonstrativ passt?",
        genitive: "Welche Genitivform passt?",
      },
      why: (nounClass: string) => `Warum ${nounClass}? Klasse ansehen`,
    },
    sentence: {
      hint: "Setz den ganzen Satz in die richtige Form.",
      /** Die deutsche Vorgabe: Nomen · Adjektiv · Verb, plus Numerus und Zeit. */
      prompt: (noun: string, adjective: string, verb: string) => `${noun} · ${adjective} · ${verb}`,
      numerus: { sg: "Singular", pl: "Plural" },
      /** Überschrift je Lücke, damit klar ist, was gerade gewählt wird. */
      slots: { noun: "Nomen", adjective: "Adjektiv", verb: "Verb" },
      /** Platzhalter einer noch leeren Lücke. */
      blank: "___",
      why: (nounClass: string) => `Kongruenz von ${nounClass} nachlesen`,
    },
    check: "Prüfen",
    next: "Nächste Aufgabe",
    clear: "Zurücksetzen",
    correct: "Sawa! ✓",
    wrong: (answer: string) => `Richtig wäre: ${answer}`,
    run: (n: number) => `${n} richtig in Folge`,
    typingUnlocked: "Fünf am Stück richtig — probier es frei getippt.",
    empty: {
      verb: "Noch keine Verben in deinen Lernkarten. Nimm ein paar aus dem Lexikon dazu.",
      ngeli: "Noch keine Nomen mit Nomenklasse in deinen Lernkarten.",
      sentence:
        "Für ganze Sätze fehlt noch etwas: ein Nomen der Klassen M-/Wa-, M-/Mi-, Ki-/Vi- oder Ji-/Ma- und ein Verb, das ohne Objekt stehen kann — fallen, schlafen, ankommen, bleiben.",
      cta: "Zum Lexikon",
    },
    stats: (verbs: number, ngeli: number, sentences: number, best: number) =>
      `${verbs} Verbformen · ${ngeli} Ngeli · ${sentences} ${sentences === 1 ? "Satz" : "Sätze"} · beste Serie ${best}`,
  },

  lexicon: {
    metaTitleSuffix: "Lexikon",
    metaDescription:
      "Durchsuche den geprüften Swahili-Vokabelpool und übernimm Wörter in deine persönlichen Lernkarten.",
    eyebrow: "Msamiati",
    title: "Lexikon",
    newCta: "Eigene Vokabel",
    tabs: {
      pool: "Lexikon",
      cards: "Lernkarten",
    },
    filters: {
      allPos: "Alle Wortarten",
      allNgeli: "Alle Ngeli",
      allBoxes: "Alle Boxen",
      box: (n: number, count: number) => `Box ${n} · ${count}`,
      allSources: "Alle Quellen",
      pool: "Pool",
      own: "Eigene",
    },
    cards: {
      searchPlaceholder: "Suche in Karten…",
      count: (n: number) => `${n} Karten`,
      ownBadge: "Eigene",
      boxBadge: (n: number) => `Box ${n}`,
      monosyllabic: "einsilbig",
      deleteAria: "Löschen",
      empty: "Noch keine Karten.",
      dueNow: "fällig",
      dueTomorrow: "morgen",
      dueInDays: (n: number) => `in ${n} Tagen`,
    },
    pool: {
      searchPlaceholder: (target: string, native: string) => `Suche ${target} oder ${native}…`,
      totalInPool: (n: number) => `${n} Vokabeln im Pool`,
      addedToast: "In Lernkarten übernommen",
      alreadyInCards: "Bereits in deinen Lernkarten",
      addError: "Konnte nicht hinzufügen",
      alreadyInCardsAria: "Bereits in Karten",
      addToCardsAria: "Zu Lernkarten hinzufügen",
      inCards: "In Karten",
      addAsCard: "Karte",
      empty: "Keine Vokabeln gefunden.",
      loadMore: (loaded: number, total: number) => `Mehr laden (${loaded}/${total})`,
    },
  },

  newWord: {
    metaTitleSuffix: "Neues Wort",
    metaDescription: "Füge ein neues Swahili-Wort zu deinem persönlichen Lexikon hinzu.",
    title: "Neues Wort",
    subtitle: "Erweitere deinen msamiati.",
    partOfSpeech: "Wortart",
    nounClass: "Ngeli (Nominalklasse)",
    example: (n: number) => `Beispiel ${n}`,
    examplePlaceholderTarget: (target: string) => `${target}-Satz`,
    examplePlaceholderNative: "Deutsche Übersetzung",
    saveCta: "Speichern",
  },

  vocabGen: {
    eyebrow: "Lernkarten",
    title: "Vokabeln aus dem Pool hinzufügen",
    modes: {
      topic: "Thema",
      wordType: "Wortart",
      auto: "Auto",
    },
    topicLabel: "Thema",
    topicPlaceholder: "z.B. Küche, Reisen, Familie…",
    posLabel: "Wortart",
    ngeliLabel: "Nomenklasse (Ngeli)",
    autoHint:
      "Es werden passende Vokabeln vorgeschlagen, die deinen bisherigen Lernstand sinnvoll erweitern.",
    count: (n: number) => `Anzahl: ${n}`,
    searching: "Suche…",
    loadSuggestions: "Vorschläge laden",
    discard: "Verwerfen",
    saveCount: (n: number) => `Speichern (${n})`,
    selectionHint: (selected: number, total: number) =>
      `${selected} von ${total} ausgewählt. Tippe zum An-/Abwählen.`,
    strictHint: (strict: number, total: number, mode: "topic" | "wordType" | "auto") =>
      `Nur ${strict} von ${total} Vorschlägen passen genau zu deiner Auswahl (${
        mode === "topic" ? "Thema" : mode === "wordType" ? "Wortart" : "Auto"
      }). Die übrigen sind weitere Vokabeln aus dem Pool, damit du auf ${total} Karten kommst.`,
    toasts: {
      emptyPool: "Keine passenden Vokabeln im Pool gefunden.",
      searchFailed: "Suche fehlgeschlagen",
      noneSelected: "Keine Vokabeln ausgewählt",
      saved: (n: number) => `${n} Vokabeln gespeichert`,
      saveFailed: "Speichern fehlgeschlagen",
    },
  },

  dialogueGen: {
    eyebrow: "Dialoge",
    title: "Dialog hinzufügen",
    modes: { new: "Neuer Dialog", extend: "Bestehenden erweitern" },
    topicLabel: "Thema",
    topicPlaceholder: "z.B. Beim Arzt, Flughafen, Wohnungssuche…",
    levelLabel: "Niveau",
    levels: { beginner: "Anfänger", intermediate: "Fortgeschritten" },
    speakersLabel: "Sprecher",
    speakers: { two: "2 Personen (A/B)", three: "3 Personen (A/B/C)" },
    selectExisting: "Dialog auswählen",
    existingOption: (emoji: string, titleDe: string, lines: number) =>
      `${emoji} ${titleDe} (${lines} Zeilen)`,
    linesLabel: (mode: "new" | "extend", n: number) =>
      `${mode === "new" ? "Zeilen" : "Zusätzliche Zeilen"}: ${n}`,
    searching: "Suche…",
    loadCta: "Dialog laden",
    again: "Nochmal",
    save: "Speichern",
    voiceFallback: "Stimme",
    toasts: {
      mustSelect: "Bitte Dialog auswählen",
      genFailed: "Generierung fehlgeschlagen",
      noResult: "Kein Ergebnis",
      saved: "Dialog gespeichert",
      saveFailed: "Speichern fehlgeschlagen",
    },
  },

  dialogues: {
    metaTitle: "Dialoge — Swahili Pocket",
    metaDescription:
      "Alltagsdialoge auf Swahili: Begrüßung, Markt, Restaurant und mehr — mit Audio.",
    eyebrow: "Mazungumzo",
    title: "Dialoge",
    /** Dieselbe Kernschleife wie bei den Geschichten, in einem Satz (W4.4). */
    intro:
      "Freigeschaltet wird, was du zu mindestens 95 % verstehst. Jedes neue Wort öffnet weitere Dialoge.",
    /** Hinweis über dem Dialogtext — die Wörter sind antippbar (W4.4). */
    readerHint: "Tippe ein Wort an, um es nachzuschlagen.",
    generateCta: "Generieren",
    aiBadge: "KI",
    deleteAria: "Dialog löschen",
    deleteConfirm: (titleDe: string) => `„${titleDe}" wirklich löschen?`,
    deleteToastSuccess: "Dialog gelöscht",
    deleteToastError: "Löschen fehlgeschlagen",
    reportLabel: (titleDe: string) => `Dialog: ${titleDe}`,
    playAllAria: "Ganzen Dialog abspielen",
    speaker: (id: string) => `Sprecher ${id}`,
    notFound: "Diesen Dialog gibt es nicht.",
    back: "Zu den Dialogen",
    /** Rollenspiel (W3.4). */
    playableBadge: "Mitspielbar",
    modes: { read: "Lesen", play: "Mitspielen" },
    roleLabel: "Deine Rolle",
    roleHint: "Du antwortest an den Stellen dieser Person.",
    start: "Losspielen",
    yourTurn: "Du bist dran — was sagst du?",
    showGerman: "Deutsch zeigen",
    hideGerman: "Deutsch ausblenden",
    wrong: "Nicht ganz.",
    solution: (sw: string) => `Richtig wäre: ${sw}`,
    /** Nachsprechen bleibt Selbstcheck — kein Mikrofon, keine Spracherkennung. */
    repeatHint: "🎙 Hör es dir an und sprich es laut nach.",
    replay: "Nochmal hören",
    next: "Weiter",
    done: {
      headline: "Hongera!",
      score: (firstTry: number, total: number) =>
        `${firstTry} von ${total} gleich beim ersten Versuch`,
      perfect: "Fehlerfrei — jede Antwort saß sofort.",
      again: "Nochmal spielen",
    },
  },

  classes: {
    metaTitle: "Ngeli — Swahili Noun Classes",
    metaDescription: "Lerne die Swahili-Nominalklassen (Ngeli) mit Beispielen und Quiz.",
    eyebrow: "Madarasa ya majina",
    title: "Ngeli",
    tabs: { reference: "Übersicht", quiz: "Quiz" },
  },

  verbs: {
    metaTitle: "Verben & Zeitformen — Swahili Pocket",
    metaDescription:
      "Swahili-Verbgrammatik zum Nachlesen: Zeitformen, Verneinung, Imperativ, Konjunktiv, Objektinfix und Relativformen.",
    eyebrow: "Vitenzi na nyakati",
    title: "Verben & Zeitformen",
    examples: "Beispiele",
    negated: "Verneint",
    structure: {
      title: "Der Bauplan",
      intro: "Jede Verbform entsteht aus denselben Bausteinen — in fester Reihenfolge.",
      persons: "Personen",
      subject: "Subjekt",
      negative: "verneint",
      object: "Objekt",
      classHint:
        "Für Nomen statt Personen gelten die Präfixe der jeweiligen Klasse — siehe Konkordanztafel unter Ngeli.",
    },
    negation: {
      title: "Verneinung",
      intro: "Jede Zeitform hat ihre eigene verneinte Bildung.",
      affirmative: "bejaht",
      negative: "verneint",
      persons: "Verneintes Präsens, alle Personen",
    },
    imperative: {
      title: "Imperativ",
      irregular: "Unregelmäßig",
    },
    subjunctive: {
      title: "Konjunktiv (-e)",
    },
    object: {
      title: "Objektinfix",
    },
    relative: {
      title: "Relativformen",
    },
  },

  reference: {
    singular: "Singular",
    plural: "Plural",
    classPrefix: "Klassenpräfix",
    /** Zeilenbeschriftungen der Konkordanztafel (Spalten 1–5 der Vorlage). */
    base: {
      title: "Basis-Konkordanz",
      subject: "Subjektpräfix",
      subjectNegative: "verneint (ha-)",
      genitive: "Genitiv (-a)",
      object: "Objektpräfix",
      relative: "Relativsilbe (-o)",
    },
    personal: {
      title: "Personen",
      hint: "Personen folgen der M-/Wa-Klasse — Possessiv und Demonstrativ sind dieselben.",
    },
    possessive: {
      title: "Possessiv (mein, dein …)",
      my: "mein",
      your: "dein, Ihr",
      his: "sein, ihr",
      our: "unser",
      yourPl: "euer, Ihr",
      their: "ihr (Pl.)",
    },
    demonstratives: "Demonstrativa",
    near: "Dieses (hier)",
    far: "Jenes (dort)",
    referential: "Das Erwähnte",
    any: "Irgendein",
    emphatic: "Emphatisch (ndi-)",
    variable: {
      title: "Adjektive, Zahl- & Fragewörter",
      zuri: "gut, schön (-zuri)",
      moja: "ein(e) (-moja)",
      wili: "zwei (-wili)",
      ngapi: "wie viele (-ngapi)",
      ingine: "andere (-ingine)",
      ote: "alle, ganz (-ote)",
      eupe: "weiß (-eupe)",
      pi: "welche (-pi)",
      enye: "habend (-enye)",
      enyewe: "selbst (-enyewe)",
    },
    verbsHint: "Zeitformen, Verneinung, Imperativ — die Verbgrammatik zum Nachlesen",
    locative: "Ortsangabe („ist da“)",
    locativeHint:
      "-po = genau an dieser Stelle · -ko = irgendwo, allgemein · -mo = darin. " +
      "Die Form richtet sich nach der Klasse dessen, was sich irgendwo befindet: " +
      "Kitabu kiko wapi? — Wo ist das Buch?",
    examples: "Beispiele",
    monosyllabic: {
      title: "Einsilbige Verben",
      tag: "Sonderregel",
      intro:
        "Verben mit einsilbigem Stamm behalten in den meisten Zeiten das ku- als Betonungsträger.",
      mainVerbs: "Wichtigste Verben",
      withKu: "Mit ku-",
      withoutKu: "Ohne ku-",
      rule:
        "Faustregel: ku- fällt im Habitual (hu-) und im Negativ-Präsens weg — sonst " +
        "bleibt es erhalten. Im Imperativ Singular schwankt der Gebrauch: kula! und la! " +
        "sind beide zu hören.",
    },
  },

  quiz: {
    done: {
      headline: "Hongera!",
      score: (score: number, total: number) => `${score} / ${total} richtig`,
      again: "Nochmal spielen",
    },
    questionCounter: (idx: number, total: number) => `Frage ${idx} / ${total}`,
    score: (n: number) => `Score: ${n}`,
    prompt: "Welche Ngeli?",
  },

  poolPicker: {
    eyebrow: "Aus dem Pool",
    title: "Lernkarten hinzufügen",
    topicLabel: "Bereich (Thema, Suchwort oder Nomenklasse)",
    topicPlaceholder: "z. B. Küche, Reisen, M-Wa-Klasse — leer = zufällig",
    count: (n: number) => `Anzahl: ${n} Vokabeln`,
    loadCta: "Vorschläge laden",
    empty:
      "Keine passenden Vokabeln gefunden. Versuch einen anderen Begriff, ein Themen-Chip — oder lass das Feld leer für eine zufällige Auswahl.",
    selectionHint: (sel: number, total: number) =>
      `${sel} von ${total} ausgewählt — tippe, um ab-/anzuwählen.`,
    discard: "Verwerfen",
    saveCount: (n: number) => `${n} übernehmen`,
    /** Vorbefüllte Auswahl (W3.3): die fehlenden Wörter einer Geschichte. */
    eyebrowMissing: "Fehlende Wörter",
    emptyPreselect:
      "Diese Wörter stehen nicht im Lexikon. Du kannst sie beim Lesen einzeln antippen und als eigene Karte übernehmen.",
    toasts: {
      saved: (n: number) => `${n} Lernkarten hinzugefügt`,
      noneSelected: "Nichts ausgewählt",
    },
  },

  stories: {
    metaTitle: "Geschichten — Swahili Pocket",
    metaDescription:
      "Kurze Geschichten auf Swahili, die zu deinem Wortschatz passen — mit Glossar für jedes Wort.",
    eyebrow: "Hadithi",
    title: "Geschichten",
    /** Erklärt die Kernschleife der Bibliothek in einem Satz. */
    intro:
      "Freigeschaltet wird, was du zu mindestens 95 % verstehst. Jedes neue Wort öffnet weitere Geschichten.",
    empty:
      "Noch keine Geschichten vorhanden. Sie werden mit der App ausgeliefert — schau nach einem Update noch einmal vorbei.",
    band: (n: number) => `Stufe ${n}`,
    words: (n: number) => `${n} Wörter`,
    readBadge: "Gelesen",
    reader: {
      backAria: "Zurück zu den Geschichten",
      showGerman: "Deutsch einblenden",
      hideGerman: "Deutsch ausblenden",
      /** Hinweis über dem Text — erst selbst verstehen, dann prüfen. */
      hint: "Tippe ein Wort an, um es nachzuschlagen.",
      playAria: "Absatz anhören",
      finish: "Fertig gelesen",
      finished: "Gelesen ✓",
      notFound: "Diese Geschichte gibt es nicht.",
      xp: (n: number) => `+${n} XP`,
      newWordHint: "Neues Wort in dieser Geschichte",
    },
    done: {
      headline: "Umemaliza!",
      body: (title: string) => `„${title}" ist durch.`,
      unaided: "Und das ganz ohne die Übersetzung einzublenden.",
      back: "Zur Bibliothek",
    },
  },

  /**
   * Abdeckung und Freischaltung — dieselben Sätze für Geschichten und Dialoge
   * (W4.4). Die Kernschleife ist in beiden Listen dieselbe; sie zweimal leicht
   * anders zu formulieren würde sie als zwei Mechaniken erscheinen lassen.
   */
  coverage: {
    known: (percent: number) => `${percent} % bekannt`,
    newWords: (n: number) =>
      n === 0 ? "kein neues Wort" : n === 1 ? "1 neues Wort" : `${n} neue Wörter`,
    lockedProgress: (missing: number) =>
      missing === 1
        ? "Noch 1 Wort bis zur Freischaltung"
        : `Noch ${missing} Wörter bis zur Freischaltung`,
    learnMissing: "Diese Wörter lernen",
    lockedAria: "Gesperrt",
  },

  /** Wort-Nachschlag — im Lesetext wie im Dialog (components/GlossSheet). */
  gloss: {
    baseForm: (lemma: string) => `Grundform: ${lemma}`,
    properName: "Eigenname",
    structure: "Grammatische Form — die lernst du im Grammatik-Gym, nicht als Vokabel.",
    addCard: "Als Lernkarte übernehmen",
    inCards: "Schon in deinen Karten",
    added: "In Lernkarten übernommen",
    listenAria: "Wort anhören",
  },

  packs: {
    title: "Themenpakete",
    intro:
      "Zusätzlicher Wortschatz für einzelne Themen. Eingeschaltet stehen die Wörter im Pool zur Auswahl, und die Dialoge und Geschichten dazu werden sichtbar.",
    wordCount: (n: number) => (n === 1 ? "1 Wort" : `${n} Wörter`),
    on: "An",
    off: "Aus",
    /** Hinweis an einem Inhalt, dem noch ein Paket fehlt. */
    locked: (titles: string[]) =>
      titles.length === 1
        ? `Braucht das Paket „${titles[0]}"`
        : `Braucht die Pakete ${titles.map((t) => `„${t}"`).join(" und ")}`,
    unlockCta: "In der Bibliothek einschalten",
  },

  library: {
    metaTitle: "Bibliothek — Swahili Pocket",
    metaDescription: "Geschichten, Dialoge und Grammatik an einem Ort.",
    eyebrow: "Maktaba",
    title: "Bibliothek",
    stories: {
      title: "Geschichten",
      subtitle: (unlocked: number, total: number) =>
        total === 0
          ? "Noch keine Geschichten vorhanden"
          : `${unlocked} von ${total} freigeschaltet`,
    },
    dialogues: {
      title: "Dialoge",
      subtitle: (unlocked: number, total: number, playable: number) =>
        `${unlocked} von ${total} freigeschaltet · ${playable} mitspielbar`,
    },
    grammar: {
      title: "Ngeli",
      subtitle: (classes: number) => `${classes} Nomenklassen · volle Konkordanztafel`,
    },
    verbs: {
      title: "Verben & Zeitformen",
      subtitle: (tenses: number) => `${tenses} Zeitformen · Verneinung, Imperativ, Konjunktiv`,
    },
  },

  retention: {
    /** Home-Karte. */
    cardTitle: "Langzeit-Check",
    cardBody: (n: number) =>
      `${n} Wörter, die du seit über zwei Monaten nicht gesehen hast. Sitzen sie noch?`,
    cardCta: "Check starten",
    eyebrow: "Langzeit-Check",
    done: {
      headline: (percent: number) => `${percent} %`,
      body: (days: number) =>
        `nach durchschnittlich ${days} Tagen Pause. Das ist Langzeitgedächtnis.`,
      historyHeading: "Frühere Checks",
      /** Achsenbeschriftung des Verlaufs. */
      chartLabel: "Trefferquote",
    },
  },

  settings: {
    metaTitle: "Einstellungen — Swahili Pocket",
    title: "Einstellungen",
    subtitle: "Deine Daten leben auf diesem Gerät — sichere sie regelmäßig.",
    statCards: "Karten",
    statStreak: "Streak",
    statXp: "XP",
    method: {
      heading: "Lernmethode",
      hint: "Bestimmt, wann eine Karte wieder abgefragt wird. Dein Fortschritt bleibt bei jedem Wechsel vollständig erhalten.",
      fsrs: {
        label: "Adaptiv (FSRS)",
        hint: "Passt die Abstände an jede einzelne Karte an. Empfohlen.",
      },
      leitner: {
        label: "Klassisch (Leitner)",
        hint: "Feste 5 Boxen mit festen Abständen (1/2/4/7/90 Tage).",
      },
      switchTitle: "Lernmethode wechseln?",
      switchBody:
        "Die Fälligkeiten werden neu berechnet — dein Fortschritt bleibt vollständig erhalten. Du kannst jederzeit zurückwechseln.",
      switchConfirm: "Umstellen",
      switched: (name: string, due: number) => `${name} aktiv — ${due} Karten fällig`,
      switchFailed: "Umstellen fehlgeschlagen",
      dailyGoal: "Tagesziel",
      dailyGoalHint: "So viele Karten willst du an einem normalen Tag schaffen.",
      dailyGoalOption: (n: number) => `${n} Karten`,
      weeklyGoal: "Wochenziel",
      weeklyGoalHint:
        "Lerntage pro Woche. Das Wochenziel zählt, nicht die lückenlose Kette — Pausen sind erlaubt.",
      /** Fünf Optionen nebeneinander — nur die Zahl, die Einheit steht im Hinweis. */
      weeklyGoalOption: (n: number) => `${n}`,
      saved: "Gespeichert",
    },
    modes: {
      heading: "Übungsarten",
      hint: "Was in einer Runde vorkommen darf. Gemischte Formate prägen sich besser ein als ein einziges — abschalten kostet also etwas.",
      descriptions: {
        typed:
          "Wort selbst schreiben. Erst ab der zweiten Box — neue Wörter werden zuerst erkannt.",
        audio: "Wort hören, Bedeutung wählen. Nur mit vorhandener Aufnahme.",
        cloze: "Lückensatz mit Kontext. Nur bei passendem Beispielsatz.",
      },
    },
    backup: {
      heading: "Backup",
      hint: "Exportiere deine Lernkarten und Statistiken als JSON-Datei. Beim Import wird der aktuelle Bestand ersetzt.",
      exportCta: "Daten exportieren",
      importCta: "Backup importieren",
    },
    danger: {
      heading: "Gefahrenzone",
      hint: "Setzt die App auf den Auslieferungszustand zurück. Alle Lernkarten und Statistiken auf diesem Gerät werden gelöscht.",
      resetCta: "Alle Daten zurücksetzen",
      confirmCta: "Wirklich löschen",
    },
    toasts: {
      imported: (n: number) => `Backup importiert — ${n} Karten wiederhergestellt`,
      importFailed: "Import fehlgeschlagen",
      resetDone: "Alle Daten zurückgesetzt",
    },
  },

  account: {
    metaTitle: "Mein Konto — Swahili Pocket",
    title: "Mein Konto",
    subtitle: "Verwalte deine Account-Daten.",
    roleAdmin: "Admin",
    roleUser: "Nutzer",
    displayNameLabel: "Anzeigename",
    displayNamePlaceholder: "Dein Name",
    memberSince: (date: string) => `Mitglied seit ${date}`,
    changePassword: "Passwort ändern",
    newPasswordLabel: "Neues Passwort",
    signOut: "Abmelden",
    dangerZone: "Gefahrenzone",
    dangerHint:
      "Beim Löschen werden alle deine Daten (Vokabeln, Dialoge, Statistiken, Profil) unwiderruflich entfernt.",
    deleteCta: "Account löschen",
    deleteDialogTitle: "Account wirklich löschen?",
    deleteDialogBody:
      "Diese Aktion kann nicht rückgängig gemacht werden. Dein Account und alle zugehörigen Daten werden sofort gelöscht (DSGVO Art. 17). Aus Sicherungs-Backups können Daten innerhalb von bis zu 30 Tagen vollständig verschwinden. Tippe LÖSCHEN zur Bestätigung.",

    deleteConfirmKeyword: "LÖSCHEN",
    deleting: "Lösche…",
    deleteFinal: "Endgültig löschen",
    legal: {
      heading: "Rechtliches",
      imprint: "Impressum",
      privacy: "Datenschutz",
    },
    toasts: {
      profileSaved: "Profil gespeichert",
      passwordChanged: "Passwort geändert",
      passwordMinLen: "Mindestens 8 Zeichen",
      accountDeleted: "Account gelöscht",
    },
    changelog: {
      heading: "Neuigkeiten",
      showOlder: "Frühere Versionen anzeigen",
      hideOlder: "Frühere Versionen ausblenden",
    },
  },

  wordsToday: {
    metaTitle: "Heute gelernt — Swahili Pocket",
    metaDescription: "Alle Vokabeln, die du heute geübt oder hinzugefügt hast.",
    title: "Heute gelernt",
    subtitle: "Wörter",
    empty: "Heute noch nichts geübt",
    startCta: "Jetzt eine Runde starten →",
    meta: (time: string) => `zuletzt geübt: heute ${time}`,
  },

  wordsMastered: {
    metaTitle: "Gemeistert — Swahili Pocket",
    metaDescription: "Alle Vokabeln, die du in Box 5 gemeistert hast.",
    title: "Gemeistert",
    subtitle: "Box 5",
    empty: "Noch keine Karte gemeistert",
    hintPrefix: "Karten erreichen Box 5 nach mehreren erfolgreichen Wiederholungen. ",
    practiceCta: "Üben →",
    meta: (box: number) => `gemeistert · Box ${box}`,
  },

  vocabList: {
    backAria: "Zurück",
    boxBadge: (n: number) => `Box ${n}`,
    monosyllabic: "einsilbig",
  },

  report: {
    eyebrow: "Melden",
    aria: "Melden",
    reason: "Grund",
    commentLabel: (required: boolean) =>
      `Kommentar ${required ? "(Pflicht)" : "(optional)"} — max. 200 Zeichen`,
    commentPlaceholder: "Was stimmt nicht?",
    charCount: (n: number, max: number) => `${n}/${max}`,
    autoHideHint:
      "Wenn mehrere Nutzer dieses Wort melden, wird es automatisch ausgeblendet, bis ein Admin es geprüft hat.",
    kinds: {
      wrong_translation: "Falsche Übersetzung / Grammatik",
      wrong_pronunciation: "Falsche Aussprache",
      inappropriate: "Unangemessenes Wort",
      other: "Sonstiges",
    },
    sendCta: "Senden",
    cancelCta: "Abbrechen",
    toasts: {
      success: "Danke! Meldung übermittelt.",
      successHidden: "Danke! Das Wort wurde vorübergehend ausgeblendet.",
      error: "Senden fehlgeschlagen",
    },
  },

  speakButton: {
    ariaPlay: (text: string) => `Aussprache anhören: ${text}`,
  },

  assessment: {
    metaTitleSuffix: "Einstufung",
    metaDescription:
      "Kurzer Einstufungstest, der dein Swahili-Niveau bestimmt und deine Lernkarten und Dialoge passend einrichtet.",
    submitting: "Einstufung wird ausgewertet…",
    intro: {
      title: "Wo stehst du beim Swahili?",
      body: "Ein kurzer Test in drei Frageformaten — daraus leiten wir dein Niveau ab, schalten passende Startvokabeln frei und stellen die Dialoglänge ein.",
      bullet1: "Ngeli, Übersetzungen und Lückentexte — ca. 3 Minuten.",
      bullet2: "Wir füllen deine Lernkartei automatisch mit passenden Wörtern.",
      bullet3: "Generierte Dialoge werden auf deine Stufe abgestimmt.",
      cta: "Einstufung starten",
    },
    self: {
      eyebrow: "Schritt 1 von 2",
      title: "Wie gut sprichst du schon Swahili?",
      cta: "Weiter zum Test",
      none: { label: "Noch garnicht", hint: "Ich fange gerade erst an." },
      words: { label: "Einzelne Wörter", hint: "Begrüßungen, Zahlen, ein paar Vokabeln." },
      sentences: {
        label: "Einfache Sätze",
        hint: "Ich kann mich kurz vorstellen und Fragen stellen.",
      },
      everyday: { label: "Sicher im Alltag", hint: "Alltagsgespräche fallen mir leicht." },
      advanced: { label: "Fortgeschritten", hint: "Komplexere Themen meistere ich gut." },
    },
    quiz: {
      progress: (idx: number, total: number) => `Frage ${idx} / ${total}`,
      difficulty: { easy: "Leicht", medium: "Mittel", hard: "Schwer" } as const,
      prompt: {
        ngeli: "Welche Ngeli hat dieses Nomen?",
        swDe: "Was bedeutet das auf Deutsch?",
        deSw: "Wie heißt das auf Swahili?",
        cloze: "Welches Wort passt in die Lücke?",
      },
    },
    done: {
      eyebrow: "Dein Niveau",
      scoreLine: (correct: number, total: number) => `${correct} von ${total} richtig`,
      vocabLabel: "Vokabeln freigeschaltet",
      linesLabel: "Dialogzeilen",
      body: "Du kannst die Einstufung jederzeit im Ngeli-Bereich wiederholen, wenn du dich verbessert hast.",
      cta: "Jetzt üben",
      skip: "Später üben",
    },
    quizTab: {
      eyebrow: "Sprachstand",
      headlineFirst: "Lass uns dein Niveau einschätzen",
      headlineRetake: "Deine Einstufung",
      bodyFirst:
        "Ein kurzer Test bestimmt dein CEFR-Niveau, schaltet passende Vokabeln frei und passt die Dialoglänge an.",
      bodyRetake:
        "Wiederhole die Einstufung, wenn du das Gefühl hast, dass dein Niveau gestiegen ist.",
      statLevel: "Niveau",
      statVocab: "Vokabeln",
      statLines: "Dialogzeilen",
      ctaStart: "Einstufung starten",
      ctaRetake: "Einstufung wiederholen",
    },
  },
} as const;
