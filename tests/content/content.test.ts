import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

/** `pnpm check:content` (PLAN §6.4). Importing the loader validates every schema. */
describe("content", () => {
  it("parses against the schemas", async () => {
    const content = await import("../../src/lib/content");
    expect(content.projects.length).toBeGreaterThan(0);
  });

  it("has EN/ES parity in UI strings", () => {
    const keys = (o: object, prefix = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        typeof v === "object" && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
      );
    expect(keys(es).sort()).toEqual(keys(en).sort());
  });

  it("has no TODO(noel) placeholders in a release build", () => {
    const dir = join(process.cwd(), "content");
    const todos = readdirSync(dir)
      .filter((f) => f.endsWith(".ts"))
      .flatMap((f) =>
        readFileSync(join(dir, f), "utf8")
          .split("\n")
          .map((line, i) => ({ f, line: i + 1, text: line }))
          // Comments describe the convention; only content strings count.
          .filter((l) => l.text.includes("TODO(noel)") && !/^\s*(\/\/|\*|\/\*)/.test(l.text))
          .map((l) => `content/${l.f}:${l.line}`),
      );
    if (todos.length) console.warn(`${todos.length} TODO(noel) placeholder(s):\n  ${todos.join("\n  ")}`);
    if (process.env.RELEASE === "1") expect(todos).toEqual([]);
  });
});
