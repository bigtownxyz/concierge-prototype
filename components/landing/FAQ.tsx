"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FAQ_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Two-column editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          {/* Left — large stacked heading */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="lg:sticky lg:top-32">
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary/50 mb-4">
                FAQ
              </p>
              <h2 className="heading-display text-4xl sm:text-5xl lg:text-[3.5rem] text-text-primary leading-[1.05]">
                Common
                <br />
                <span className="text-text-muted/40">Questions</span>
              </h2>
              <p className="mt-6 text-sm text-text-muted/60 leading-relaxed">
                Everything you need to know about second citizenship and
                residency programmes.
              </p>
            </div>
          </motion.div>

          {/* Right — accordion items */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-white/[0.04]">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      delay: 0.1 + i * 0.06,
                      duration: 0.5,
                      ease: EASE,
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="group flex w-full items-start justify-between py-7 text-left"
                    >
                      <span
                        className={cn(
                          "text-base sm:text-lg font-medium pr-8 transition-colors duration-300",
                          isOpen ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"
                        )}
                      >
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                          isOpen
                            ? "border-luxury/30 bg-luxury/10 rotate-45"
                            : "border-white/[0.06] group-hover:border-white/20"
                        )}
                      >
                        <Plus
                          className={cn(
                            "h-3 w-3 transition-colors",
                            isOpen ? "text-luxury" : "text-text-muted"
                          )}
                        />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="pb-7 pr-12">
                            <div className="flex gap-4">
                              {/* Gold left accent bar */}
                              <div className="w-[2px] shrink-0 rounded-full bg-gradient-to-b from-luxury/40 to-transparent" />
                              <p className="text-sm leading-relaxed text-text-muted/80">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
