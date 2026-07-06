import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

import confetti from "canvas-confetti";
import { Check, X, Volume2, ArrowLeft, Flame, Loader2, Sparkles } from "lucide-react";
import {
  getVocab,
  updateVocab,
  dueToday,
  nextReviewDate,
  recordReview,
  getStats,
} from "@/lib/store";
import { speak } from "@/lib/tts";
import { isMonosyllabicVerb } from "@/lib/seed";
import { PoolPickerSheet } from "@/components/PoolPickerSheet";

import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";
import type { VocabEntry } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: `${T.review.metaTitleSuffix} — ${APP_CONFIG.appName}` },
      { name: "description", content: T.review.metaDescription },
    ],
  }),
  component: Review,
});

function Review() {
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [queue, setQueue] = useState<VocabEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [instantReset, setInstantReset] = useState(false);
  const submittingRef = useRef<string | null>(null);
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  function reloadQueue() {
    getVocab().then((v) => {
      setVocab(v);
      const due = dueToday(v);
      const seen = new Set<string>();
      const unique = due.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
      unique.sort(() => Math.random() - 0.5);
      setQueue(unique);
      setIdx(0);
      setCorrect(0);
      setDone(false);
      setFlipped(false);
    });
  }

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-14, 0, 14]);
  const scale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);
  const correctOpacity = useTransform(x, [15, 90], [0, 1]);
  const wrongOpacity = useTransform(x, [-90, -15], [1, 0]);

  async function swipeOut(dir: 1 | -1) {
    if (isAnimating) return;
    setIsAnimating(true);
    await new Promise<void>((resolve) => {
      animate(x, dir * 600, { duration: 0.22, ease: "easeOut", onComplete: () => resolve() });
    });
    handleAnswer(dir > 0);
    x.set(0);
    setIsAnimating(false);
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    if (isAnimating) return;
    const dx = info.offset.x;
    const vx = info.velocity.x;
    if (dx > 80 || vx > 350) void swipeOut(1);
    else if (dx < -80 || vx < -350) void swipeOut(-1);
  }

  async function playAudio(key: string, text: string) {
    if (speakingKey) return;
    setSpeakingKey(key);
    try {
      await speak(text);
    } finally {
      setSpeakingKey(null);
    }
  }

  useEffect(() => {
    Promise.all([getVocab(), getStats()]).then(([v, s]) => {
      setVocab(v);
      const due = dueToday(v);
      // Dedupe defensively by id, then shuffle.
      const seen = new Set<string>();
      const unique = due.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
      unique.sort(() => Math.random() - 0.5);
      setQueue(unique);
      setStreak(s.streak);
      // Kein TTS-Prefetch – API wird erst beim Klick auf den Lautsprecher-Button aufgerufen.
    });
  }, []);

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

  const total = queue.length;
  const card = queue[idx];
  const progress = total === 0 ? 0 : (idx / total) * 100;

  function handleAnswer(isCorrect: boolean) {
    if (!card) return;
    // Guard against double-tap / double-fire on the same card.
    if (submittingRef.current === card.id) return;
    submittingRef.current = card.id;

    const newBox = (isCorrect ? Math.min(5, card.box + 1) : 1) as VocabEntry["box"];
    const nextReview = nextReviewDate(newBox);
    const cardId = card.id;
    const isLast = idx + 1 >= total;

    // --- Optimistic UI: advance immediately, no awaits in the click path. ---
    setVocab((prev) => prev.map((v) => (v.id === cardId ? { ...v, box: newBox, nextReview } : v)));
    if (isCorrect) setCorrect((c) => c + 1);
    if (isLast) {
      setFlipped(false);
      setDone(true);
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
        colors: [
          APP_CONFIG.primaryColor,
          APP_CONFIG.accentColor,
          APP_CONFIG.secondaryColor,
          APP_CONFIG.backgroundColor,
        ],
      });
    } else {
      // Flip-Transition für den Kartenwechsel unterdrücken,
      // damit die Rückseite (Übersetzung) der nächsten Karte nicht kurz aufblitzt.
      setInstantReset(true);
      setFlipped(false);
      setIdx((i) => i + 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setInstantReset(false));
      });
    }
    if (isCorrect && newBox === 5) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [APP_CONFIG.primaryColor, APP_CONFIG.accentColor, APP_CONFIG.secondaryColor],
      });
    }

    // --- Background persistence (don't block UI). ---
    void (async () => {
      try {
        await updateVocab(cardId, { box: newBox, nextReview });
        const stats = await recordReview(isCorrect, { vocabId: cardId, newBox, nextReview });
        setStreak(stats.streak);
      } catch (e) {
        console.error("[review] persist failed", e);
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
          onSaved={reloadQueue}
        />
      </>
    );
  }

  if (done) {
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
        <p className="text-muted-foreground">{T.review.done.summary(correct, total, streak)}</p>
        <Link
          to="/"
          className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {T.review.done.back}
        </Link>
      </div>
    );
  }

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
        <span>{card ? T.review.box(card.box) : ""}</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-ochre"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <motion.div
          className="flip-card mx-auto h-full w-full relative touch-none select-none"
          style={{ x, rotate, scale }}
          drag={flipped ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          dragMomentum={false}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
          onDragEnd={handleDragEnd}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Swipe-Hints */}
          <motion.div
            style={{ opacity: correctOpacity }}
            className="pointer-events-none absolute top-4 right-4 z-10 rounded-full bg-forest px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-forest-foreground shadow-lg"
          >
            {T.review.swipeHintCorrect}
          </motion.div>
          <motion.div
            style={{ opacity: wrongOpacity }}
            className="pointer-events-none absolute top-4 left-4 z-10 rounded-full bg-destructive px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-destructive-foreground shadow-lg"
          >
            {T.review.swipeHintWrong}
          </motion.div>
          <div
            className={`flip-inner ${flipped ? "flipped" : ""}`}
            data-instant={instantReset || undefined}
          >
            {/* FRONT */}
            <div className="flip-face rounded-3xl bg-gradient-to-br from-primary to-ochre p-5 text-primary-foreground shadow-xl flex flex-col">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary-foreground/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {card?.partOfSpeech}
                  {card?.nounClass ? ` · ${card.nounClass}` : ""}
                  {card && card.partOfSpeech === "verb" && isMonosyllabicVerb(card.swahili)
                    ? ` · ${T.review.monosyllabic}`
                    : ""}
                </span>
                <button
                  type="button"
                  disabled={speakingKey === "front"}
                  aria-busy={speakingKey === "front"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (card) void playAudio("front", card.swahili);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20"
                >
                  {speakingKey === "front" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center text-center">
                <h2 className="font-display text-5xl font-bold leading-tight">{card?.swahili}</h2>
              </div>
              <p className="text-center text-sm opacity-80">{T.review.flipHint}</p>
            </div>

            {/* BACK */}
            <div className="flip-face flip-back rounded-3xl bg-card p-5 shadow-xl border border-border flex flex-col">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-forest/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
                  {T.review.translationLabel}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto text-center touch-pan-y">
                <h2 className="font-display text-3xl font-bold">{card?.german}</h2>
                {card?.examples?.[0] && (
                  <div className="mt-4 w-full space-y-2 text-left">
                    {card.examples.slice(0, 2).map((ex, i) => (
                      <div key={i} className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{ex.sw}</p>
                          <button
                            type="button"
                            disabled={speakingKey === `ex-${i}`}
                            aria-busy={speakingKey === `ex-${i}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              void playAudio(`ex-${i}`, ex.sw);
                            }}
                            className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ochre/20 text-ochre-foreground"
                          >
                            {speakingKey === `ex-${i}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{ex.de}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-muted-foreground">{T.review.howDidYouKnow}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Buttons immer im Layout reservieren, damit Vorder- und Rückseite gleich groß bleiben. */}
      <motion.div
        animate={{ opacity: flipped ? 1 : 0, y: flipped ? 0 : 16 }}
        initial={false}
        transition={{ duration: 0.2 }}
        aria-hidden={!flipped}
        className="mt-6 flex gap-3"
      >
        <button
          onClick={() => void swipeOut(-1)}
          disabled={!flipped || isAnimating}
          tabIndex={flipped ? 0 : -1}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-destructive py-4 text-base font-semibold text-destructive-foreground active:scale-95 disabled:pointer-events-none"
        >
          <X className="h-5 w-5" /> {T.review.wrong}
        </button>
        <button
          onClick={() => void swipeOut(1)}
          disabled={!flipped || isAnimating}
          tabIndex={flipped ? 0 : -1}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest py-4 text-base font-semibold text-forest-foreground active:scale-95 disabled:pointer-events-none"
        >
          <Check className="h-5 w-5" /> {T.review.correct}
        </button>
      </motion.div>
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
        <Sparkles className="h-4 w-4" /> Lernkarten aus dem Pool hinzufügen
      </button>
    </div>
  );
}
