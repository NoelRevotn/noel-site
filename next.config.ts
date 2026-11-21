import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { site } from "./site.config";

// Static export for GitHub Pages. Constraints and reasoning: docs/adr/0002-static-export-constraints.md
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // /en/ -> out/en/index.html, which GitHub Pages serves without rewrites
  basePath: site.basePath,
  images: { unoptimized: true }, // the default image optimizer needs a server
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

// MDX for the blog (ADR-0005). Plugins are named by string so Turbopack can load them.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      [
        "rehype-pretty-code",
        { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false },
      ],
    ],
  },
});

export default createNextIntlPlugin()(withMDX(nextConfig));
