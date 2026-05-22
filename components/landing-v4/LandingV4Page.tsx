"use client";

/* Landing-V4 = the V2 landing page with the hero swapped for the
   "Cinematic & quiet" HeroV4. Everything below the hero (programmes row,
   snapshots, process, value pillars, testimonials, FAQ, CTA) is the
   unchanged V2 page, fed through its `hero` slot. */

import { LandingV2Page } from "@/components/landing-v2/LandingV2Page";
import { HeroV4 } from "./HeroV4";

export function LandingV4Page() {
  return <LandingV2Page hero={<HeroV4 />} />;
}
