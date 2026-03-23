"use client";

import { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Cubic bezier ease shared across animations
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ---------------------------------------------------------------------------
// Particle canvas
// ---------------------------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const PARTICLE_COLORS = [
  "rgba(107, 92, 231,", // violet
  "rgba(201, 168, 76,", // gold
];

const PARTICLE_COUNT = 40;
const CONNECTION_DISTANCE = 120;
const BASE_SPEED = 0.18;

function createParticle(width: number, height: number): Particle {
  const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * BASE_SPEED,
    vy: (Math.random() - 0.5) * BASE_SPEED,
    radius: Math.random() * 1 + 1, // 1–2 px
    color,
    alpha: Math.random() * 0.5 + 0.3,
  };
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Rebuild particles on resize so density stays consistent
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(canvas.width, canvas.height)
      );
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Move and wrap
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(107, 92, 231, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
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

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO, delay },
  }),
};

const heading = "Your Global Future Starts Here";
const words = heading.split(" ");

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Hero() {
  return (
    <section
      className={cn(
        "relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden",
        "bg-[#11101C]"
      )}
    >
      {/* Particle constellation background */}
      <ParticleCanvas />

      {/* Radial vignette — keeps extreme corners dark and atmospheric */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(17,16,28,0.55) 60%, rgba(17,16,28,0.92) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle top edge glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(107,92,231,0.4) 30%, rgba(201,168,76,0.3) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ---------- Center content ---------- */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          className="mb-6 text-xs font-medium uppercase tracking-widest text-text-muted"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          Second Citizenship &amp; Residency Advisory
        </motion.p>

        {/* Main heading — word-by-word reveal */}
        <h1 className="heading-display mb-6 text-5xl leading-tight sm:text-6xl lg:text-7xl text-text-primary">
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.25em] last:mr-0"
              initial="hidden"
              animate="visible"
              custom={0.15 + i * 0.1}
              variants={fadeUp}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subheading */}
        <motion.p
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text-muted"
          initial="hidden"
          animate="visible"
          custom={0.75}
          variants={fadeUp}
        >
          Expert guidance for high-net-worth individuals seeking citizenship by
          investment, golden visas, and strategic residency programmes worldwide.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial="hidden"
          animate="visible"
          custom={0.9}
          variants={fadeUp}
        >
          {/* Primary CTA */}
          <Link
            href="/qualify"
            className={cn(
              "inline-flex items-center justify-center",
              "rounded-lg bg-luxury px-8 py-4",
              "text-sm font-semibold text-background",
              "transition-all duration-300",
              "hover:bg-luxury-hover",
              "hover:shadow-[0_0_28px_rgba(201,168,76,0.35)]",
              "active:scale-[0.98]"
            )}
          >
            Check Your Eligibility
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/programs"
            className={cn(
              "inline-flex items-center justify-center",
              "rounded-lg border border-glass-border px-8 py-4",
              "text-sm font-medium text-text-primary",
              "transition-all duration-300",
              "hover:bg-glass-bg hover:border-glass-border-hover",
              "active:scale-[0.98]"
            )}
          >
            Explore Programmes
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.p
          className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted"
          initial="hidden"
          animate="visible"
          custom={1.05}
          variants={fadeUp}
        >
          Trusted by 500+ clients
          <span
            className="inline-block h-[3px] w-[3px] rounded-full bg-luxury opacity-60"
            aria-hidden="true"
          />
          across 40 countries
          <span
            className="inline-block h-[3px] w-[3px] rounded-full bg-luxury opacity-60"
            aria-hidden="true"
          />
          worldwide
        </motion.p>
      </div>

      {/* ---------- Scroll indicator ---------- */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
