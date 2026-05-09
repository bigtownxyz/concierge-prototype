"use client";

/* Landing-V3 = the V2 landing page with the hero swapped for the bespoke
   3D Hero3D component (handoff bundle "Concierge Hero v3"). The rest of
   the page (programmes row, snapshots, process, value pillars,
   testimonials, FAQ, CTA) is unchanged — we just feed a `hero` slot. */

import { LandingV2Page } from "@/components/landing-v2/LandingV2Page";
import { Hero3D } from "./Hero3D";

export function LandingV3Page() {
  return <LandingV2Page hero={<Hero3D />} />;
}
