import { useState } from "react";
import { Brain, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DAILY_GOAL_OPTIONS,
  WEEKLY_GOAL_OPTIONS,
  updateSettings,
  useSettings,
  type AppSettings,
} from "@/lib/settings";
import { recomputeDue } from "@/lib/srs";
import { T } from "@/config/translations";
import type { SchedulerId } from "@/lib/types";

// Lernmethode, Tagesziel, Wochenziel.
// Der Wechsel ist verlustfrei (beide Scheduler-Zustände laufen bei jedem
// Review mit) — der Dialog sagt das explizit, damit niemand aus Angst
// bei der schlechteren Methode bleibt.

const METHODS: { id: SchedulerId; label: string; hint: string }[] = [
  { id: "fsrs", label: T.settings.method.fsrs.label, hint: T.settings.method.fsrs.hint },
  { id: "leitner", label: T.settings.method.leitner.label, hint: T.settings.method.leitner.hint },
];

export function LearningMethodSection() {
  const settings = useSettings();
  const [pending, setPending] = useState<SchedulerId | null>(null);
  const [switching, setSwitching] = useState(false);

  async function confirmSwitch() {
    if (!pending) return;
    setSwitching(true);
    try {
      await updateSettings({ scheduler: pending });
      const { dueCount } = await recomputeDue(pending);
      const label = METHODS.find((m) => m.id === pending)!.label;
      toast.success(T.settings.method.switched(label, dueCount));
    } catch (e) {
      toast.error(T.settings.method.switchFailed, {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSwitching(false);
      setPending(null);
    }
  }

  async function saveGoal(patch: Partial<AppSettings>) {
    await updateSettings(patch);
    toast.success(T.settings.method.saved);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center gap-2">
        <Brain className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {T.settings.method.heading}
        </h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{T.settings.method.hint}</p>

      <div role="radiogroup" aria-label={T.settings.method.heading} className="flex flex-col gap-2">
        {METHODS.map((method) => {
          const active = settings?.scheduler === method.id;
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!settings || switching}
              onClick={() => {
                if (!active) setPending(method.id);
              }}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors active:scale-[0.99] ${
                active ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {active && <Check className="h-3 w-3" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{method.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{method.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <SegmentedGoal
        label={T.settings.method.dailyGoal}
        hint={T.settings.method.dailyGoalHint}
        options={DAILY_GOAL_OPTIONS}
        value={settings?.dailyGoalCards}
        format={T.settings.method.dailyGoalOption}
        onSelect={(v) => void saveGoal({ dailyGoalCards: v as AppSettings["dailyGoalCards"] })}
      />
      <SegmentedGoal
        label={T.settings.method.weeklyGoal}
        hint={T.settings.method.weeklyGoalHint}
        options={WEEKLY_GOAL_OPTIONS}
        value={settings?.weeklyGoalDays}
        format={T.settings.method.weeklyGoalOption}
        onSelect={(v) => void saveGoal({ weeklyGoalDays: v as AppSettings["weeklyGoalDays"] })}
      />

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{T.settings.method.switchTitle}</AlertDialogTitle>
            <AlertDialogDescription>{T.settings.method.switchBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={switching}>{T.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={switching}
              onClick={(e) => {
                e.preventDefault();
                void confirmSwitch();
              }}
            >
              {switching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {T.settings.method.switchConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function SegmentedGoal({
  label,
  hint,
  options,
  value,
  format,
  onSelect,
}: {
  label: string;
  hint: string;
  options: readonly number[];
  value: number | undefined;
  format: (n: number) => string;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="mt-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
      <div role="radiogroup" aria-label={label} className="flex gap-1.5 rounded-full bg-muted p-1">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={value === undefined}
              onClick={() => onSelect(option)}
              className={`flex-1 rounded-full px-2 py-2 text-xs font-semibold transition-colors ${
                active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
