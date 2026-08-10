import { SpeakButton } from "tanstack_start_ts";

export const Sizes = () => (
  <div className="flex items-center gap-4">
    <SpeakButton text="rafiki" size="sm" />
    <SpeakButton text="rafiki" size="md" />
  </div>
);

export const InVocabRow = () => (
  <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
    <div>
      <p className="font-display text-lg">chakula</p>
      <p className="text-sm text-muted-foreground">Essen</p>
    </div>
    <SpeakButton text="chakula" label="Aussprache von chakula anhören" />
  </div>
);
