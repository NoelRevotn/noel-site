import type { MetadataRoute } from "next";
import { withBase } from "@/lib/paths";
import { site } from "../site.config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${site.origin}${withBase("/sitemap.xml")}` };
}
