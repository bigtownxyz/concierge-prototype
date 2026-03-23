import type { MetadataRoute } from "next";
import { PROGRAMS } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://concierge.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/programs",
    "/compare",
    "/blog",
    "/about",
    "/contact",
    "/qualify",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const programPages = PROGRAMS.filter((p) => p.isActive).map((program) => ({
    url: `${BASE_URL}/programs/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...programPages];
}
