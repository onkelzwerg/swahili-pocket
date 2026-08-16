import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";

import { getVocab, awardXp } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { appendTrainerResult } from "@/lib/review-log";
import { recordTrainerTask, getTrainerStats, type TrainerStats } from "@/lib/trainer-stats";
import { checkAnswer } from "@/lib/answer-check";
import {
  buildNgeliTask,
  buildVerbTask,
  TYPING_UNLOCK_RUN,
  type TrainerTask,
} from "@/lib/morphology";
import type { VocabEntry } from "@/lib/types";
import { useAutoFocus } from "@/components/exercises/useAutoFocus";
import { T } from "@/config/translations";

// Morphologie-Trainer (W2.7) — bewusst ein eigener Bereich, nicht in die
// SRS-Session gemischt. Eigenes Mentalmodell: hier werden keine Vokabeln
// wiederholt, sondern Formen gebaut. Der Stoff kommt aus dem eigenen
// Wortschatz, deshalb geht er nie aus.

export const Route = createFileRoute("/_authenticated/trainer")({
  head: () => ({
    meta: [
      { title: T.trainer.metaTitle },
      { name: "description", content: T.trainer.metaDescription },
    ],
  }),
  component: TrainerPage,
});

type Kind = "verb" | "ngeli";
type InputMode = "chips" | "typing";
type Verdict = "correct" | "wrong";

/** XP pro gelöster Aufgabe — gleich viel wie ein Review. */
const TRAINER_XP = 10;

function TrainerPage() {
  const [kind, setKind] = useState<Kind>("verb");
  const [inputMode, setInputMode] = useState<InputMode>("chips");
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [task, setTask] = useState<TrainerTask | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [typed, setTyped] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [run, setRun] = useState(0);
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [typingOffered, setTypingOffered] = useState(false);

  const nextTask = useCallback((list: VocabEntry[], forKind: Kind) => {
    setTask(forKind === "verb" ? buildVerbTask(list) : buildNgeliTask(list));
    setPlaced([]);
    setTyped("");
    setVerdict(null);
  }, []);

  useEffect(() => {
    void (async () => {
      const [list, trainerStats] = await Promise.all([getVocab(), getTrainerStats()]);
      setVocab(list);
      setStats(trainerStats);
      nextTask(list, kind);
    })();
    // Beim Wechsel des Aufgabentyps neu ziehen.
  }, [kind, nextTask]);

  function switchKind(next: Kind) {
    if (next === kind) return;
    setKind(next);
    setRun(0);
    setTypingOffered(false);
    setInputMode("chips");
  }

  async function submit(answer: string) {
    if (!task || verdict) return;
    // Auch im Chip-Modus über checkAnswer: die Tipptoleranz schadet nicht und
    // die Normalisierung (Groß-/Kleinschreibung, Leerzeichen) brauchen wir hier
    // genauso.
    const result = checkAnswer(answer, task.answer);
    const correct = result.verdict !== "wrong";
    const nextRun = correct ? run + 1 : 0;

    setVerdict(correct ? "correct" : "wrong");
    setRun(nextRun);
    if (correct && nextRun >= TYPING_UNLOCK_RUN && inputMode === "chips") setTypingOffered(true);

    const card = vocab.find((v) => v.id === task.cardId);
    const settings = await getSettings();
    const [nextStats] = await Promise.all([
      recordTrainerTask({
        kind: task.kind,
        correct,
        nounClass: task.kind === "ngeli" ? task.nounClass : undefined,
        runLength: nextRun,
      }),
      card
        ? appendTrainerResult({
            cardId: card.id,
            mode: task.kind === "verb" ? "morph-verb" : "morph-ngeli",
            correct,
            scheduler: settings.scheduler,
            box: card.box,
            nextReview: card.nextReview,
          })
        : Promise.resolve(),
      correct ? awardXp(TRAINER_XP) : Promise.resolve(),
    ]);
    setStats(nextStats);
  }

  const empty = !task;

  return (
    <div className="px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+5.5rem)]">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {run > 0 && (
          <span className="rounded-full bg-forest/15 px-3 py-1.5 text-sm font-bold text-forest">
            {T.trainer.run(run)}
          </span>
        )}
      </div>

      <header className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">{T.trainer.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.trainer.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.trainer.subtitle}</p>
      </header>

      <Segmented
        options={[
          { value: "verb", label: T.trainer.tabs.verb },
          { value: "ngeli", label: T.trainer.tabs.ngeli },
        ]}
        value={kind}
        onChange={(v) => switchKind(v as Kind)}
      />

      {empty ? (
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {kind === "verb" ? T.trainer.empty.verb : T.trainer.empty.ngeli}
          </p>
          <Link
            to="/lexicon"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {T.trainer.empty.cta}
          </Link>
        </div>
      ) : (
        <>
          {(inputMode === "typing" || typingOffered) && (
            <div className="mt-3">
              <Segmented
                options={[
                  { value: "chips", label: T.trainer.difficulty.chips },
                  { value: "typing", label: T.trainer.difficulty.typing },
                ]}
                value={inputMode}
                onChange={(v) => {
                  setInputMode(v as InputMode);
                  setPlaced([]);
                  setTyped("");
                }}
              />
              {typingOffered && inputMode === "chips" && (
                <p className="mt-2 text-center text-xs text-forest">{T.trainer.typingUnlocked}</p>
              )}
            </div>
          )}

          <motion.div
            key={`${task.kind}-${task.answer}-${run}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-3xl border border-border bg-card p-6 text-center"
          >
            {task.kind === "verb" ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {T.trainer.verb.hint}
                </p>
                {task.polarity === "negative" && (
                  <p className="mt-2 inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                    {T.trainer.verb.negated}
                  </p>
                )}
                <p className="mt-3 font-display text-2xl font-bold leading-snug">
                  {T.trainer.verb.prompt(task.subject.de, task.tense.de, task.stem)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {task.infinitive} · {task.german}
                </p>
                {task.monosyllabic && (
                  <p className="mt-2 text-xs text-ochre-foreground">
                    {task.polarity === "negative" && task.tense.sw !== "ta"
                      ? T.trainer.verb.monosyllabicNegated
                      : T.trainer.verb.monosyllabic}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {T.trainer.ngeli.variants[task.variant]}
                </p>
                <p className="mt-3 font-display text-2xl font-bold leading-snug">
                  {T.trainer.ngeli.prompt(task.noun, task.cue, task.tail)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {task.nounGerman} · {task.nounClass}
                </p>
              </>
            )}
          </motion.div>

          {/* Antwortbereich */}
          {verdict ? (
            <Feedback
              verdict={verdict}
              answer={task.answer}
              onNext={() => nextTask(vocab, kind)}
              extra={
                <Link
                  to={task.explain.to}
                  hash={task.explain.hash}
                  className="text-xs font-medium text-muted-foreground underline underline-offset-4"
                >
                  {task.kind === "ngeli"
                    ? T.trainer.ngeli.why(task.nounClass)
                    : T.trainer.verb.why(task.tense.de, task.polarity === "negative")}
                </Link>
              }
            />
          ) : inputMode === "typing" ? (
            <form
              className="mt-4 flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void submit(typed);
              }}
            >
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  void submit(typed);
                }}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="done"
                placeholder={T.exercises.typed.placeholder}
                aria-label={T.trainer.check}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-center text-base font-medium outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:scale-95"
              >
                {T.trainer.check}
              </button>
            </form>
          ) : task.kind === "verb" ? (
            <ChipBuilder
              chips={task.chips}
              placed={placed}
              onPlace={(i) => setPlaced((p) => [...p, i])}
              onClear={() => setPlaced([])}
              onSubmit={() => void submit(placed.map((i) => task.chips[i]).join(""))}
            />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {task.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => void submit(opt)}
                  className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {stats && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {T.trainer.stats(stats.verbTasks, stats.ngeliTasks, stats.bestStreakRun)}
        </p>
      )}
    </div>
  );
}

/**
 * Bausteine antippen, bis die Form steht. Die niedrigschwellige Stufe —
 * wer die Teile erkennt, kann die Form bauen, ohne sie tippen zu können.
 *
 * `placed` hält Indizes statt Texten: derselbe Baustein kann mehrfach in der
 * Auswahl liegen (z. B. Distraktor gleich Lösung), und jeder Chip darf nur
 * einmal verwendet werden.
 */
function ChipBuilder({
  chips,
  placed,
  onPlace,
  onClear,
  onSubmit,
}: {
  chips: string[];
  placed: number[];
  onPlace(index: number): void;
  onClear(): void;
  onSubmit(): void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex min-h-[3.5rem] items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-muted/40 px-4">
        {placed.length === 0 ? (
          <span className="text-sm text-muted-foreground">···</span>
        ) : (
          <span className="font-display text-2xl font-bold">
            {placed.map((i) => chips[i]).join("")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {chips.map((chip, i) => (
          <button
            key={`${chip}-${i}`}
            type="button"
            disabled={placed.includes(i)}
            onClick={() => onPlace(i)}
            className="rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-semibold disabled:opacity-30 active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3.5 text-sm font-semibold text-muted-foreground active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          {T.trainer.clear}
        </button>
        <button
          type="button"
          disabled={placed.length === 0}
          onClick={onSubmit}
          className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 active:scale-95"
        >
          {T.trainer.check}
        </button>
      </div>
    </div>
  );
}

function Feedback({
  verdict,
  answer,
  onNext,
  extra,
}: {
  verdict: Verdict;
  answer: string;
  onNext(): void;
  extra?: React.ReactNode;
}) {
  const correct = verdict === "correct";
  const nextRef = useAutoFocus<HTMLButtonElement>();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex flex-col gap-3"
    >
      <div
        className={`flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-semibold ${
          correct
            ? "border-forest/40 bg-forest/10 text-forest"
            : "border-destructive/40 bg-destructive/10 text-destructive"
        }`}
      >
        {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        {correct ? T.trainer.correct : T.trainer.wrong(answer)}
      </div>
      {extra && <div className="text-center">{extra}</div>}
      <button
        ref={nextRef}
        type="button"
        onClick={onNext}
        className="rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:scale-95"
      >
        {T.trainer.next}
      </button>
    </motion.div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange(value: string): void;
}) {
  return (
    <div className="flex gap-1 rounded-2xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            value === o.value ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
