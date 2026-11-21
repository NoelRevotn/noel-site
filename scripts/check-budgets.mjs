// JS budgets (PLAN §7.5, calibrated in ADR-0006). Measures gzip size of the JavaScript each page
// loads up front in modern browsers (noModule polyfills excluded), plus the lazy 3D chunk.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const KB = 1024;
const budgets = [
  { page: "en/index.html", maxKB: 180 },
  { page: "en/cv/index.html", maxKB: 165 },
  { page: "en/projects/index.html", maxKB: 165 },
  { page: "en/blog/index.html", maxKB: 165 },
  { page: "en/contact/index.html", maxKB: 165 },
];
const LAZY_3D_MAX_KB = 150;

const gz = (file) => gzipSync(readFileSync(join("out", file))).length;
let failed = false;
for (const { page, maxKB } of budgets) {
  const html = readFileSync(join("out", page), "utf8");
  const noModule = new Set(
    [...html.matchAll(/<script src="\/noel-site(\/_next\/[^"]+\.js)" noModule/g)].map((m) => m[1]),
  );
  const scripts = new Set(
    [...html.matchAll(/(?:src|href)="\/noel-site(\/_next\/static\/chunks\/[^"]+\.js)"/g)]
      .map((m) => m[1])
      .filter((s) => !noModule.has(s)),
  );
  const kb = [...scripts].reduce((sum, s) => sum + gz(s), 0) / KB;
  const ok = kb <= maxKB;
  failed ||= !ok;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${page.padEnd(26)} ${kb.toFixed(1)} KB initial JS (budget ${maxKB} KB)`,
  );
}
const chunks = readdirSync("out/_next/static/chunks").filter((f) => f.endsWith(".js"));
const three = chunks
  .map((f) => ({ f, kb: gz(join("_next/static/chunks", f)) / KB }))
  .sort((a, b) => b.kb - a.kb)[0];
const ok3d = three.kb <= LAZY_3D_MAX_KB;
failed ||= !ok3d;
console.log(
  `${ok3d ? "ok  " : "FAIL"} largest lazy chunk (3D map)   ${three.kb.toFixed(1)} KB (budget ${LAZY_3D_MAX_KB} KB)`,
);
process.exit(failed ? 1 : 0);
