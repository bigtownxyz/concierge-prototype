"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STATS = [
  { raw: 500, display: "500+", label: "Clients", suffix: "+" },
  { raw: 15,  display: "15",   label: "Programmes", suffix: "" },
  { raw: 40,  display: "40+",  label: "Countries", suffix: "+" },
  { raw: 98,  display: "98%",  label: "Success", suffix: "%" },
] as const;

// Programme country dots on the radar rings
// Each entry: [ringIndex (0=inner … 3=outer), angleDeg, color ("v"=violet|"g"=gold)]
const COUNTRY_DOTS: Array<{ ring: number; angle: number; color: "v" | "g" }> = [
  { ring: 0, angle: 20,  color: "v" },
  { ring: 0, angle: 200, color: "g" },
  { ring: 1, angle: 55,  color: "g" },
  { ring: 1, angle: 130, color: "v" },
  { ring: 1, angle: 290, color: "g" },
  { ring: 2, angle: 10,  color: "g" },
  { ring: 2, angle: 80,  color: "v" },
  { ring: 2, angle: 160, color: "g" },
  { ring: 2, angle: 230, color: "v" },
  { ring: 2, angle: 310, color: "v" },
  { ring: 3, angle: 40,  color: "v" },
  { ring: 3, angle: 115, color: "g" },
  { ring: 3, angle: 190, color: "v" },
  { ring: 3, angle: 265, color: "g" },
  { ring: 3, angle: 340, color: "v" },
];

// Arc connections between specific dot pairs (by dot index)
const ARC_CONNECTIONS: Array<[number, number]> = [
  [0, 2], [1, 4], [3, 8], [6, 11], [9, 12], [5, 13],
];

// ─── Radar / Sonar Canvas ───────────────────────────────────────────────────

function RadarVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let rotation = 0;

    // Pulse state: each ring has an independent pulse wave
    const pulses: Array<{ progress: number; opacity: number }> = [
      { progress: 0.0, opacity: 0 },
      { progress: 0.3, opacity: 0 },
      { progress: 0.6, opacity: 0 },
      { progress: 0.9, opacity: 0 },
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(() => {
      ctx.resetTransform();
      resize();
    });
    ro.observe(canvas);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.min(W, H) * 0.46;

      ctx.clearRect(0, 0, W, H);

      // ── Static ring radii (4 rings) ──────────────────────────────────────
      const ringRadii = [
        maxR * 0.28,
        maxR * 0.50,
        maxR * 0.73,
        maxR * 1.00,
      ];

      // Advance rotation (very slow)
      rotation += 0.0008;

      // ── Pulse waves ───────────────────────────────────────────────────────
      pulses.forEach((p) => {
        p.progress += 0.004;
        if (p.progress >= 1) {
          p.progress = 0;
        }
        p.opacity = Math.sin(p.progress * Math.PI);

        const r = p.progress * maxR * 1.05;
        const grad = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r);
        grad.addColorStop(0, `rgba(107, 92, 231, 0)`);
        grad.addColorStop(0.6, `rgba(107, 92, 231, ${p.opacity * 0.09})`);
        grad.addColorStop(1, `rgba(107, 92, 231, 0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(107, 92, 231, ${p.opacity * 0.18})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // ── Static concentric rings ───────────────────────────────────────────
      ringRadii.forEach((r, i) => {
        const alpha = 0.1 + i * 0.04;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(107, 92, 231, ${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      });

      // ── Crosshair / axis lines ────────────────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      [0, 45, 90, 135].forEach((angleDeg) => {
        const a = (angleDeg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * maxR, Math.sin(a) * maxR);
        ctx.moveTo(0, 0);
        ctx.lineTo(-Math.cos(a) * maxR, -Math.sin(a) * maxR);
        ctx.strokeStyle = "rgba(107, 92, 231, 0.06)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      ctx.restore();

      // ── Sweeping radar arm ────────────────────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      const sweepAngle = rotation * 1.6;
      // Sweep arm — gradient sector approximated with arc fill
      const sectors = 24;
      for (let s = 0; s < sectors; s++) {
        const t     = s / sectors;
        const angle = sweepAngle - t * ((Math.PI * 2) / 3); // 120° sweep trail
        const alpha = (1 - t) * 0.12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxR, angle, angle + ((Math.PI * 2) / sectors / 2));
        ctx.closePath();
        ctx.fillStyle = `rgba(107, 92, 231, ${alpha})`;
        ctx.fill();
      }

      // Bright sweep leading edge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(sweepAngle) * maxR,
        Math.sin(sweepAngle) * maxR
      );
      ctx.strokeStyle = "rgba(107, 92, 231, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // ── Dot positions (rotated with the visualization) ────────────────────
      const dotPositions = COUNTRY_DOTS.map((d) => {
        const baseAngle = (d.angle * Math.PI) / 180;
        const totalAngle = baseAngle + rotation;
        const r = ringRadii[d.ring];
        return {
          x: cx + Math.cos(totalAngle) * r,
          y: cy + Math.sin(totalAngle) * r,
          color: d.color,
        };
      });

      // ── Arc connections ───────────────────────────────────────────────────
      ARC_CONNECTIONS.forEach(([ai, bi]) => {
        const a = dotPositions[ai];
        const b = dotPositions[bi];
        if (!a || !b) return;

        // Midpoint control slightly toward center for a subtle curve
        const midX = (a.x + b.x) / 2 + (cx - (a.x + b.x) / 2) * 0.15;
        const midY = (a.y + b.y) / 2 + (cy - (a.y + b.y) / 2) * 0.15;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(midX, midY, b.x, b.y);
        ctx.strokeStyle = "rgba(201, 168, 76, 0.12)";
        ctx.lineWidth = 0.75;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // ── Country dots ──────────────────────────────────────────────────────
      dotPositions.forEach(({ x, y, color }) => {
        const isGold   = color === "g";
        const mainRgb  = isGold ? "201, 168, 76" : "107, 92, 231";
        const glowRgb  = isGold ? "201, 168, 76" : "107, 92, 231";
        const dotR     = isGold ? 3.5 : 3;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, dotR * 5);
        glowGrad.addColorStop(0, `rgba(${glowRgb}, 0.5)`);
        glowGrad.addColorStop(1, `rgba(${glowRgb}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, dotR * 5, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${mainRgb}, 0.95)`;
        ctx.fill();

        // Specular highlight on dot
        ctx.beginPath();
        ctx.arc(x - dotR * 0.28, y - dotR * 0.28, dotR * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();
      });

      // ── Center core ───────────────────────────────────────────────────────
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      coreGrad.addColorStop(0, "rgba(107, 92, 231, 0.9)");
      coreGrad.addColorStop(0.4, "rgba(107, 92, 231, 0.4)");
      coreGrad.addColorStop(1, "rgba(107, 92, 231, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

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
      aria-hidden="true"
    />
  );
}

// ─── Animated Count-Up Stat ─────────────────────────────────────────────────

function AnimatedStat({
  raw,
  display,
  label,
  suffix,
  delay,
}: {
  raw: number;
  display: string;
  label: string;
  suffix: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 22 });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      motionVal.set(raw);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [isInView, motionVal, raw, delay]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplayed(Math.round(v)));
  }, [spring]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-xl font-semibold tabular-nums text-text-primary/90 tracking-tight">
        {displayed}
        {suffix}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted/60">
        {label}
      </span>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Content parallaxes faster than background on scroll
  const yContent  = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yRadar    = useTransform(scrollYProgress, [0, 1], [0,  60]);
  const opacity   = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const scale     = useTransform(scrollYProgress, [0, 0.5],  [1, 0.96]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
    >
      {/* ── Radar visualization ─────────────────────────────────────────── */}
      <motion.div
        style={{ y: yRadar }}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      >
        {/* Radial gradient "halo" behind radar */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(107,92,231,0.10) 0%, transparent 70%)",
          }}
        />
        <RadarVisualization />
      </motion.div>

      {/* ── Atmosphere layers ───────────────────────────────────────────── */}

      {/* SVG noise grain texture */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
        }}
        aria-hidden="true"
      />

      {/* Radial vignette — darkens edges */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 78% 72% at 50% 48%, transparent 0%, rgba(17,16,28,0.35) 48%, rgba(17,16,28,0.92) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Top horizontal light bar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, rgba(107,92,231,0.55) 32%, rgba(201,168,76,0.45) 68%, transparent 92%)",
        }}
        aria-hidden="true"
      />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: yContent, opacity, scale }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-24 text-center"
      >
        {/* Eyebrow */}
        <motion.div
          className="mb-10 flex items-center justify-center gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
        >
          <span
            className="h-[1px] w-16 shrink-0"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(201,168,76,0.55))",
            }}
            aria-hidden="true"
          />
          <span
            className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.3em]"
            style={{ color: "rgba(201,168,76,0.75)" }}
          >
            Second Citizenship &amp; Residency Advisory
          </span>
          <span
            className="h-[1px] w-16 shrink-0"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(201,168,76,0.55))",
            }}
            aria-hidden="true"
          />
        </motion.div>

        {/* Main headline */}
        <h1
          className="heading-display mb-0 leading-[0.92] tracking-tight"
          aria-label="Your Global Future Starts Here"
        >
          {/* Line 1 — "Your Global Future" */}
          <span className="block">
            {"Your Global Future".split(" ").map((word, i) => (
              <motion.span
                key={`l1-${i}`}
                className="mr-[0.2em] inline-block text-[clamp(3.5rem,9vw,8rem)] text-text-primary"
                initial={{ opacity: 0, y: 48, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  delay: 0.35 + i * 0.13,
                  ease: EASE,
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>

          {/* Line 2 — "Starts Here" with gold shimmer on "Here" */}
          <span className="block">
            {["Starts", "Here"].map((word, i) => (
              <motion.span
                key={`l2-${i}`}
                className={cn(
                  "mr-[0.2em] inline-block text-[clamp(3.5rem,9vw,8rem)]",
                  i === 1 ? "gold-shimmer" : "text-text-primary"
                )}
                initial={{ opacity: 0, y: 48, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  delay: 0.7 + i * 0.13,
                  ease: EASE,
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subheading */}
        <motion.p
          className="mx-auto mt-9 max-w-xl text-[1.0625rem] leading-relaxed text-text-secondary/75"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: EASE }}
        >
          Bespoke guidance for ultra-high-net-worth families seeking citizenship
          by investment, golden visas, and strategic residency across the globe.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15, ease: EASE }}
        >
          {/* Primary — gold gradient with hover light sweep */}
          <Link
            href="/qualify"
            className={cn(
              "group relative inline-flex items-center gap-2.5 overflow-hidden",
              "rounded-full px-10 py-[1.05rem]",
              "text-[0.9375rem] font-semibold",
              "transition-shadow duration-500",
              "hover:shadow-[0_0_48px_rgba(201,168,76,0.38)]",
              "active:scale-[0.97]"
            )}
            style={{
              background: "linear-gradient(135deg, #B8943F 0%, #D4B85E 40%, #C9A84C 70%, #B8943F 100%)",
              color: "#11101C",
            }}
          >
            {/* Moving light sweep on hover */}
            <span
              className={cn(
                "pointer-events-none absolute inset-0",
                "translate-x-[-110%] group-hover:translate-x-[110%]",
                "transition-transform duration-700 ease-in-out",
              )}
              style={{
                background:
                  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.32) 50%, transparent 70%)",
              }}
              aria-hidden="true"
            />
            <span className="relative">Check Your Eligibility</span>
            <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary — ghost pill */}
          <Link
            href="/programs"
            className={cn(
              "group inline-flex items-center gap-2",
              "rounded-full border border-white/10 px-10 py-[1.05rem]",
              "text-[0.9375rem] font-medium text-text-primary/85",
              "transition-all duration-300",
              "hover:border-[rgba(201,168,76,0.3)] hover:bg-white/[0.035] hover:text-text-primary",
              "active:scale-[0.97]"
            )}
          >
            Explore Programmes
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-1 gap-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 1.45 }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <AnimatedStat
                raw={stat.raw}
                display={stat.display}
                label={stat.label}
                suffix={stat.suffix}
                delay={1.45 + i * 0.1}
              />
              {i < STATS.length - 1 && (
                <span
                  className="mx-7 h-7 w-[1px] shrink-0 bg-white/10"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Bottom fade to next section ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 z-[4] h-40"
        style={{
          background: "linear-gradient(to top, #11101C 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Gold shimmer keyframe injected inline ────────────────────────── */}
      <style>{`
        .gold-shimmer {
          background: linear-gradient(
            90deg,
            #B8943F 0%,
            #E8D48B 35%,
            #C9A84C 55%,
            #B8943F 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: goldShimmerMove 3.6s ease-in-out infinite;
        }
        @keyframes goldShimmerMove {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
      `}</style>
    </section>
  );
}
