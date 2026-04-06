import type { MetadataRoute } from "next";

// TEMPORARY: Block all crawlers until we have a dedicated domain.
// Remove this block and restore allow rules when ready.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
