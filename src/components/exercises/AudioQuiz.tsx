import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Volume2, X } from "lucide-react";
import { pickDistractors } from "@/lib/exercises/audio";
import type { ExerciseProps } from "@/lib/exercises/types";
import { shuffle } from "@/lib/utils";
import { T } from "@/config/translations";
import { useSpeaker } from "./useSpeaker";
import { useAutoFocus } from "./useAutoFocus";

// Modus „Hören" (W2.4): Wort hören, Bedeutung wählen.
// Der einzige Modus, der die Schriftform komplett weglässt — wer Swahili nur
// gelesen kennt, erkennt es gesprochen oft nicht wieder.

export function AudioQuiz({ card, vocab, onResult, speak }: ExerciseProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const { speaking, play } = useSpeaker(speak);

  const options = useMemo(
    () => shuffle([card, ...pickDistractors(card, vocab)]),
    // Bewusst nur an der Karte hängend: neu mischen bei jedem vocab-Update
    // würde die Optionen unter dem Finger des Nutzers vertauschen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card.id],
  );

  // Beim Anzeigen einmal automatisch abspielen. Auf iOS kann das ohne
  // Nutzergeste stumm bleiben — dafür ist der große Replay-Button da.
  useEffect(() => {
    play("word", card.swahili);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  const isCorrect = picked === card.id;
  const goodRef = useAutoFocus<HTMLButtonElement>(isCorrect);
  const nextRef = useAutoFocus<HTMLButtonElement>(picked !== null && !isCorrect);

  function choose(id: string) {
    if (picked) return;
    setPicked(id);
    if (id !== card.id) {
      // Falsch: Wort noch einmal vorlesen, während die Lösung sichtbar ist.
      play("word", card.swahili);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 text-center">
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {T.exercises.audio.prompt}
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => play("word", card.swahili)}
          aria-label={T.exercises.audio.replay}
          aria-busy={speaking === "word"}
          className="inline-flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-ochre text-primary-foreground shadow-xl"
        >
          {speaking === "word" ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : (
            <Volume2 className="h-12 w-12" />
          )}
        </motion.button>
        <p className="text-xs text-muted-foreground">{T.exercises.audio.replay}</p>
        {picked && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-2xl font-bold"
          >
            {card.swahili}
          </motion.p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {options.map((opt) => {
          const isAnswer = opt.id === card.id;
          const isPicked = picked === opt.id;
          const revealed = picked !== null;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={revealed}
              onClick={() => choose(opt.id)}
              className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors active:scale-[0.98] disabled:active:scale-100 ${
                revealed && isAnswer
                  ? "border-forest bg-forest/15 text-forest"
                  : revealed && isPicked
                    ? "border-destructive bg-destructive/15 text-destructive"
                    : "border-border bg-card"
              }`}
            >
              {opt.german}
              {revealed && isAnswer && <Check className="h-4 w-4 shrink-0" />}
              {revealed && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-3 flex flex-col gap-2">
          {isCorrect ? (
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
            <button
              ref={nextRef}
              type="button"
              onClick={() => onResult(1)}
              className="rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:scale-95"
            >
              {T.exercises.feedback.next}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
