import { site } from "../../site.config";

/**
 * Prefixes an absolute path with the basePath. `next/link` adds the basePath on its own;
 * use this only for plain `<a>`, `<meta http-equiv="refresh">`, `next/image` src and the like.
 */
export function withBase(path: string): string {
  if (!path.startsWith("/")) throw new Error(`withBase expects an absolute path, got "${path}"`);
  return `${site.basePath}${path}`;
}
