// Kalender-Helfer für Streak, Wochenziel und Tagesziel.
//
// Alles rechnet in LOKALER Zeit. Vorher lief die Streak-Logik über
// `toISOString()` (UTC) — in MEZ/MESZ zählte damit ein Review zwischen
// Mitternacht und 2 Uhr noch zum Vortag. Die Woche beginnt am Montag.

/** ISO-Datum (yyyy-mm-dd) in lokaler Zeit. */
export function isoDay(ts: number = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Lokale Mitternacht eines ISO-Datums als Timestamp. */
export function dayStart(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
}

/** Ganze Tage zwischen zwei ISO-Daten (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((dayStart(b) - dayStart(a)) / 86_400_000);
}

/** ISO-Datum n Tage nach `iso`. */
export function addDays(iso: string, n: number): string {
  return isoDay(dayStart(iso) + n * 86_400_000);
}

/** Montag der Woche, in der `iso` liegt. */
export function weekStart(iso: string): string {
  const d = new Date(dayStart(iso));
  // getDay(): 0 = Sonntag → auf Montag-basiert umrechnen.
  const offset = (d.getDay() + 6) % 7;
  return addDays(iso, -offset);
}

/** Die sieben ISO-Daten Mo–So der Woche von `iso`. */
export function weekDates(iso: string = isoDay()): string[] {
  const start = weekStart(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
