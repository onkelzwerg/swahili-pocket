import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Eye, EyeOff, Play } from "lucide-react";
import {
  choicePointCount,
  findDialogue,
  isPlayable,
  orderedChoices,
  playableSpeakers,
} from "@/lib/dialogues";
import { recordDialogueRun } from "@/lib/dialogue-stats";
import { loadDialogueData, type DialogueGloss } from "@/lib/dialogue-index";
import { groupStorySegments, type StorySegment } from "@/lib/stories";
import { checkMilestones, type Milestone } from "@/lib/milestones";
import { awardXp, getVocab } from "@/lib/store";
import { speak, speakSequence, cancelSpeech, createUnlockedAudio } from "@/lib/tts";
import { GlossSheet } from "@/components/GlossSheet";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";
import type { DialogueChoice, DialogueSpeaker, DialogueTurn } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dialogues_/$dialogueId")({
  component: DialoguePage,
});

/** XP für ein durchgespieltes Rollenspiel. */
const DIALOGUE_XP = 15;

function bubbleClass(speaker: DialogueSpeaker, mine: boolean) {
  if (mine) return "bg-primary text-primary-foreground rounded-br-sm";
  if (speaker === "C") return "bg-ochre/20 text-ochre-foreground border border-ochre/40";
  return "bg-card border border-border rounded-bl-sm";
}

function DialoguePage() {
  const { dialogueId } = Route.useParams();
  const dialogue = findDialogue(dialogueId);
  const [mode, setMode] = useState<"read" | "play">("read");
  const [glosses, setGlosses] = useState<Record<string, DialogueGloss>>({});

  useEffect(() => () => cancelSpeech(), []);

  // Das Glossar liegt neben dem Dialog (public/dialogues/<id>.json) und kommt
  // erst hier dazu — es steht bewusst nicht im JS-Bündel. Fehlt es, bleiben die
  // Wörter eben nicht antippbar; der Dialog selbst funktioniert weiter.
  useEffect(() => {
    void loadDialogueData(dialogueId).then((data) => setGlosses(data?.glosses ?? {}));
  }, [dialogueId]);

  if (!dialogue) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">{T.dialogues.notFound}</p>
        <Link to="/dialogues" className="mt-3 inline-block text-sm font-semibold text-primary">
          {T.dialogues.back}
        </Link>
      </div>
    );
  }

  const playable = isPlayable(dialogue);

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="mb-4 flex items-start gap-3">
        <Link
          to="/dialogues"
          aria-label={T.common.back}
          onClick={() => cancelSpeech()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold leading-tight">
            {dialogue.emoji} {dialogue.title}
          </h1>
          <p className="text-sm text-muted-foreground">{dialogue.titleDe}</p>
        </div>
        {mode === "read" && (
          <button
            onClick={() => void speakSequence(dialogue.turns.map((t) => t.sw))}
            aria-label={T.dialogues.playAllAria}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Play className="h-4 w-4" />
          </button>
        )}
      </header>

      {playable && (
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          {(["read", "play"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                cancelSpeech();
                setMode(m);
              }}
              className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                mode === m ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {T.dialogues.modes[m]}
            </button>
          ))}
        </div>
      )}

      {mode === "play" && playable ? (
        <RolePlay dialogue={dialogue} />
      ) : (
        <ReadView dialogue={dialogue} glosses={glosses} />
      )}
    </div>
  );
}

/** Reiner Leerraum zwischen zwei Wortgruppen — die einzige Umbruchstelle. */
function isSpaceGroup(group: StorySegment[]): boolean {
  return group.length === 1 && !group[0].word && /^\s+$/.test(group[0].text);
}

/**
 * Lesemodus. Seit W4.4 ist jedes Wort antippbar — derselbe Tokenizer und
 * dasselbe Nachschlage-Sheet wie im Story-Reader, damit ein Wort im Dialog
 * nicht anders funktioniert als dasselbe Wort in einer Geschichte.
 */
function ReadView({
  dialogue,
  glosses,
}: {
  dialogue: NonNullable<ReturnType<typeof findDialogue>>;
  glosses: Record<string, DialogueGloss>;
}) {
  const [openWord, setOpenWord] = useState<string | null>(null);
  const [ownWords, setOwnWords] = useState<Set<string>>(new Set());
  const hasGlosses = Object.keys(glosses).length > 0;

  useEffect(() => {
    void getVocab().then((vocab) =>
      setOwnWords(new Set(vocab.map((v) => v.swahili.toLowerCase()))),
    );
  }, []);

  const gloss = openWord ? (glosses[openWord] ?? null) : null;

  return (
    <>
      {hasGlosses && <p className="mb-3 text-xs text-muted-foreground">{T.dialogues.readerHint}</p>}

      <ul className="flex flex-col gap-3">
        {dialogue.turns.map((turn, i) => (
          <li key={i} className={`flex ${turn.speaker === "B" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                turn.speaker === "B"
                  ? "bg-forest text-forest-foreground rounded-br-sm"
                  : bubbleClass(turn.speaker, false)
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold opacity-70">
                    {T.dialogues.speaker(turn.speaker)}
                  </p>
                  {/* Gruppiert, damit ein Satzzeichen nicht ohne sein Wort umbricht. */}
                  <p className="font-display text-base font-semibold">
                    {hasGlosses
                      ? groupStorySegments(turn.sw).map((group, g) =>
                          isSpaceGroup(group) ? (
                            <span key={g}>{group[0].text}</span>
                          ) : (
                            <span key={g} className="whitespace-nowrap">
                              {group.map((segment, j) =>
                                segment.word && glosses[segment.word] ? (
                                  <button
                                    key={j}
                                    type="button"
                                    onClick={() => setOpenWord(segment.word)}
                                    className="rounded underline decoration-current/25 decoration-dotted underline-offset-4 transition-colors active:bg-background/25"
                                  >
                                    {segment.text}
                                  </button>
                                ) : (
                                  <span key={j}>{segment.text}</span>
                                ),
                              )}
                            </span>
                          ),
                        )
                      : turn.sw}
                  </p>
                </div>
                <button
                  onClick={() => void speak(turn.sw, createUnlockedAudio())}
                  className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/25"
                >
                  <Play className="h-3 w-3" />
                </button>
              </div>
              <p
                className={`mt-1 text-xs ${turn.speaker === "B" ? "opacity-80" : "text-muted-foreground"}`}
              >
                {turn.de}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <GlossSheet
        token={openWord}
        gloss={gloss}
        inCards={!!gloss && ownWords.has(gloss.lemma)}
        onClose={() => setOpenWord(null)}
        onAdded={(lemma) => setOwnWords((prev) => new Set(prev).add(lemma))}
      />
    </>
  );
}

/**
 * Rollenspiel (W3.4).
 *
 * Fremde Züge laufen automatisch ab, am eigenen Zug wählt der Nutzer. Falsch
 * heißt nicht „vorbei": beim ersten Fehlversuch gibt es die Begründung und
 * einen zweiten Anlauf, beim zweiten die Lösung. Gezählt wird, was beim
 * **ersten** Versuch saß — alles andere wäre eine Teilnahmeurkunde.
 */
function RolePlay({ dialogue }: { dialogue: NonNullable<ReturnType<typeof findDialogue>> }) {
  const speakers = useMemo(() => playableSpeakers(dialogue), [dialogue]);
  const [role, setRole] = useState<DialogueSpeaker | null>(
    speakers.length === 1 ? speakers[0] : null,
  );
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState<DialogueChoice | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showGerman, setShowGerman] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [done, setDone] = useState(false);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  const total = choicePointCount(dialogue);

  // Fremde Züge abspielen und weiterschalten, bis der eigene Zug kommt.
  useEffect(() => {
    if (role === null || done) return;
    const turn = dialogue.turns[index];
    if (!turn) {
      void finish();
      return;
    }
    const isMine = turn.speaker === role && (turn.choices?.length ?? 0) > 0;
    if (isMine) return;

    let alive = true;
    void speak(turn.sw, createUnlockedAudio()).finally(() => {
      if (alive) setIndex((i) => i + 1);
    });
    return () => {
      alive = false;
    };
    // finish() hängt an firstTry/total und würde den Effekt sonst neu starten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, role, done, dialogue]);

  async function finish() {
    setDone(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: [APP_CONFIG.primaryColor, APP_CONFIG.accentColor, APP_CONFIG.secondaryColor],
    });
    try {
      await recordDialogueRun(dialogue.id, { firstTry, total });
      await awardXp(DIALOGUE_XP);
      const fresh = await checkMilestones({ dialogue: { firstTry, total } });
      if (fresh.length > 0) setMilestone(fresh[0]);
    } catch (e) {
      console.error("[dialogues] finish failed", e);
    }
  }

  function choose(choice: DialogueChoice) {
    if (choice.correct) {
      if (attempts === 0) setFirstTry((n) => n + 1);
      advance();
      return;
    }
    setWrong(choice);
    setAttempts((n) => n + 1);
    // Zweiter Fehlversuch: Lösung zeigen, statt weiter raten zu lassen.
    if (attempts >= 1) setRevealed(true);
  }

  function advance() {
    setWrong(null);
    setAttempts(0);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  if (role === null) {
    return (
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">{T.dialogues.roleLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">{T.dialogues.roleHint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {speakers.map((s) => (
            <button
              key={s}
              onClick={() => setRole(s)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground active:scale-95"
            >
              {T.dialogues.speaker(s)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <DialogueDoneScreen
        firstTry={firstTry}
        total={total}
        milestone={milestone}
        onAgain={() => {
          setIndex(0);
          setFirstTry(0);
          setDone(false);
          setMilestone(null);
          setWrong(null);
          setAttempts(0);
          setRevealed(false);
        }}
      />
    );
  }

  const turn = dialogue.turns[index] as DialogueTurn | undefined;
  const isMyTurn = !!turn && turn.speaker === role && (turn.choices?.length ?? 0) > 0;

  return (
    <div>
      <ul className="mb-4 flex flex-col gap-3">
        {dialogue.turns.slice(0, index).map((t, i) => {
          const mine = t.speaker === role;
          return (
            <li key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${bubbleClass(t.speaker, mine)}`}>
                <p className="font-display text-base font-semibold">{t.sw}</p>
                <p className={`mt-1 text-xs ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                  {t.de}
                </p>
                {mine && (
                  <p className="mt-2 border-t border-primary-foreground/20 pt-2 text-[11px] opacity-90">
                    {T.dialogues.repeatHint}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {isMyTurn && turn && (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{T.dialogues.yourTurn}</p>
            <button
              onClick={() => setShowGerman((s) => !s)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              {showGerman ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showGerman ? T.dialogues.hideGerman : T.dialogues.showGerman}
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {orderedChoices(turn, index).map((choice) => (
              <li key={choice.sw}>
                <button
                  onClick={() => choose(choice)}
                  disabled={revealed}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors disabled:opacity-60 ${
                    wrong?.sw === choice.sw
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-border bg-card active:bg-primary/10"
                  }`}
                >
                  <p className="font-display text-base font-semibold">{choice.sw}</p>
                  {showGerman && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{choice.de}</p>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {wrong && (
            <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-semibold text-destructive">{T.dialogues.wrong}</p>
              {wrong.feedback && (
                <p className="mt-1 text-xs text-muted-foreground">{wrong.feedback}</p>
              )}
              {revealed && (
                <>
                  <p className="mt-2 text-xs font-medium">{T.dialogues.solution(turn.sw)}</p>
                  <button
                    onClick={advance}
                    className="mt-3 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    {T.dialogues.next}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!isMyTurn && (
        <button
          onClick={() => void speak(dialogue.turns[index - 1]?.sw ?? "", createUnlockedAudio())}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
        >
          <Play className="h-3 w-3" /> {T.dialogues.replay}
        </button>
      )}
    </div>
  );
}

function DialogueDoneScreen({
  firstTry,
  total,
  milestone,
  onAgain,
}: {
  firstTry: number;
  total: number;
  milestone: Milestone | null;
  onAgain: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="text-6xl"
      >
        🎭
      </motion.div>
      <h2 className="font-display text-2xl font-bold">{T.dialogues.done.headline}</h2>
      <p className="text-sm text-muted-foreground">{T.dialogues.done.score(firstTry, total)}</p>
      {firstTry === total && total > 0 && (
        <p className="font-medium text-forest">{T.dialogues.done.perfect}</p>
      )}
      <span className="rounded-full bg-ochre/15 px-3 py-1 text-sm font-bold text-ochre-foreground">
        +{DIALOGUE_XP} XP
      </span>

      {milestone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring" }}
          className="mt-2 w-full max-w-sm rounded-3xl border border-ochre/40 bg-ochre/10 p-5"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-ochre-foreground">
            {T.milestones.unlockedHeadline}
          </p>
          <div className="mt-2 text-4xl">{milestone.emoji}</div>
          <h3 className="mt-1 font-display text-xl font-bold">{milestone.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
        </motion.div>
      )}

      <div className="mt-4 flex flex-col items-center gap-2">
        <Link
          to="/dialogues"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {T.dialogues.back}
        </Link>
        <button
          onClick={onAgain}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4"
        >
          {T.dialogues.done.again}
        </button>
      </div>
    </div>
  );
}
