import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Snowflake } from "lucide-react";
import { weekDates, weekStart, isoDay } from "@/lib/dates";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";

// Wochenziel statt lückenloser Streak (Deci & Ryan: Selbstbestimmung).
// Sieben Punkte Mo–So; erreicht wird einmal pro Woche gefeiert, nicht
// bei jedem Öffnen der App.

const CELEBRATED_KEY = "swahili-pocket:week-celebrated";

export interface WeekGoalProps {
  /** ISO-Lerntage der laufenden Woche. */
  weekDays: string[];
  /** Zielanzahl Lerntage. */
  goal: number;
  /** Verfügbare Streak-Joker. */
  freezes: number;
}

export function WeekGoal({ weekDays, goal, freezes }: WeekGoalProps) {
  const today = isoDay();
  const days = weekDates(today);
  const done = weekDays.length;
  const reached = done >= goal;
  const celebrated = useRef(false);

  // Einmal pro Kalenderwoche feiern — der Marker lebt im sessionStorage-losen
  // localStorage, damit ein Reload nicht erneut Konfetti wirft.
  useEffect(() => {
    if (!reached || celebrated.current) return;
    celebrated.current = true;
    try {
      const week = weekStart(today);
      if (localStorage.getItem(CELEBRATED_KEY) === week) return;
      localStorage.setItem(CELEBRATED_KEY, week);
    } catch {
      return; // Kein localStorage (Privatmodus) → lieber gar nicht feiern.
    }
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.35 },
      colors: [APP_CONFIG.primaryColor, APP_CONFIG.accentColor, APP_CONFIG.secondaryColor],
    });
  }, [reached, today]);

  return (
    <div className="flex flex-col items-start gap-1 rounded-2xl border border-border bg-card p-3">
      <div className="flex w-full items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {T.home.week.eyebrow}
        </span>
        {freezes > 0 && (
          <span
            title={T.home.week.freezes(freezes)}
            aria-label={T.home.week.freezes(freezes)}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground"
          >
            <Snowflake className="h-3 w-3" aria-hidden />
            {freezes}
          </span>
        )}
      </div>
      <div className="flex w-full justify-between gap-1" aria-hidden>
        {days.map((day, i) => {
          const learned = weekDays.includes(day);
          const isToday = day === today;
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  learned ? "bg-primary" : isToday ? "bg-muted-foreground/40" : "bg-muted"
                }`}
              />
              <span
                className={`text-[9px] leading-none ${
                  isToday ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {T.home.week.dayLabels[i]}
              </span>
            </div>
          );
        })}
      </div>
      <div
        className={`text-[11px] font-medium ${reached ? "text-forest" : "text-muted-foreground"}`}
      >
        {reached ? T.home.week.reached(goal) : T.home.week.progress(done, goal)}
      </div>
    </div>
  );
}
