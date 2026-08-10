import { motion } from "framer-motion";
import { T } from "@/config/translations";
import type { Grade } from "@/lib/types";
import type { GradePreview } from "@/lib/srs/types";

// Vier Antwortstufen statt richtig/falsch.
// "Schwer" setzt nicht zurück, sondern verkürzt nur — desirable difficulties
// (Bjork). Die Intervall-Vorschau unter jedem Label erklärt das System
// nebenbei, ohne Erklärtext.

const BUTTONS: { grade: Grade; className: string }[] = [
  { grade: 1, className: "bg-destructive text-destructive-foreground" },
  { grade: 2, className: "bg-ochre text-ochre-foreground" },
  { grade: 3, className: "bg-forest text-forest-foreground" },
  { grade: 4, className: "bg-teal text-teal-foreground" },
];

export interface GradeButtonsProps {
  /** Intervall-Vorschau in Button-Reihenfolge; null solange sie lädt. */
  preview: GradePreview | null;
  onGrade(grade: Grade): void;
  disabled?: boolean;
  visible?: boolean;
}

export function GradeButtons({ preview, onGrade, disabled, visible = true }: GradeButtonsProps) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
      initial={false}
      transition={{ duration: 0.2 }}
      aria-hidden={!visible}
      className="mt-6 flex flex-col gap-1.5"
    >
      <div className="flex gap-2">
        {BUTTONS.map(({ grade, className }, i) => (
          <button
            key={grade}
            type="button"
            onClick={() => onGrade(grade)}
            disabled={disabled || !visible}
            tabIndex={visible ? 0 : -1}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl py-3 active:scale-95 disabled:pointer-events-none ${className}`}
          >
            <span className="text-sm font-semibold leading-none">{T.review.grades[grade]}</span>
            <span className="text-[10px] font-medium leading-none opacity-80 tabular-nums">
              {preview?.[i] ?? "·"}
            </span>
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted-foreground">{T.review.grades.hint}</p>
    </motion.div>
  );
}
