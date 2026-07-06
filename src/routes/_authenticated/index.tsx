import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Sparkles, ArrowRight, BookMarked } from "lucide-react";
import { getStats, getVocab, dueToday } from "@/lib/store";
import { phraseOfDay } from "@/lib/seed";
import { SpeakButton } from "@/components/SpeakButton";
import type { UserStats, VocabEntry } from "@/lib/types";
import { getLevelProgress } from "@/lib/levels";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: `${APP_CONFIG.appName} — ${T.home.metaTitleSuffix}` },
      { name: "description", content: T.home.metaDescription },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return T.home.greetings.morning;
  if (h < 17) return T.home.greetings.day;
  return T.home.greetings.evening;
}

function Dashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  // Spruch des Tages rotiert über den Tag im Jahr.
  const [phrase] = useState<{ sw: string; de: string }>(() => {
    const start = new Date(new Date().getFullYear(), 0, 0).getTime();
    const day = Math.floor((Date.now() - start) / 86400000);
    return phraseOfDay[day % phraseOfDay.length];
  });

  useEffect(() => {
    Promise.all([getStats(), getVocab()]).then(([s, v]) => {
      setStats(s);
      setVocab(v);
    });
  }, []);

  const due = dueToday(vocab);
  const mastered = vocab.filter((v) => v.box === 5).length;
  const today = new Date();
  const learnedToday = vocab.filter((v) => {
    const ts = v.updatedAt ?? v.createdAt;
    const d = new Date(ts);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;
  // Sprachlevel basiert auf CEFR-Wortschatzforschung: jede Vokabel zählt
  // als "gelerntes Wort" — Teilstufen halten die Fortschrittsschritte motivierend klein.
  const knownWords = vocab.length;
  const lvl = getLevelProgress(knownWords);
  const greet = greeting();

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">{greet.de}</p>
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
          {greet.sw}!
        </h1>
      </header>

      <Link to="/review">
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ochre/30 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium opacity-90">{T.home.dueToday}</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-display text-6xl font-bold leading-none">{due.length}</span>
              <span className="mb-1 text-sm opacity-90">{T.home.cards}</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-semibold">
              {due.length > 0 ? T.home.practiceNow : T.home.allDone}{" "}
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </Link>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Flame className="h-5 w-5 text-primary" />}
          value={stats?.streak ?? 0}
          label={T.home.stats.streak}
        />
        <StatCard
          icon={<BookMarked className="h-5 w-5 text-forest" />}
          value={learnedToday}
          label={T.home.stats.words}
          to="/words/today"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-ochre" />}
          value={mastered}
          label={T.home.stats.mastered}
          to="/words/mastered"
        />
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {T.home.level.eyebrow(lvl.current.name)}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {lvl.next
              ? T.home.level.progress(lvl.wordsInLevel, lvl.wordsForNextLevel)
              : T.home.level.total(lvl.knownWords)}
          </span>
        </div>
        <p className="mb-3 text-sm font-medium text-foreground">{lvl.current.label}</p>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${lvl.progress * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-ochre"
          />
        </div>
        {lvl.next && (
          <p className="mt-2 text-xs text-muted-foreground">
            {T.home.level.next(lvl.next.threshold - lvl.knownWords, lvl.next.name, lvl.next.label)}
          </p>
        )}
      </div>

      <div className="rounded-3xl bg-forest p-5 text-forest-foreground">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
          <Sparkles className="h-4 w-4" /> {T.home.phrase.eyebrow}
        </div>
        <p className="mt-3 font-display text-xl font-semibold leading-snug">"{phrase.sw}"</p>
        <p className="mt-2 text-sm opacity-90">{phrase.de}</p>
        <div className="mt-3">
          <SpeakButton
            text={phrase.sw}
            className="bg-forest-foreground/15 text-forest-foreground hover:bg-forest-foreground/25"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  to,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  to?: "/words/today" | "/words/mastered";
}) {
  const inner = (
    <>
      {icon}
      <div className="font-display text-2xl font-bold leading-none">{value}</div>
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
    </>
  );
  const cls =
    "flex flex-col items-start gap-1 rounded-2xl border border-border bg-card p-3 active:scale-95 transition-transform";
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}
