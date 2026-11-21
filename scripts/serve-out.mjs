// Serves the static export in ./out under the basePath, like GitHub Pages does.
// It's only for local checks and Playwright, never production. No dependencies (PLAN.md §0 rule 4).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("out");
const base = "/noel-site";
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
};

async function resolveFile(urlPath) {
  const file = normalize(join(root, decodeURIComponent(urlPath)));
  if (!file.startsWith(root)) return null; // block path traversal
  const s = await stat(file).catch(() => null);
  if (s?.isDirectory())
    return (await stat(join(file, "index.html")).catch(() => null)) ? join(file, "index.html") : null;
  return s?.isFile() ? file : null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (pathname === base) return res.writeHead(301, { location: `${base}/` }).end(); // GitHub Pages does the same
  const file = pathname.startsWith(`${base}/`) ? await resolveFile(pathname.slice(base.length)) : null;
  const target = file ?? join(root, "404.html");
  res.writeHead(file ? 200 : 404, { "content-type": types[extname(target)] ?? "application/octet-stream" });
  res.end(await readFile(target));
}).listen(port, () => console.log(`Serving out/ at http://localhost:${port}${base}/`));
