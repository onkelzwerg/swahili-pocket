import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Loader2, Volume2 } from "lucide-react";
import { previewGrades } from "@/lib/srs";
import type { GradePreview } from "@/lib/srs/types";
import type { ExerciseProps } from "@/lib/exercises/types";
import { isMonosyllabicVerb } from "@/lib/seed";
import type { Grade } from "@/lib/types";
import { T } from "@/config/translations";
import { GradeButtons } from "./GradeButtons";
import { useSpeaker } from "./useSpeaker";

// Modus „Karte" — der Bestandsmodus, aus review.tsx herausgelöst (W2.1).
// Verhalten bewusst unverändert: Umdrehen per Tipp, Wischen für die schnellen
// Stufen, vier Buttons mit Intervall-Vorschau.

export function FlipCard({ card, onResult, speak }: ExerciseProps) {
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<GradePreview | null>(null);
  const { speaking, play } = useSpeaker(speak);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-14, 0, 14]);
  const scale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);
  const correctOpacity = useTransform(x, [15, 90], [0, 1]);
  const wrongOpacity = useTransform(x, [-90, -15], [1, 0]);

  // Intervall-Vorschau für den aktiven Scheduler.
  useEffect(() => {
    let alive = true;
    void previewGrades(card).then((p) => {
      if (alive) setPreview(p);
    });
    return () => {
      alive = false;
    };
  }, [card]);

  // Swipe bleibt bewusst zweistufig: links = Nochmal (1), rechts = Gut (3).
  // Das ist der eingespielte Flow für schnelle Runden — "Schwer" und
  // "Einfach" sind die bewusste Entscheidung und brauchen einen Button.
  // Bitte nicht "vereinheitlichen".
  async function swipeOut(dir: 1 | -1) {
    if (busy) return;
    setBusy(true);
    await new Promise<void>((resolve) => {
      animate(x, dir * 600, { duration: 0.22, ease: "easeOut", onComplete: () => resolve() });
    });
    onResult(dir > 0 ? 3 : 1);
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    if (busy) return;
    const dx = info.offset.x;
    const vx = info.velocity.x;
    if (dx > 80 || vx > 350) void swipeOut(1);
    else if (dx < -80 || vx < -350) void swipeOut(-1);
  }

  function handleGrade(grade: Grade) {
    if (busy) return;
    if (grade === 1) void swipeOut(-1);
    else if (grade === 3) void swipeOut(1);
    else {
      setBusy(true);
      onResult(grade);
    }
  }

  return (
    <>
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
          <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
            {/* FRONT */}
            <div className="flip-face rounded-3xl bg-gradient-to-br from-primary to-ochre p-5 text-primary-foreground shadow-xl flex flex-col">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary-foreground/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {card.partOfSpeech}
                  {card.nounClass ? ` · ${card.nounClass}` : ""}
                  {card.partOfSpeech === "verb" && isMonosyllabicVerb(card.swahili)
                    ? ` · ${T.review.monosyllabic}`
                    : ""}
                </span>
                <button
                  type="button"
                  disabled={speaking === "front"}
                  aria-busy={speaking === "front"}
                  onClick={(e) => {
                    e.stopPropagation();
                    play("front", card.swahili);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20"
                >
                  {speaking === "front" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center text-center">
                <h2 className="font-display text-5xl font-bold leading-tight">{card.swahili}</h2>
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
                <h2 className="font-display text-3xl font-bold">{card.german}</h2>
                {card.examples?.[0] && (
                  <div className="mt-4 w-full space-y-2 text-left">
                    {card.examples.slice(0, 2).map((ex, i) => (
                      <div key={i} className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{ex.sw}</p>
                          <button
                            type="button"
                            disabled={speaking === `ex-${i}`}
                            aria-busy={speaking === `ex-${i}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              play(`ex-${i}`, ex.sw);
                            }}
                            className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ochre/20 text-ochre-foreground"
                          >
                            {speaking === `ex-${i}` ? (
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
      <GradeButtons preview={preview} visible={flipped} disabled={busy} onGrade={handleGrade} />
    </>
  );
}
