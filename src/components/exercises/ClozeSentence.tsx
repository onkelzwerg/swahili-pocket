import { useMemo, useState } from "react";
import { HelpCircle, Loader2, Volume2 } from "lucide-react";
import { checkAnswer, type CheckResult } from "@/lib/answer-check";
import { makeCloze } from "@/lib/exercises/cloze";
import type { ExerciseProps } from "@/lib/exercises/types";
import { T } from "@/config/translations";
import { AnswerFeedback } from "./AnswerFeedback";
import { useSpeaker } from "./useSpeaker";
import { useAutoFocus } from "./useAutoFocus";

// Modus „Lückensatz" (W2.5). Gleiche Eingabe- und Prüflogik wie „Tippen",
// nur mit Kontext: das Wort steht im Satz, die deutsche Übersetzung darunter.
// Der Satz macht aus dem Vokabelabruf einen Bedeutungsabruf
// (Craik & Lockhart, Levels of Processing).

export function ClozeSentence({ card, onResult, speak }: ExerciseProps) {
  const cloze = useMemo(() => makeCloze(card), [card]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const inputRef = useAutoFocus<HTMLInputElement>(!result);
  const { speaking, play } = useSpeaker(speak);

  // Der Session-Builder wählt diesen Modus nur mit passendem Satz; der
  // Fallback schützt trotzdem vor einer leeren Übung.
  if (!cloze) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
        <h2 className="font-display text-4xl font-bold">{card.swahili}</h2>
        <button
          type="button"
          onClick={() => onResult(3)}
          className="rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
        >
          {T.exercises.feedback.next}
        </button>
      </div>
    );
  }

  function submit(value: string) {
    if (result || !cloze) return;
    setResult(checkAnswer(value, cloze.answer));
  }

  if (result) {
    return (
      <AnswerFeedback
        result={result}
        input={input}
        speakText={cloze.sentence}
        speak={speak}
        onResult={onResult}
      >
        <div className="rounded-2xl bg-muted/50 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{cloze.sentence}</p>
            <button
              type="button"
              disabled={speaking === "sentence"}
              aria-busy={speaking === "sentence"}
              aria-label={T.exercises.cloze.playSentence}
              onClick={() => play("sentence", cloze.sentence)}
              className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ochre/20 text-ochre-foreground"
            >
              {speaking === "sentence" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{cloze.de}</p>
        </div>
      </AnswerFeedback>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center">
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {T.exercises.cloze.prompt}
        </span>
        <p className="font-display text-2xl font-bold leading-snug">
          {cloze.before}
          <span className="mx-0.5 inline-block min-w-[3.5rem] border-b-4 border-primary align-baseline" />
          {cloze.after}
        </p>
        <p className="max-w-[30ch] text-sm text-muted-foreground">{cloze.de}</p>
      </div>

      <form
        className="mt-4 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // Enter explizit abfangen: auf die implizite Formularabsendung ist
          // über die Software-Tastaturen hinweg kein Verlass.
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            submit(input);
          }}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={T.exercises.typed.placeholder}
          aria-label={T.exercises.cloze.prompt}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-center text-base font-medium outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => submit("")}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3.5 text-sm font-semibold text-muted-foreground active:scale-95"
          >
            <HelpCircle className="h-4 w-4" />
            {T.exercises.typed.dontKnow}
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:scale-95"
          >
            {T.exercises.typed.check}
          </button>
        </div>
      </form>
    </div>
  );
}
