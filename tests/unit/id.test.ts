import { describe, it, expect } from "vitest";
import { generateToastId } from "@/utils/id";

describe("generateToastId", () => {
  it("returns a string starting with toast-", () => {
    const id = generateToastId();
    expect(id).toMatch(/^toast-/);
  });

  it("includes a timestamp", () => {
    const id = generateToastId();
    const parts = id.split("-");
    expect(parts.length).toBeGreaterThanOrEqual(3);
    expect(Number(parts[1])).toBeLessThanOrEqual(Date.now());
  });

  it("increments counter on each call", () => {
    const a = generateToastId();
    const b = generateToastId();
    const aCounter = a.split("-").pop();
    const bCounter = b.split("-").pop();
    expect(Number(bCounter)).toBe(Number(aCounter) + 1);
  });
});
