import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import confetti from "canvas-confetti";
import { ArrowLeft, Flame, Sparkles } from "lucide-react";
import { getVocab, getStats } from "@/lib/store";
import { applyReview } from "@/lib/srs";
import { pickComebackCards } from "@/lib/comeback";
import { buildSession, type SessionItem } from "@/lib/session";
import { checkMilestones, type Milestone, type SessionSummary } from "@/lib/milestones";
import { speak, createUnlockedAudio } from "@/lib/tts";
import { useSettings } from "@/lib/settings";
import { isoDay } from "@/lib/dates";
import { PoolPickerSheet } from "@/components/PoolPickerSheet";
import { FlipCard } from "@/components/exercises/FlipCard";
import { TypedAnswer } from "@/components/exercises/TypedAnswer";
import { AudioQuiz } from "@/components/exercises/AudioQuiz";
import { ClozeSentence } from "@/components/exercises/ClozeSentence";
import type { ExerciseProps, ExerciseResultMeta } from "@/lib/exercises/types";

import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";
import type { Grade, SessionModeId, VocabEntry } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: `${T.review.metaTitleSuffix} — ${APP_CONFIG.appName}` },
      { name: "description", content: T.review.metaDescription },
    ],
  }),
  // ?comeback=true → Mini-Runde nach längerer Pause (siehe lib/comeback.ts).
  validateSearch: (search: Record<string, unknown>): { comeback?: boolean } => ({
    comeback: search.comeback === true || search.comeback === "true" ? true : undefined,
  }),
  component: Review,
});

/** Modus-Id → Komponente. Neue Modi tragen sich hier und in der Registry ein. */
const EXERCISE_COMPONENTS: Record<SessionModeId, (props: ExerciseProps) => React.ReactNode> = {
  flip: FlipCard,
  typed: TypedAnswer,
  audio: AudioQuiz,
  cloze: ClozeSentence,
};

const CONFETTI_COLORS = [
  APP_CONFIG.primaryColor,
  APP_CONFIG.accentColor,
  APP_CONFIG.secondaryColor,
];

/**
 * Session-Host (W2.1): hält Queue, Fortschritt und Statistik und rendert pro
 * Item die Modus-Komponente. Er rechnet selbst nichts am Lernstand —
 * das macht ausschließlich `applyReview()`.
 */
function Review() {
  const { comeback } = Route.useSearch();
  const settings = useSettings();
  const [items, setItems] = useState<SessionItem[]>([]);
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekDaysDone, setWeekDaysDone] = useState(0);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [matured, setMatured] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const submittingRef = useRef<string | null>(null);
  // Antworten je Modus — Grundlage für sessionbezogene Meilensteine.
  const modeStatsRef = useRef<SessionSummary["modes"]>({});

  function loadSession() {
    void (async () => {
      const all = await getVocab();
      setVocab(all);
      const built = await buildSession(comeback ? { cards: pickComebackCards(all) } : {});
      setItems(built);
      setIdx(0);
      setCorrect(0);
      setMatured(0);
      setDone(false);
      setMilestone(null);
      modeStatsRef.current = {};
      submittingRef.current = null;
    })();
  }

  useEffect(() => {
    void (async () => {
      const [all, stats] = await Promise.all([getVocab(), getStats()]);
      setVocab(all);
      setStreak(stats.streak);
      setWeekDaysDone(stats.weekDays.length);
      setItems(await buildSession(comeback ? { cards: pickComebackCards(all) } : {}));
    })();
    // Kein TTS-Prefetch – Audio wird erst beim Abspielen geladen.
  }, [comeback]);

  // Body-Scroll während des Reviews sperren, damit PWA/Browser
  // nicht versucht zu scrollen (Pull-to-Refresh, Adressleisten-Resize)
  // und die horizontale Swipe-Geste sauber funktioniert.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

  const total = items.length;
  const item = items[idx];
  const progress = total === 0 ? 0 : (idx / total) * 100;

  /** Sprachausgabe für alle Modi — eine Stelle, ein freigeschaltetes Element. */
  async function speakText(text: string): Promise<void> {
    await speak(text, createUnlockedAudio());
  }

  function handleResult(grade: Grade, meta: ExerciseResultMeta = {}) {
    if (!item) return;
    const { card, mode } = item;
    // Doppeltipp / doppeltes Feuern auf derselben Karte abfangen.
    if (submittingRef.current === card.id) return;
    submittingRef.current = card.id;

    const isCorrect = grade >= 3;
    const isLast = idx + 1 >= total;
    const perMode = modeStatsRef.current[mode] ?? { total: 0, correct: 0 };
    modeStatsRef.current[mode] = {
      total: perMode.total + 1,
      correct: perMode.correct + (isCorrect ? 1 : 0),
    };

    // --- Optimistisches UI: sofort weiter, keine awaits im Klickpfad. ---
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    if (isCorrect) setCorrect(nextCorrect);
    if (isLast) {
      setDone(true);
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
        colors: [...CONFETTI_COLORS, APP_CONFIG.backgroundColor],
      });
    } else {
      setIdx((i) => i + 1);
      submittingRef.current = null;
    }

    // --- Persistenz im Hintergrund (blockiert das UI nicht). ---
    // applyReview() ist die einzige Stelle, die Boxen/Fälligkeiten rechnet.
    void (async () => {
      let maturedNow = 0;
      try {
        const result = await applyReview(card, grade, mode, Date.now(), meta);
        setStreak(result.stats.streak);
        setWeekDaysDone(result.stats.weekDays.length);
        if (result.matured) {
          maturedNow = 1;
          setMatured((m) => m + 1);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: CONFETTI_COLORS,
          });
        }
      } catch (e) {
        console.error("[review] persist failed", e);
      }
      // Meilensteine erst nach der letzten Antwort prüfen — nie mitten
      // in der Runde (kein Unterbrechen des Flows).
      if (!isLast) return;
      try {
        const fresh = await checkMilestones({
          total,
          correct: nextCorrect,
          matured: matured + maturedNow,
          modes: modeStatsRef.current,
        });
        if (fresh.length > 0) setMilestone(fresh[0]);
      } catch (e) {
        console.error("[review] milestone check failed", e);
      }
    })();
  }

  if (total === 0 && !done) {
    return (
      <>
        <EmptyState
          title={T.review.empty.title}
          subtitle={T.review.empty.subtitle}
          onAdd={() => setPickerOpen(true)}
        />
        <PoolPickerSheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSaved={loadSession}
        />
      </>
    );
  }

  if (done) {
    return (
      <SessionSummaryScreen
        correct={correct}
        total={total}
        matured={matured}
        streak={streak}
        weekDaysDone={weekDaysDone}
        weeklyGoal={settings?.weeklyGoalDays ?? 4}
        milestone={milestone}
        onAgain={loadSession}
      />
    );
  }

  const Exercise = item ? EXERCISE_COMPONENTS[item.mode] : null;

  return (
    <div className="flex h-[100svh] flex-col px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] overscroll-contain">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
          <Flame className="h-4 w-4" /> {streak}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{T.review.progress(idx + 1, total)}</span>
        <span>{item ? T.exercises.modes[item.mode] : ""}</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-ochre"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {item && Exercise && (
        // key: jede Karte startet mit frischem Modus-Zustand (Flip, Eingabe,
        // gewählte Option) — kein Aufblitzen der vorigen Antwort.
        <Exercise
          key={`${item.card.id}-${item.mode}`}
          card={item.card}
          vocab={vocab}
          speak={speakText}
          onResult={handleResult}
        />
      )}
    </div>
  );
}

/**
 * Abschluss-Screen (W2.6). Feiert bewusst das Gefestigte, nicht die XP:
 * „zwei Wörter sitzen jetzt seit über einer Woche" ist die Aussage, auf die
 * es ankommt — die Punktzahl ist nur Beiwerk.
 */
function SessionSummaryScreen({
  correct,
  total,
  matured,
  streak,
  weekDaysDone,
  weeklyGoal,
  milestone,
  onAgain,
}: {
  correct: number;
  total: number;
  matured: number;
  streak: number;
  weekDaysDone: number;
  weeklyGoal: number;
  milestone: Milestone | null;
  onAgain: () => void;
}) {
  // getDay(): 0 = Sonntag → auf die Montag-basierte Beschriftung umrechnen.
  const dayLabel = T.home.week.dayLabels[(new Date().getDay() + 6) % 7];
  const goalReached = weekDaysDone >= weeklyGoal;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="text-7xl"
      >
        🎉
      </motion.div>
      <h1 className="font-display text-3xl font-bold">{T.review.done.headline}</h1>

      {matured > 0 && (
        <p className="max-w-[32ch] text-balance font-medium text-forest">
          {T.review.done.matured(matured)}
        </p>
      )}

      <div className="mt-2 grid w-full max-w-sm grid-cols-3 gap-2">
        <SummaryTile
          label={T.review.done.accuracyLabel}
          value={`${correct}/${total}`}
          tone="bg-forest/10 text-forest"
        />
        <SummaryTile
          label={T.review.done.maturedLabel}
          value={String(matured)}
          tone="bg-teal/10 text-teal"
        />
        <SummaryTile
          label={T.review.done.streakLabel}
          value={String(streak)}
          tone="bg-primary/10 text-primary"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {goalReached
          ? T.review.done.weekReached(weeklyGoal)
          : T.review.done.weekStatus(dayLabel, weekDaysDone, weeklyGoal)}
      </p>

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
          <h2 className="mt-1 font-display text-xl font-bold">{milestone.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
        </motion.div>
      )}

      <div className="mt-4 flex flex-col items-center gap-2">
        <Link
          to="/"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {T.review.done.back}
        </Link>
        <button
          type="button"
          onClick={onAgain}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4"
        >
          {T.review.done.again}
        </button>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl p-3 ${tone}`}>
      <div className="font-display text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  onAdd,
}: {
  title: string;
  subtitle: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="text-6xl">🌴</div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <button
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground active:scale-95"
      >
        <Sparkles className="h-4 w-4" /> {T.review.empty.cta}
      </button>
    </div>
  );
}
