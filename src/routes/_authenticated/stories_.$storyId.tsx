import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Check, Eye, EyeOff, Play } from "lucide-react";
import { getVocab, awardXp } from "@/lib/store";
import {
  groupStorySegments,
  loadStory,
  markStoryRead,
  type Story,
  type StorySegment,
} from "@/lib/stories";
import { checkMilestones, type Milestone } from "@/lib/milestones";
import { speak, createUnlockedAudio } from "@/lib/tts";
import { GlossSheet } from "@/components/GlossSheet";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/stories_/$storyId")({
  component: StoryReader,
});

/** XP für eine gelesene Geschichte (Plan W3.3). */
const STORY_XP = 20;

/** Reiner Leerraum zwischen zwei Wortgruppen — die einzige Umbruchstelle. */
function isSpaceGroup(group: StorySegment[]): boolean {
  return group.length === 1 && !group[0].word && /^\s+$/.test(group[0].text);
}

/**
 * Reader (W3.3).
 *
 * Der Text wird als Tokens gerendert, nie als HTML aus dem JSON — jedes Wort
 * ist ein <button>, alles bleibt Text (XSS-sauber und nebenbei antippbar).
 * Die Übersetzung liegt pro Absatz eingeklappt darunter: erst selbst
 * verstehen, dann prüfen.
 */
function StoryReader() {
  const { storyId } = Route.useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [usedGerman, setUsedGerman] = useState(false);
  const [openWord, setOpenWord] = useState<string | null>(null);
  const [ownWords, setOwnWords] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    void (async () => {
      const [loaded, vocab] = await Promise.all([loadStory(storyId), getVocab()]);
      setStory(loaded);
      setOwnWords(new Set(vocab.map((v) => v.swahili.toLowerCase())));
      setLoading(false);
    })();
  }, [storyId]);

  const newLemmas = useMemo(() => new Set(story?.newLemmas ?? []), [story]);

  function toggleGerman(index: number) {
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else {
        next.add(index);
        // Einmal aufgedeckt zählt für die ganze Geschichte — der Meilenstein
        // fragt „ohne Hilfe gelesen", nicht „gerade nichts offen".
        setUsedGerman(true);
      }
      return next;
    });
  }

  async function finish() {
    if (!story) return;
    setDone(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: [APP_CONFIG.primaryColor, APP_CONFIG.accentColor, APP_CONFIG.secondaryColor],
    });
    try {
      await markStoryRead(story.id);
      await awardXp(STORY_XP);
      const fresh = await checkMilestones({ story: { unaided: !usedGerman } });
      if (fresh.length > 0) setMilestone(fresh[0]);
    } catch (e) {
      console.error("[stories] finish failed", e);
    }
  }

  if (loading) {
    return <p className="px-5 pt-8 text-sm text-muted-foreground">{T.common.loading}</p>;
  }

  if (!story) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">{T.stories.reader.notFound}</p>
        <Link to="/stories" className="mt-3 inline-block text-sm font-semibold text-primary">
          {T.stories.done.back}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <StoryDoneScreen
        story={story}
        unaided={!usedGerman}
        milestone={milestone}
        onBack={() => void navigate({ to: "/stories" })}
      />
    );
  }

  const gloss = openWord ? story.glosses[openWord] : null;

  return (
    <div className="px-5 pt-6 pb-8">
      <header className="mb-4 flex items-start gap-3">
        <Link
          to="/stories"
          aria-label={T.stories.reader.backAria}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold leading-tight">
            {story.emoji} {story.title}
          </h1>
          <p className="text-sm text-muted-foreground">{story.titleDe}</p>
        </div>
      </header>

      <p className="mb-4 text-xs text-muted-foreground">{T.stories.reader.hint}</p>

      <div className="flex flex-col gap-5">
        {story.paragraphs.map((paragraph, i) => (
          <section key={i} className="rounded-2xl border border-border bg-card p-4">
            {/* Gruppiert, damit ein Satzzeichen nicht ohne sein Wort umbricht. */}
            <p className="font-display text-lg leading-relaxed">
              {groupStorySegments(paragraph.sw).map((group, g) =>
                isSpaceGroup(group) ? (
                  // Der Leerraum bleibt umbruchfähig — nur er darf brechen.
                  <span key={g}>{group[0].text}</span>
                ) : (
                  <span key={g} className="whitespace-nowrap">
                    {group.map((segment, j) =>
                      segment.word ? (
                        <button
                          key={j}
                          type="button"
                          onClick={() => setOpenWord(segment.word)}
                          className={`rounded transition-colors active:bg-primary/15 ${
                            newLemmas.has(story.glosses[segment.word]?.lemma ?? "")
                              ? "underline decoration-dotted decoration-ochre underline-offset-4"
                              : ""
                          }`}
                        >
                          {segment.text}
                        </button>
                      ) : (
                        <span key={j}>{segment.text}</span>
                      ),
                    )}
                  </span>
                ),
              )}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleGerman(i)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
              >
                {shown.has(i) ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {shown.has(i) ? T.stories.reader.hideGerman : T.stories.reader.showGerman}
              </button>
              <button
                type="button"
                aria-label={T.stories.reader.playAria}
                onClick={() => void speak(paragraph.sw, createUnlockedAudio())}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
              >
                <Play className="h-3 w-3" />
              </button>
            </div>

            {shown.has(i) && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 overflow-hidden border-t border-border/60 pt-2 text-sm text-muted-foreground"
              >
                {paragraph.de}
              </motion.p>
            )}
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void finish()}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
      >
        <Check className="h-4 w-4" /> {T.stories.reader.finish}
      </button>

      <GlossSheet
        token={openWord}
        gloss={gloss}
        isNew={!!gloss && newLemmas.has(gloss.lemma)}
        inCards={!!gloss && ownWords.has(gloss.lemma)}
        onClose={() => setOpenWord(null)}
        onAdded={(lemma) => setOwnWords((prev) => new Set(prev).add(lemma))}
      />
    </div>
  );
}

function StoryDoneScreen({
  story,
  unaided,
  milestone,
  onBack,
}: {
  story: Story;
  unaided: boolean;
  milestone: Milestone | null;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="text-7xl"
      >
        {story.emoji}
      </motion.div>
      <h1 className="font-display text-3xl font-bold">{T.stories.done.headline}</h1>
      <p className="max-w-[32ch] text-balance text-sm text-muted-foreground">
        {T.stories.done.body(story.titleDe)}
      </p>
      {unaided && (
        <p className="max-w-[32ch] text-balance font-medium text-forest">
          {T.stories.done.unaided}
        </p>
      )}
      <span className="mt-1 rounded-full bg-ochre/15 px-3 py-1 text-sm font-bold text-ochre-foreground">
        {T.stories.reader.xp(STORY_XP)}
      </span>

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

      <button
        type="button"
        onClick={onBack}
        className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        {T.stories.done.back}
      </button>
    </div>
  );
}
