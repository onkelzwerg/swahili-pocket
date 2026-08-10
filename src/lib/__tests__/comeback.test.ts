import { describe, expect, it } from "vitest";
import { pickComebackCards, COMEBACK_SESSION_SIZE } from "../comeback";
import { makeCard } from "./helpers";

const DAY = 86_400_000;
const NOW = Date.parse("2026-03-01T10:00:00Z");

describe("pickComebackCards", () => {
  it("nimmt nur gefestigte Karten", () => {
    const cards = [
      makeCard({ id: "neu", box: 1 }),
      makeCard({ id: "reif", box: 4, maturedAt: NOW - 30 * DAY, lastReviewAt: NOW - 20 * DAY }),
    ];
    expect(pickComebackCards(cards).map((c) => c.id)).toEqual(["reif"]);
  });

  it("sortiert nach längster Pause", () => {
    const cards = [1, 5, 3, 9, 2].map((days) =>
      makeCard({
        id: `d${days}`,
        box: 4,
        maturedAt: NOW - 60 * DAY,
        lastReviewAt: NOW - days * DAY,
      }),
    );
    expect(pickComebackCards(cards, 3).map((c) => c.id)).toEqual(["d9", "d5", "d3"]);
  });

  it("liefert höchstens fünf Karten", () => {
    const cards = Array.from({ length: 20 }, (_, i) =>
      makeCard({ id: `c${i}`, box: 5, maturedAt: NOW - 90 * DAY, lastReviewAt: NOW - i * DAY }),
    );
    expect(pickComebackCards(cards)).toHaveLength(COMEBACK_SESSION_SIZE);
  });

  it("fällt ohne lastReviewAt auf updatedAt/createdAt zurück", () => {
    const cards = [
      makeCard({ id: "alt", box: 4, maturedAt: NOW, createdAt: NOW - 100 * DAY }),
      makeCard({ id: "neu", box: 4, maturedAt: NOW, createdAt: NOW - 2 * DAY }),
    ];
    expect(pickComebackCards(cards).map((c) => c.id)).toEqual(["alt", "neu"]);
  });
});
