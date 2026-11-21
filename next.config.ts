import type { NextConfig } from "next";
import { site } from "./site.config";

// Static export for GitHub Pages. Constraints and reasoning: docs/adr/0002-static-export-constraints.md
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // /en/ -> out/en/index.html, which GitHub Pages serves without rewrites
  basePath: site.basePath,
  images: { unoptimized: true }, // the default image optimizer needs a server
};

export default nextConfig;
