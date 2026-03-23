"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Animated aurora/mesh gradient background
function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 0.5; // Half res for performance
      canvas.height = canvas.offsetHeight * 0.5;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      frame += 0.003;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Aurora blob 1 — violet, large, top-left drift
      const x1 = w * 0.3 + Math.sin(frame * 0.7) * w * 0.15;
      const y1 = h * 0.3 + Math.cos(frame * 0.5) * h * 0.12;
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.5);
      grad1.addColorStop(0, "rgba(107, 92, 231, 0.18)");
      grad1.addColorStop(0.5, "rgba(107, 92, 231, 0.06)");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Aurora blob 2 — gold, bottom-right, counter-drift
      const x2 = w * 0.7 + Math.cos(frame * 0.6) * w * 0.12;
      const y2 = h * 0.65 + Math.sin(frame * 0.8) * h * 0.1;
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.4);
      grad2.addColorStop(0, "rgba(201, 168, 76, 0.12)");
      grad2.addColorStop(0.6, "rgba(201, 168, 76, 0.03)");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // Aurora blob 3 — deep blue accent, center, slow pulse
      const x3 = w * 0.5 + Math.sin(frame * 0.4) * w * 0.08;
      const y3 = h * 0.5 + Math.cos(frame * 0.3) * h * 0.08;
      const grad3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, w * 0.35);
      grad3.addColorStop(0, "rgba(59, 47, 149, 0.14)");
      grad3.addColorStop(1, "transparent");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ imageRendering: "auto", filter: "blur(60px)" }}
      aria-hidden="true"
    />
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Aurora mesh gradient */}
      <AuroraBackground />

      {/* Noise grain overlay for texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
        aria-hidden="true"
      />

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, rgba(17,16,28,0.4) 50%, rgba(17,16,28,0.95) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Horizontal light bar at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(107,92,231,0.5) 35%, rgba(201,168,76,0.4) 65%, transparent 90%)",
        }}
      />

      {/* Content with parallax */}
      <motion.div
        style={{ y: yText, opacity: opacityText, scale }}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        {/* Eyebrow with decorative line */}
        <motion.div
          className="mb-8 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-luxury/50" />
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-luxury/80">
            Second Citizenship &amp; Residency Advisory
          </span>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-luxury/50" />
        </motion.div>

        {/* Main heading — massive, dramatic */}
        <h1 className="heading-display leading-[0.9] tracking-tight">
          {"Your Global Future".split(" ").map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.22em] text-[clamp(3rem,8vw,7.5rem)] text-text-primary"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.8,
                delay: 0.3 + i * 0.12,
                ease: EASE,
              }}
            >
              {word}
            </motion.span>
          ))}
          <br />
          {"Starts Here".split(" ").map((word, i) => (
            <motion.span
              key={`b-${i}`}
              className={cn(
                "inline-block mr-[0.22em] text-[clamp(3rem,8vw,7.5rem)]",
                i === 1
                  ? "bg-gradient-to-r from-luxury via-[#E8D48B] to-luxury bg-clip-text text-transparent"
                  : "text-text-primary"
              )}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.8,
                delay: 0.6 + i * 0.12,
                ease: EASE,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subheading */}
        <motion.p
          className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-text-secondary/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
        >
          Expert guidance for high-net-worth individuals seeking citizenship by
          investment, golden visas, and strategic residency worldwide.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
        >
          <Link
            href="/qualify"
            className={cn(
              "group relative inline-flex items-center gap-2.5",
              "rounded-full px-10 py-4",
              "text-[15px] font-semibold text-background",
              "bg-gradient-to-r from-luxury via-[#D4B85E] to-luxury bg-[length:200%_100%]",
              "transition-all duration-500",
              "hover:bg-[position:100%_0] hover:shadow-[0_0_40px_rgba(201,168,76,0.3)]",
              "active:scale-[0.97]"
            )}
          >
            Check Your Eligibility
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/programs"
            className={cn(
              "inline-flex items-center gap-2",
              "rounded-full px-10 py-4",
              "text-[15px] font-medium text-text-primary/90",
              "border border-white/10",
              "transition-all duration-300",
              "hover:bg-white/[0.04] hover:border-white/20",
              "active:scale-[0.97]"
            )}
          >
            Explore Programmes
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          {[
            { value: "500+", label: "Clients" },
            { value: "15", label: "Programmes" },
            { value: "40+", label: "Countries" },
            { value: "98%", label: "Success" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-lg font-semibold text-text-primary/70">
                {stat.value}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-text-muted/40">
                {stat.label}
              </span>
              {i < 3 && (
                <span className="ml-3 h-3 w-[1px] bg-white/10" aria-hidden="true" />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: "linear-gradient(to top, #11101C, transparent)",
        }}
      />
    </section>
  );
}
