"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiTriggerProps {
  /** When true, fires the confetti burst */
  trigger: boolean;
  /** Called after animation completes */
  onComplete?: () => void;
}

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8D48B";
const VIOLET = "#6B5CE7";
const VIOLET_LIGHT = "#9B8FEF";

export function ConfettiTrigger({ trigger, onComplete }: ConfettiTriggerProps) {
  const fire = useCallback(() => {
    const colors = [GOLD, GOLD_LIGHT, VIOLET, VIOLET_LIGHT];

    // Center burst — stately, not chaotic
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6, x: 0.5 },
      colors,
      gravity: 0.8,
      scalar: 1.1,
      drift: 0,
      ticks: 200,
      shapes: ["circle", "square"],
      disableForReducedMotion: true,
    });

    // Delayed side bursts — left
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0.25, y: 0.65 },
        colors,
        gravity: 0.9,
        scalar: 0.9,
        ticks: 180,
        disableForReducedMotion: true,
      });
    }, 150);

    // Right
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 0.75, y: 0.65 },
        colors,
        gravity: 0.9,
        scalar: 0.9,
        ticks: 180,
        disableForReducedMotion: true,
      });
    }, 250);

    // Final gold shimmer — a finishing touch
    setTimeout(() => {
      confetti({
        particleCount: 15,
        spread: 100,
        origin: { y: 0.55, x: 0.5 },
        colors: [GOLD, GOLD_LIGHT],
        gravity: 0.6,
        scalar: 0.7,
        ticks: 160,
        shapes: ["circle"],
        disableForReducedMotion: true,
      });
      onComplete?.();
    }, 500);
  }, [onComplete]);

  useEffect(() => {
    if (trigger) {
      fire();
    }
  }, [trigger, fire]);

  return null;
}
