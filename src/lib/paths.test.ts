import { describe, expect, it } from "vitest";
import { withBase } from "./paths";

describe("withBase", () => {
  it("prefixes absolute paths with the basePath", () => {
    expect(withBase("/en/")).toBe("/noel-site/en/");
  });

  it("rejects relative paths, which would resolve differently on every page", () => {
    expect(() => withBase("en/")).toThrow();
  });
});
