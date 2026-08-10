import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import { MILESTONES, getAchieved, type AchievedMap } from "@/lib/milestones";
import { T } from "@/config/translations";

// Sammel-Ansicht der Meilensteine (W2.8). Gesperrte bleiben sichtbar —
// sie sind das, was als Nächstes kommt, nicht ein Vorwurf.

export function MilestonesSection() {
  const [achieved, setAchieved] = useState<AchievedMap>({});

  useEffect(() => {
    void getAchieved().then(setAchieved);
  }, []);

  const done = MILESTONES.filter((m) => achieved[m.id]).length;

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {T.milestones.heading}
          </h2>
        </div>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {T.milestones.count(done, MILESTONES.length)}
        </span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{T.milestones.hint}</p>

      <ul className="grid grid-cols-1 gap-2">
        {MILESTONES.map((m) => {
          const ts = achieved[m.id];
          return (
            <li
              key={m.id}
              className={`flex items-start gap-3 rounded-2xl border p-3 ${
                ts ? "border-ochre/40 bg-ochre/10" : "border-border bg-muted/30"
              }`}
            >
              <span className={`text-2xl ${ts ? "" : "opacity-30 grayscale"}`} aria-hidden>
                {m.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  {ts
                    ? T.milestones.achievedOn(new Date(ts).toLocaleDateString("de-DE"))
                    : T.milestones.locked}
                </p>
              </div>
              {!ts && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
