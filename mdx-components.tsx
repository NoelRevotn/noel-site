import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Post styling lives in the blog page's CSS module.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
