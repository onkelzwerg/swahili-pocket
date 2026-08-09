import { describe, expect, it } from "vitest";

// Trivialer Test: sichert nur ab, dass Runner, Alias und TS-Setup stehen.
describe("test-setup", () => {
  it("läuft", () => {
    expect(1 + 1).toBe(2);
  });
});
