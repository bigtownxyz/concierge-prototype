"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const gradients = [
  "linear-gradient(135deg, #353A63, #5A6397)",
  "linear-gradient(135deg, #424975, #8D90A3)",
  "linear-gradient(135deg, #5A6397, #353A63)",
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
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

  const t = TESTIMONIALS[current];

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            <span className="font-semibold text-foreground">What Our</span>{" "}
            <span className="font-light text-foreground/50 italic">Clients Say</span>
          </h2>
        </motion.div>

        {/* Single testimonial display */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {/* Avatar */}
                <div
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-white font-semibold text-sm"
                  style={{ background: gradients[current % gradients.length] }}
                >
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>

                {/* Quote */}
                <blockquote className="text-lg sm:text-xl font-light text-foreground/80 leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.role} &middot; {t.program}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => go(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); resetTimer(); }}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    i === current ? "bg-foreground scale-125" : "bg-border hover:bg-muted-foreground"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => go(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
