import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Volume2, X, PencilLine } from "lucide-react";
import type { CheckResult } from "@/lib/answer-check";
import { highlightCorrection } from "@/lib/answer-check";
import type { Grade } from "@/lib/types";
import type { ExerciseResultMeta } from "@/lib/exercises/types";
import { T } from "@/config/translations";
import { useSpeaker } from "./useSpeaker";
import { useAutoFocus } from "./useAutoFocus";

// Gemeinsame Ergebnis-Karte für alle Modi mit freier Eingabe
// (Tippen W2.3, Lückensatz W2.5) — eine Darstellung, eine Bewertungslogik.
//
// Bewertung:
//   exact → Nutzer entscheidet Gut/Einfach (er weiß am besten, wie leicht es war)
//   typo  → fest Gut. Ein fehlender Buchstabe ist kein Wissensproblem.
//   wrong → fest Nochmal, mit Escape-Hatch für Übersetzungen, die die
//           Datenbank nicht kennt (wird als override im Log markiert).

const STYLES: Record<
  CheckResult["verdict"],
  { card: string; badge: string; icon: React.ReactNode }
> = {
  exact: {
    card: "border-forest/40 bg-forest/10",
    badge: "bg-forest text-forest-foreground",
    icon: <Check className="h-4 w-4" />,
  },
  typo: {
    card: "border-ochre/40 bg-ochre/10",
    badge: "bg-ochre text-ochre-foreground",
    icon: <PencilLine className="h-4 w-4" />,
  },
  wrong: {
    card: "border-destructive/40 bg-destructive/10",
    badge: "bg-destructive text-destructive-foreground",
    icon: <X className="h-4 w-4" />,
  },
};

const HEADLINE: Record<CheckResult["verdict"], string> = {
  exact: T.exercises.feedback.exact,
  typo: T.exercises.feedback.typo,
  wrong: T.exercises.feedback.wrong,
};

export interface AnswerFeedbackProps {
  result: CheckResult;
  /** Rohe Nutzereingabe (leer = „Weiß nicht"). */
  input: string;
  /** Text, der beim Antippen des Lautsprechers gesprochen wird. */
  speakText: string;
  speak(text: string): Promise<void>;
  onResult(grade: Grade, meta?: ExerciseResultMeta): void;
  /** Zusatzinhalt unter der Lösung, z. B. der ganze Lückensatz. */
  children?: React.ReactNode;
}

export function AnswerFeedback({
  result,
  input,
  speakText,
  speak,
  onResult,
  children,
}: AnswerFeedbackProps) {
  const [overridden, setOverridden] = useState(false);
  const { speaking, play } = useSpeaker(speak);
  // Enter führt direkt weiter — die Runde bleibt komplett tastaturbedienbar.
  const goodRef = useAutoFocus<HTMLButtonElement>(result.verdict === "exact");
  const nextRef = useAutoFocus<HTMLButtonElement>(result.verdict !== "exact");
  const style = STYLES[result.verdict];
  const correction = result.verdict === "typo" ? highlightCorrection(input, result.expected) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      <div className={`rounded-3xl border p-5 ${style.card}`}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
        >
          {style.icon}
          {HEADLINE[result.verdict]}
        </span>

        <div className="mt-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl font-bold leading-tight">
            {correction
              ? correction.map((c, i) => (
                  <span key={i} className={c.changed ? "text-ochre-foreground underline" : ""}>
                    {c.char}
                  </span>
                ))
              : result.expected}
          </h2>
          <button
            type="button"
            disabled={speaking === "answer"}
            aria-busy={speaking === "answer"}
            aria-label={T.exercises.audio.listenAria}
            onClick={() => play("answer", speakText)}
            className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/70"
          >
            {speaking === "answer" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>

        {result.verdict !== "exact" && (
          <p className="mt-2 text-sm text-muted-foreground">
            {input.trim()
              ? T.exercises.feedback.yourAnswer(input.trim())
              : T.exercises.feedback.noAnswer}
          </p>
        )}
      </div>

      {children}

      <div className="mt-auto flex flex-col gap-2">
        {result.verdict === "exact" ? (
          <>
            <p className="text-center text-xs text-muted-foreground">
              {T.exercises.feedback.howEasy}
            </p>
            <div className="flex gap-2">
              <button
                ref={goodRef}
                type="button"
                onClick={() => onResult(3)}
                className="flex-1 rounded-2xl bg-forest py-3.5 text-sm font-semibold text-forest-foreground active:scale-95"
              >
                {T.review.grades[3]}
              </button>
              <button
                type="button"
                onClick={() => onResult(4)}
                className="flex-1 rounded-2xl bg-teal py-3.5 text-sm font-semibold text-teal-foreground active:scale-95"
              >
                {T.review.grades[4]}
              </button>
            </div>
          </>
        ) : (
          <>
            {result.verdict === "wrong" && (
              <button
                type="button"
                onClick={() => {
                  if (overridden) return;
                  setOverridden(true);
                  onResult(3, { override: true });
                }}
                className="self-center text-xs font-medium text-muted-foreground underline underline-offset-4"
              >
                {overridden ? T.exercises.feedback.overridden : T.exercises.feedback.override}
              </button>
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={() => onResult(result.verdict === "typo" ? 3 : 1)}
              className="rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:scale-95"
            >
              {T.exercises.feedback.next}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
