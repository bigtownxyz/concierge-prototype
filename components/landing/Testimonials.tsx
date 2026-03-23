"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import { Quote } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-14">
          <h2 className="heading-display text-4xl sm:text-5xl text-text-primary mb-4">
            Client Testimonials
          </h2>
          <p className="text-text-muted text-lg">
            Trusted by professionals and entrepreneurs worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.12,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative rounded-2xl bg-glass-bg border border-glass-border p-8 backdrop-blur-xl"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/15 mb-4" />

              {/* Quote text */}
              <p className="text-sm leading-relaxed text-text-secondary mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar placeholder — initials */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {testimonial.role} &middot; {testimonial.program}
                  </p>
                </div>
              </div>

              {/* Subtle top-left glow */}
              <div
                className="pointer-events-none absolute top-0 left-0 h-24 w-24 rounded-2xl opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(107,92,231,0.08), transparent 70%)",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
