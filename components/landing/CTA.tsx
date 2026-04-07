"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const font = "var(--font-manrope, 'Manrope', sans-serif)";

export function CTA() {
  const { user } = useUser();
  const [hasQualification, setHasQualification] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("qualifications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setHasQualification(true); });
  }, [user]);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-32 px-6 lg:px-10 relative overflow-hidden" style={{ backgroundColor: "#10141a" }}>
      <div
        className="max-w-7xl mx-auto rounded-[48px] p-12 md:p-24 relative"
        style={{
          background: "linear-gradient(to bottom right, #262a31, #10141a)",
          border: "1px solid rgba(69, 71, 75, 0.2)",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-full -z-0"
          style={{ background: "#bbc4f7", opacity: 0.05, filter: "blur(120px)" }}
        />

        <div className="flex flex-col items-center text-center relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="material-symbols-outlined mb-6 block" style={{ fontSize: 40, color: "#bbc4f7" }}>
              call
            </span>
            <h2
              className="text-4xl md:text-5xl font-semibold mb-6"
              style={{ fontFamily: font, color: "#dfe2eb" }}
            >
              Ready to speak with an advisor?
            </h2>
            <p
              className="text-lg mb-10 leading-relaxed"
              style={{ fontFamily: font, color: "#c6c6cb" }}
            >
              Book a free, no-obligation consultation with a senior concierge. We&apos;ll review your goals, match you with the right programmes, and lay out a clear path forward.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                "Free 30-minute consultation",
                "Personalised programme shortlist",
                "No commitment required",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(187, 196, 247, 0.15)" }}
                  >
                    <Check className="h-3 w-3" style={{ color: "#bbc4f7" }} strokeWidth={3} />
                  </div>
                  <span className="text-sm" style={{ color: "#c6c6cb", fontFamily: font }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (hasQualification) {
                    window.location.href = "/en/results";
                  } else {
                    window.dispatchEvent(new CustomEvent("open-qualify-modal"));
                  }
                }}
                className="px-10 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(187,196,247,0.2)]"
                style={{
                  fontFamily: font,
                  backgroundColor: "#bbc4f7",
                  color: "#242d58",
                }}
              >
                {hasQualification ? "View My Application" : "Get Qualified & Book a Call"}
              </button>
              <button
                onClick={() => window.location.href = "/en/programs"}
                className="px-10 py-4 rounded-xl text-base font-semibold transition-all duration-200"
                style={{
                  fontFamily: font,
                  backgroundColor: "rgba(69,71,75,0.2)",
                  border: "1px solid rgba(69,71,75,0.3)",
                  color: "#c6c6cb",
                }}
              >
                Explore Programmes First
              </button>
            </div>

            <p className="mt-8 text-xs" style={{ color: "#8f9095", fontFamily: font }}>
              Complete the qualification form to receive your personalised recommendations. Your advisor will reach out within 24 hours.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
