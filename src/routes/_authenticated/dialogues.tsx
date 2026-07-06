import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowLeft } from "lucide-react";
import { dialogues as seedDialogues } from "@/lib/seed";
import { extraDialogues } from "@/lib/dialogues-extra";
import { speakSequence, cancelSpeech, speak } from "@/lib/tts";
import { T } from "@/config/translations";
import type { Dialogue } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dialogues")({
  head: () => ({
    meta: [
      { title: T.dialogues.metaTitle },
      { name: "description", content: T.dialogues.metaDescription },
    ],
  }),
  component: DialoguesPage,
});

const all: Dialogue[] = [...extraDialogues, ...seedDialogues];

function DialoguesPage() {
  const [open, setOpen] = useState<string | null>(null);
  const active = all.find((d) => d.id === open);

  return (
    <div className="px-5 pt-8">
      <header className="mb-5">
        <p className="text-sm font-medium text-muted-foreground">{T.dialogues.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.dialogues.title}</h1>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {all.map((d) => (
          <li key={d.id}>
            <button
              onClick={() => setOpen(d.id)}
              className="flex h-full w-full flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left active:scale-[0.98]"
            >
              <span className="text-3xl">{d.emoji}</span>
              <div>
                <h3 className="font-display text-base font-semibold leading-tight">{d.title}</h3>
                <p className="text-[11px] text-muted-foreground">{d.titleDe}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="mx-auto flex h-full max-w-md flex-col"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <button
                  onClick={() => {
                    cancelSpeech();
                    setOpen(null);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <h2 className="font-display text-lg font-semibold leading-none">
                    {active.emoji} {active.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">{active.titleDe}</p>
                </div>
                <button
                  onClick={() => speakSequence(active.turns.map((t) => t.sw))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-label={T.dialogues.playAllAria}
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <ul className="flex flex-col gap-3">
                  {active.turns.map((t, i) => {
                    const align =
                      t.speaker === "B"
                        ? "justify-end"
                        : t.speaker === "C"
                          ? "justify-center"
                          : "justify-start";
                    const bubble =
                      t.speaker === "B"
                        ? "bg-forest text-forest-foreground rounded-br-sm"
                        : t.speaker === "C"
                          ? "bg-ochre/20 text-ochre-foreground border border-ochre/40"
                          : "bg-card border border-border rounded-bl-sm";
                    const btn =
                      t.speaker === "B"
                        ? "bg-forest-foreground/20"
                        : "bg-ochre/30 text-ochre-foreground";
                    const subtle = t.speaker === "B" ? "opacity-80" : "text-muted-foreground";
                    return (
                      <li key={i} className={`flex ${align}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${bubble}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-semibold opacity-70">
                                {T.dialogues.speaker(t.speaker)}
                              </p>
                              <p className="font-display text-base font-semibold">{t.sw}</p>
                            </div>
                            <button
                              onClick={() => speak(t.sw)}
                              className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full ${btn}`}
                            >
                              <Play className="h-3 w-3" />
                            </button>
                          </div>
                          <p className={`mt-1 text-xs ${subtle}`}>{t.de}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
