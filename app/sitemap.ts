import type { MetadataRoute } from "next";
import { PROGRAMS, SITE_URL as BASE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/programs",
    "/compare",
    "/blog",
    "/about",
    "/contact",
    "/faq",
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
