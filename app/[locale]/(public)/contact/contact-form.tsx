"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl bg-glass-bg border border-glass-border p-10 text-center">
        <div className="mb-4 text-4xl">&#10003;</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Message Sent
        </h2>
        <p className="text-sm text-text-muted">
          Thank you for reaching out. Our team will respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            className={cn(
              "w-full rounded-xl bg-glass-bg border border-glass-border py-3 px-4",
              "text-sm text-text-primary placeholder:text-text-muted/40",
              "focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20",
              "transition-colors"
            )}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            className={cn(
              "w-full rounded-xl bg-glass-bg border border-glass-border py-3 px-4",
              "text-sm text-text-primary placeholder:text-text-muted/40",
              "focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20",
              "transition-colors"
            )}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">
          Subject
        </label>
        <input
          type="text"
          className={cn(
            "w-full rounded-xl bg-glass-bg border border-glass-border py-3 px-4",
            "text-sm text-text-primary placeholder:text-text-muted/40",
            "focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20",
            "transition-colors"
          )}
          placeholder="How can we help?"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">
          Message
        </label>
        <textarea
          rows={5}
          required
          className={cn(
            "w-full rounded-xl bg-glass-bg border border-glass-border py-3 px-4",
            "text-sm text-text-primary placeholder:text-text-muted/40",
            "focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20",
            "transition-colors resize-none"
          )}
          placeholder="Tell us about your situation and goals..."
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-luxury py-3.5 text-sm font-semibold text-background transition-all hover:bg-luxury-hover hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]"
      >
        Send Message
      </button>
    </form>
  );
}
