import { describe, it, expect } from "vitest";
import { THEME } from "@/theme";

describe("THEME", () => {
  it("has color tokens defined", () => {
    expect(THEME.colors.amberHoney).toBe("#e28800");
    expect(THEME.colors.honeyGold).toBe("#faa715");
    expect(THEME.colors.creamBackground).toBe("#faf6ee");
    expect(THEME.colors.obsidianText).toBe("#100f0d");
  });

  it("has card styles defined", () => {
    expect(THEME.cardStyles.glass).toContain("backdrop-blur-md");
    expect(THEME.cardStyles.organicHover).toContain("hover:bg-white/90");
    expect(THEME.cardStyles.focusOutline).toContain("focus:outline-none");
  });

  it("has status markers", () => {
    expect(THEME.colors.goldActive).toBe("#e28800");
    expect(THEME.colors.successFern).toBe("#15803d");
    expect(THEME.colors.hazardRose).toBe("#b91c1c");
  });
});
