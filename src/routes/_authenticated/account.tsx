import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Upload, Trash2, HardDrive, Flame, Trophy, Layers } from "lucide-react";
import { toast } from "sonner";
import { exportBackup, importBackup, resetAllData } from "@/lib/backup";
import { getStats, getVocab } from "@/lib/store";
import { changelog } from "@/lib/changelog";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";
import type { UserStats } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [{ title: T.settings.metaTitle }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [cardCount, setCardCount] = useState(0);
  const [showOlder, setShowOlder] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getStats(), getVocab()]).then(([s, v]) => {
      setStats(s);
      setCardCount(v.length);
    });
  }, []);

  async function handleImport(file: File) {
    try {
      const { vocabCount } = await importBackup(file);
      toast.success(T.settings.toasts.imported(vocabCount));
      const [s, v] = await Promise.all([getStats(), getVocab()]);
      setStats(s);
      setCardCount(v.length);
    } catch (e) {
      toast.error(T.settings.toasts.importFailed, {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  async function handleReset() {
    await resetAllData();
    toast.success(T.settings.toasts.resetDone);
    setConfirmReset(false);
    const [s, v] = await Promise.all([getStats(), getVocab()]);
    setStats(s);
    setCardCount(v.length);
  }

  const visibleChangelog = showOlder ? changelog : changelog.slice(0, 1);

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">{APP_CONFIG.appName}</p>
        <h1 className="font-display text-3xl font-bold">{T.settings.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.settings.subtitle}</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Layers className="h-5 w-5 text-primary" />}
          value={cardCount}
          label={T.settings.statCards}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-ochre" />}
          value={stats?.streak ?? 0}
          label={T.settings.statStreak}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-forest" />}
          value={stats?.xp ?? 0}
          label={T.settings.statXp}
        />
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {T.settings.backup.heading}
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{T.settings.backup.hint}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => void exportBackup()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
          >
            <Download className="h-4 w-4" /> {T.settings.backup.exportCta}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" /> {T.settings.backup.importCta}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImport(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-destructive/30 bg-card p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-destructive">
          {T.settings.danger.heading}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">{T.settings.danger.hint}</p>
        {confirmReset ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold"
            >
              {T.common.cancel}
            </button>
            <button
              onClick={() => void handleReset()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" /> {T.settings.danger.confirmCta}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 py-3 text-sm font-semibold text-destructive active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" /> {T.settings.danger.resetCta}
          </button>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {T.account.changelog.heading}
        </h2>
        <ul className="flex flex-col gap-4">
          {visibleChangelog.map((entry) => (
            <li key={entry.version}>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-sm font-bold">v{entry.version}</span>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium">{entry.title}</p>
              <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                {entry.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {changelog.length > 1 && (
          <button
            onClick={() => setShowOlder((s) => !s)}
            className="mt-3 text-xs font-semibold text-primary"
          >
            {showOlder ? T.account.changelog.hideOlder : T.account.changelog.showOlder}
          </button>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-2xl border border-border bg-card p-3">
      {icon}
      <div className="font-display text-2xl font-bold leading-none">{value}</div>
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
