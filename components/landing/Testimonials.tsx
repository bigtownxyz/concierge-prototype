"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const AUTO_ADVANCE_MS = 6000;

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, AUTO_ADVANCE_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => {
      const next = prev + dir;
      if (next < 0) return TESTIMONIALS.length - 1;
      if (next >= TESTIMONIALS.length) return 0;
      return next;
    });
    resetTimer();
  };

  const testimonial = TESTIMONIALS[current];

  return (
    <section ref={sectionRef} className="relative py-40 px-6 overflow-hidden">
      {/* Background tint that shifts per testimonial */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background:
            current === 0
              ? "radial-gradient(ellipse at 50% 40%, rgba(107,92,231,0.04), transparent 60%)"
              : current === 1
                ? "radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.03), transparent 60%)"
                : "radial-gradient(ellipse at 50% 40%, rgba(107,92,231,0.03), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Section label */}
        <motion.p
          className="text-[11px] font-medium uppercase tracking-[0.3em] text-text-muted/40 mb-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          Client Stories
        </motion.p>

        {/* Giant decorative quote mark */}
        <div
          className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 heading-display text-[200px] sm:text-[280px] leading-none select-none"
          style={{
            background: "linear-gradient(180deg, rgba(201,168,76,0.08) 0%, transparent 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          &ldquo;
        </div>

        {/* Testimonial content — one at a time, cinematic */}
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction * -60, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {/* Quote */}
              <blockquote
                className="heading-display text-2xl sm:text-3xl lg:text-4xl text-text-primary/90 leading-snug italic"
                style={{ fontStyle: "italic" }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-10">
                <p className="text-base font-semibold text-text-primary">
                  {testimonial.name}
                </p>
                <div className="mt-1 mx-auto w-8 h-[1px] bg-luxury/40" />
                <p className="mt-2 text-xs text-text-muted/60">
                  {testimonial.role} &middot; {testimonial.program}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            onClick={() => go(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] text-text-muted transition-all hover:border-white/20 hover:text-text-primary"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Progress dots */}
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                  resetTimer();
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === current
                    ? "w-8 bg-luxury"
                    : "w-1.5 bg-white/10 hover:bg-white/20"
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] text-text-muted transition-all hover:border-white/20 hover:text-text-primary"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
