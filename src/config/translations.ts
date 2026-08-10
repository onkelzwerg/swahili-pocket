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
    lexicon: "Lexikon",
    review: "Üben",
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
    },
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
    generateCta: "Generieren",
    aiBadge: "KI",
    deleteAria: "Dialog löschen",
    deleteConfirm: (titleDe: string) => `„${titleDe}" wirklich löschen?`,
    deleteToastSuccess: "Dialog gelöscht",
    deleteToastError: "Löschen fehlgeschlagen",
    reportLabel: (titleDe: string) => `Dialog: ${titleDe}`,
    playAllAria: "Ganzen Dialog abspielen",
    speaker: (id: string) => `Sprecher ${id}`,
  },

  classes: {
    metaTitle: "Ngeli — Swahili Noun Classes",
    metaDescription: "Lerne die Swahili-Nominalklassen (Ngeli) mit Beispielen und Quiz.",
    eyebrow: "Madarasa ya majina",
    title: "Ngeli",
    tabs: { reference: "Übersicht", quiz: "Quiz" },
  },

  reference: {
    singular: "Singular",
    plural: "Plural",
    subjectPrefix: "Subj.-Präfix",
    objectPrefix: "Obj.-Präfix",
    genitive: "Genitiv (-a)",
    demonstratives: "Demonstrativa",
    near: "Dieses (hier)",
    far: "Jenes (dort)",
    examples: "Beispiele",
    monosyllabic: {
      title: "Einsilbige Verben",
      tag: "Sonderregel",
      intro:
        "Verben mit einsilbigem Stamm behalten in den meisten Zeiten das ku- als Betonungsträger.",
      mainVerbs: "Wichtigste Verben",
      withKu: "Mit ku-",
      withoutKu: "Ohne ku-",
      rule: "Faustregel: ku- fällt im Imperativ Sg., im Habitual (hu-) und im Negativ-Präsens weg — sonst bleibt es erhalten.",
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
    toasts: {
      saved: (n: number) => `${n} Lernkarten hinzugefügt`,
      noneSelected: "Nichts ausgewählt",
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
