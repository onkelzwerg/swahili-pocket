import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Volume2 } from "lucide-react";
import { addVocab, newId } from "@/lib/store";
import { speak } from "@/lib/tts";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";
import type { NounClass, PartOfSpeech, VocabEntry } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/lexicon_/new")({
  head: () => ({
    meta: [
      { title: `${T.newWord.metaTitleSuffix} — ${APP_CONFIG.appName}` },
      { name: "description", content: T.newWord.metaDescription },
    ],
  }),
  component: NewEntry,
});

const POS: PartOfSpeech[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "other",
];
const CLASSES: NounClass[] = ["M-Wa", "M-Mi", "Ki-Vi", "N", "Ji-Ma", "U", "Pa-Ku-Mu", "Ku"];

function NewEntry() {
  const nav = useNavigate();
  const [sw, setSw] = useState("");
  const [de, setDe] = useState("");
  const [pos, setPos] = useState<PartOfSpeech>("noun");
  const [cls, setCls] = useState<NounClass | "">("");
  const [ex1Sw, setEx1Sw] = useState("");
  const [ex1De, setEx1De] = useState("");
  const [ex2Sw, setEx2Sw] = useState("");
  const [ex2De, setEx2De] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!sw.trim() || !de.trim()) return;
    const entry: VocabEntry = {
      id: newId(),
      swahili: sw.trim(),
      german: de.trim(),
      partOfSpeech: pos,
      nounClass: pos === "noun" && cls ? (cls as NounClass) : undefined,
      examples: [
        { sw: ex1Sw.trim(), de: ex1De.trim() },
        { sw: ex2Sw.trim(), de: ex2De.trim() },
      ].filter((x) => x.sw),
      box: 1,
      nextReview: Date.now(),
      createdAt: Date.now(),
    };
    await addVocab(entry);
    nav({ to: "/lexicon" });
  }

  return (
    <div className="px-5 pt-6">
      <Link
        to="/lexicon"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {T.common.back}
      </Link>
      <h1 className="font-display text-3xl font-bold">{T.newWord.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{T.newWord.subtitle}</p>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5">
        <Field label={APP_CONFIG.targetLanguage}>
          <div className="flex gap-2">
            <input
              value={sw}
              onChange={(e) => setSw(e.target.value)}
              required
              className="input"
              placeholder="z.B. mtoto"
            />
            {sw && (
              <button
                type="button"
                onClick={() => speak(sw)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ochre/20 text-ochre-foreground"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </Field>
        <Field label={APP_CONFIG.nativeLanguage}>
          <input
            value={de}
            onChange={(e) => setDe(e.target.value)}
            required
            className="input"
            placeholder="z.B. Kind"
          />
        </Field>

        <Field label={T.newWord.partOfSpeech}>
          <div className="flex flex-wrap gap-2">
            {POS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPos(p)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  pos === p
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        {pos === "noun" && (
          <Field label={T.newWord.nounClass}>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCls("")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${cls === "" ? "border-transparent bg-muted-foreground text-background" : "border-border bg-card text-muted-foreground"}`}
              >
                —
              </button>
              {CLASSES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCls(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    cls === c
                      ? "border-transparent bg-ochre text-ochre-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
        )}

        <fieldset className="rounded-2xl border border-border bg-card p-4">
          <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {T.newWord.example(1)}
          </legend>
          <div className="flex flex-col gap-2">
            <input
              value={ex1Sw}
              onChange={(e) => setEx1Sw(e.target.value)}
              className="input"
              placeholder={T.newWord.examplePlaceholderTarget(APP_CONFIG.targetLanguage)}
            />
            <input
              value={ex1De}
              onChange={(e) => setEx1De(e.target.value)}
              className="input"
              placeholder={T.newWord.examplePlaceholderNative}
            />
          </div>
        </fieldset>
        <fieldset className="rounded-2xl border border-border bg-card p-4">
          <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {T.newWord.example(2)}
          </legend>
          <div className="flex flex-col gap-2">
            <input
              value={ex2Sw}
              onChange={(e) => setEx2Sw(e.target.value)}
              className="input"
              placeholder={T.newWord.examplePlaceholderTarget(APP_CONFIG.targetLanguage)}
            />
            <input
              value={ex2De}
              onChange={(e) => setEx2De(e.target.value)}
              className="input"
              placeholder={T.newWord.examplePlaceholderNative}
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-2 rounded-full bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-md active:scale-[0.98]"
        >
          {T.newWord.saveCta}
        </button>
      </form>

      <style>{`.input{width:100%;border:1px solid var(--color-border);background:var(--color-card);border-radius:1rem;padding:.75rem 1rem;font-size:.9rem;outline:none}.input:focus{border-color:var(--color-primary)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
