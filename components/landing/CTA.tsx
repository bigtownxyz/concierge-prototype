"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function MeshGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 0.4;
      canvas.height = canvas.offsetHeight * 0.4;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      frame += 0.002;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Violet blob — top left, slow drift
      const x1 = w * 0.25 + Math.sin(frame) * w * 0.1;
      const y1 = h * 0.3 + Math.cos(frame * 0.7) * h * 0.1;
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.5);
      g1.addColorStop(0, "rgba(107, 92, 231, 0.2)");
      g1.addColorStop(0.6, "rgba(107, 92, 231, 0.05)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Gold blob — bottom right
      const x2 = w * 0.75 + Math.cos(frame * 0.8) * w * 0.08;
      const y2 = h * 0.7 + Math.sin(frame * 0.6) * h * 0.08;
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.45);
      g2.addColorStop(0, "rgba(201, 168, 76, 0.15)");
      g2.addColorStop(0.5, "rgba(201, 168, 76, 0.04)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ filter: "blur(50px)" }}
      aria-hidden="true"
    />
  );
}

export function CTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative overflow-hidden rounded-[2.5rem] min-h-[480px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1A1830, #11101C)" }}
        >
          {/* Animated mesh background */}
          <MeshGradientBackground />

          {/* Border glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[2.5rem]"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          />

          {/* Grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] rounded-[2.5rem]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px",
            }}
          />

          <div className="relative z-10 px-8 sm:px-16 py-20 text-center max-w-3xl mx-auto">
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.3em] text-luxury/60 mb-8"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              The Invitation
            </motion.p>

            <motion.h2
              className="heading-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-text-primary leading-[0.95] mb-8"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
            >
              Ready to secure your{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #B8943F, #C9A84C, #E8D48B, #C9A84C)",
                  backgroundSize: "200% 100%",
                  animation: "goldShimmer 4s ease-in-out infinite",
                }}
              >
                global future
              </span>
              ?
            </motion.h2>

            <motion.p
              className="text-text-muted text-lg sm:text-xl max-w-xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              Take our 2-minute qualification assessment and discover which
              programmes match your profile.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.7, ease: EASE }}
            >
              <Link
                href="/qualify"
                className="group inline-flex items-center gap-3 rounded-full px-14 py-5 text-base font-semibold text-background transition-all duration-500 hover:shadow-[0_0_60px_rgba(201,168,76,0.3)] hover:scale-[1.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #B8943F, #C9A84C, #D4B85E, #C9A84C, #B8943F)",
                  backgroundSize: "200% 100%",
                  animation: "goldShimmer 3s ease-in-out infinite",
                }}
              >
                Check Your Eligibility
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.p
              className="mt-8 text-[11px] uppercase tracking-[0.2em] text-text-muted/30"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              Free &middot; No commitment &middot; Results in 2 minutes
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
