import { Calendar } from "tanstack_start_ts";

const day = (n: number) => new Date(2026, 7, n);

export const Single = () => (
  <Calendar
    mode="single"
    defaultMonth={day(1)}
    selected={day(12)}
    className="rounded-xl border border-border bg-card"
  />
);

export const Range = () => (
  <Calendar
    mode="range"
    defaultMonth={day(1)}
    selected={{ from: day(10), to: day(17) }}
    className="rounded-xl border border-border bg-card"
  />
);

export const Multiple = () => (
  <Calendar
    mode="multiple"
    defaultMonth={day(1)}
    selected={[day(4), day(9), day(14), day(21)]}
    className="rounded-xl border border-border bg-card"
  />
);
