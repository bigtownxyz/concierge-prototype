"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Globe, ArrowRight, Users, Clock } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const COUNTRIES = [
  "Grenada", "Portugal", "Dominica", "Dubai",
  "St Kitts", "Greece", "Serbia", "Antigua",
];

function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 0.5;
      canvas.height = canvas.offsetHeight * 0.5;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      frame += 0.002;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const x1 = w * 0.3 + Math.sin(frame * 0.7) * w * 0.12;
      const y1 = h * 0.35 + Math.cos(frame * 0.5) * h * 0.1;
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.45);
      g1.addColorStop(0, "rgba(53, 58, 99, 0.25)");
      g1.addColorStop(0.6, "rgba(30, 28, 48, 0.1)");
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const x2 = w * 0.7 + Math.cos(frame * 0.6) * w * 0.1;
      const y2 = h * 0.6 + Math.sin(frame * 0.8) * h * 0.08;
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.4);
      g2.addColorStop(0, "rgba(90, 99, 151, 0.12)");
      g2.addColorStop(0.5, "rgba(66, 73, 117, 0.05)");
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
      style={{ filter: "blur(60px)" }}
      aria-hidden="true"
    />
  );
}

export function Hero() {
  const [countryIndex, setCountryIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountryIndex((i) => (i + 1) % COUNTRIES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0D0D1A]">
      <MeshBackground />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(13,13,26,0.6) 0%, transparent 40%, rgba(13,13,26,0.8) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(13,13,26,0.6) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-1.5">
            <Globe className="h-3.5 w-3.5 text-white/40" />
            <span className="text-xs font-medium text-white/60">
              Second Citizenship &amp; Residency Advisory
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
        >
          <span className="font-semibold text-white">Your Pathway</span>{" "}
          <span className="font-light text-white/50 italic">to</span>{" "}
          <br className="sm:hidden" />
          <AnimatePresence mode="wait">
            <motion.span
              key={COUNTRIES[countryIndex]}
              className="inline-block font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {COUNTRIES[countryIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.h1>

        <motion.p
          className="mx-auto max-w-xl text-base sm:text-lg font-light leading-relaxed text-white/50 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        >
          Bespoke guidance for high-net-worth individuals seeking citizenship by
          investment, golden visas, and strategic residency worldwide.
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
        >
          <Link
            href="/qualify"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-7 py-2.5",
              "bg-white text-[#0D0D1A] font-medium text-sm",
              "transition-all duration-200 hover:bg-white/90 active:scale-[0.97]"
            )}
          >
            Get Qualified Free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/programs"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-7 py-2.5",
              "border border-white/20 text-white/80 font-light text-sm",
              "transition-all duration-200 hover:border-white/40 hover:text-white active:scale-[0.97]"
            )}
          >
            Explore Programs
          </Link>
        </motion.div>

        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {[
            { icon: Users, text: "500+ Clients served" },
            { icon: Globe, text: "15+ Programmes" },
            { icon: Clock, text: "3–6 mo Processing" },
          ].map((stat) => (
            <div key={stat.text} className="flex items-center gap-2">
              <stat.icon className="h-3.5 w-3.5 text-white/25" />
              <span className="text-xs text-white/40 font-light">{stat.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
