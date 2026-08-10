import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { checkAnswer, type CheckResult } from "@/lib/answer-check";
import type { ExerciseProps } from "@/lib/exercises/types";
import { T } from "@/config/translations";
import { AnswerFeedback } from "./AnswerFeedback";
import { useAutoFocus } from "./useAutoFocus";

// Modus „Tippen" (W2.3): Deutsch → Swahili selbst schreiben.
// Produktion statt Rekognition — der wirksamste Abruf, aber nur für Karten,
// die schon erkannt werden (siehe lib/exercises/typed.ts).

export function TypedAnswer({ card, onResult, speak }: ExerciseProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const inputRef = useAutoFocus<HTMLInputElement>(!result);

  function submit(value: string) {
    if (result) return;
    setResult(checkAnswer(value, card.swahili));
  }

  if (result) {
    return (
      <AnswerFeedback
        result={result}
        input={input}
        speakText={card.swahili}
        speak={speak}
        onResult={onResult}
      >
        <div className="rounded-2xl bg-muted/50 p-4">
          <p className="text-sm font-medium">{card.german}</p>
        </div>
      </AnswerFeedback>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center">
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {T.exercises.typed.prompt}
        </span>
        <h2 className="font-display text-4xl font-bold leading-tight">{card.german}</h2>
        {card.partOfSpeech && (
          <span className="text-xs text-muted-foreground">
            {card.partOfSpeech}
            {card.nounClass ? ` · ${card.nounClass}` : ""}
          </span>
        )}
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
          // Autokorrektur würde Swahili-Wörter zu deutschen umschreiben;
          // text-base (16px) verhindert den iOS-Zoom beim Fokussieren.
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={T.exercises.typed.placeholder}
          aria-label={T.exercises.typed.prompt}
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
