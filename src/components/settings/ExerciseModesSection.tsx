import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { updateSettings, useSettings } from "@/lib/settings";
import { TOGGLEABLE_MODES, type ToggleableModeId } from "@/lib/exercises/registry";
import { T } from "@/config/translations";

// Modus-Schalter (W2.1: `settings.enabledModes`).
// „Karte" fehlt bewusst: sie ist der Fallback, den es immer geben muss —
// sonst hätte eine Session für manche Karten keinen zulässigen Modus.

export function ExerciseModesSection() {
  const settings = useSettings();

  async function toggle(mode: ToggleableModeId, on: boolean) {
    if (!settings) return;
    await updateSettings({ enabledModes: { ...settings.enabledModes, [mode]: on } });
    toast.success(T.settings.method.saved);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="mb-1 flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {T.settings.modes.heading}
        </h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{T.settings.modes.hint}</p>

      <ul className="flex flex-col gap-2">
        {TOGGLEABLE_MODES.map((mode) => {
          const on = settings?.enabledModes[mode] !== false;
          return (
            <li key={mode}>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                disabled={!settings}
                onClick={() => void toggle(mode, !on)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left active:scale-[0.99]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{T.exercises.modes[mode]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {T.settings.modes.descriptions[mode]}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    on ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${
                      on ? "left-[1.375rem]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
