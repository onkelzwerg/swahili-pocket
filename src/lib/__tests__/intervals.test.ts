import { describe, expect, it } from "vitest";
import { humanizeInterval, DAY_MS } from "../srs/types";

describe("humanizeInterval", () => {
  const cases: [number, string][] = [
    [10_000, "<1 Min"],
    [60_000, "1 Min"],
    [10 * 60_000, "10 Min"],
    [3 * 3_600_000, "3 Std"],
    [12 * 3_600_000, "12 Std"],
    [DAY_MS, "1 T"],
    [4 * DAY_MS, "4 T"],
    [30 * DAY_MS, "30 T"],
    [45 * DAY_MS, "1 Mon"],
    [90 * DAY_MS, "3 Mon"],
    [400 * DAY_MS, "1,1 J"],
  ];

  for (const [ms, expected] of cases) {
    it(`${ms} ms → ${expected}`, () => {
      expect(humanizeInterval(ms)).toBe(expected);
    });
  }
});
