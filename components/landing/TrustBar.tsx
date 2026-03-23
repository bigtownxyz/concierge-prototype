"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Clients Served" },
  { value: "15", label: "Programmes" },
  { value: "40+", label: "Countries" },
  { value: "98%", label: "Success Rate" },
];

export function TrustBar() {
  return (
    <section
      className="border-y py-12 px-6"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <p className="heading-display text-3xl sm:text-4xl text-text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-text-muted/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
