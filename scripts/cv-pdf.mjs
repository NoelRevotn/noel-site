// Prints the web CV (/en/cv/, /es/cv/) to out/cv/noel-echeverria-cv-{locale}.pdf after `next build`.
// The PDF is the same page as the web CV, so they can't drift; no phone number by design.
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const port = 4180;
const server = spawn(process.execPath, ["scripts/serve-out.mjs"], {
  env: { ...process.env, PORT: String(port) },
});
await new Promise((resolve) => server.stdout.once("data", resolve));

const browser = await chromium.launch();
try {
  await mkdir("out/cv", { recursive: true });
  for (const locale of ["en", "es"]) {
    const page = await browser.newPage();
    await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
    await page.goto(`http://localhost:${port}/noel-site/${locale}/cv/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const path = `out/cv/noel-echeverria-cv-${locale}.pdf`;
    await page.pdf({ path, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log(`wrote ${path}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
