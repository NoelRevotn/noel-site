import { describe, expect, it } from "vitest";
import { contrastRatio, luminance, wcagLevel } from "./contrast";

describe("contrast", () => {
  it("matches the WCAG extremes", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#ffffff")).toBeCloseTo(1);
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21);
  });

  it("is symmetric and matches a known pair", () => {
    // #767676 on white is the classic 4.54:1 threshold grey
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
    expect(contrastRatio("#ffffff", "#767676")).toBeCloseTo(4.54, 2);
  });

  it("grades ratios", () => {
    expect(wcagLevel(7.1)).toBe("AAA");
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(3.2)).toBe("AA large");
    expect(wcagLevel(2.9)).toBe("fail");
  });

  it("rejects malformed colours", () => {
    expect(() => luminance("red")).toThrow();
  });
});
