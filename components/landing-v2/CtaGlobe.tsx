"use client";

/* Animated city-lights globe for the final CTA.

   Canvas renders two layers per frame:
   1. A low-opacity dot grid covering the sphere (only front hemisphere
      visible, opacity scales with z-depth so it reads as 3D).
   2. Bright warm dots at ~45 real city coordinates that come into and
      out of view as the globe slowly rotates around the Y axis.

   Two HTML pin labels sit on top at fixed screen positions ("Home" upper
   right, "Freedom" lower left), with a Tailwind animate-ping ring for a
   subtle pulse. Respects prefers-reduced-motion: stops rotation, keeps
   the static frame. */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const SANS = { fontFamily: "var(--font-manrope), 'Manrope', sans-serif" };

// Real coordinates of major cities (lat, lng) for the "city lights" layer
const CITIES: ReadonlyArray<readonly [number, number]> = [
  [40.7, -74], [51.5, -0.1], [35.7, 139.7], [34.0, -118.2], [48.9, 2.4],
  [25.3, 55.3], [1.3, 103.8], [22.3, 114.2], [-33.9, 151.2], [-23.5, -46.6],
  [19.4, -99.1], [19.1, 72.9], [6.5, 3.4], [30.0, 31.2], [55.7, 37.6],
  [41.0, 28.9], [-34.6, -58.4], [41.9, -87.6], [43.7, -79.4], [39.9, 116.4],
  [31.2, 121.5], [37.6, 127.0], [13.8, 100.5], [-6.2, 106.8], [-26.2, 28.0],
  [-1.3, 36.8], [52.5, 13.4], [40.4, -3.7], [-12.0, -77.0], [4.7, -74.1],
  [49.3, -123.1], [25.8, -80.2], [37.9, 23.7], [38.7, -9.1], [25.3, 51.5],
  [24.7, 46.7], [24.9, 67.0], [28.6, 77.2], [14.6, 121.0], [29.8, -95.4],
  [45.5, -73.6], [-22.9, -43.2], [-37.8, 144.9], [33.7, -84.4], [47.6, -122.3],
];

// Background sphere dot grid (equal-area parallels)
const BG_DOTS: ReadonlyArray<readonly [number, number]> = (() => {
  const out: [number, number][] = [];
  for (let lat = -88; lat <= 88; lat += 5) {
    const cosLat = Math.cos((lat * Math.PI) / 180);
    const ring = cosLat < 0.05 ? 1 : Math.max(10, Math.round((360 * cosLat) / 5));
    for (let i = 0; i < ring; i++) {
      const lng = (i / ring) * 360 - 180;
      out.push([lat, lng]);
    }
  }
  return out;
})();

const TILT_DEG = 18;
const ROTATION_PER_FRAME = 0.05; // ~30s per revolution at 60fps

export function CtaGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const RES = 900;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = RES * dpr;
    canvas.height = RES * dpr;
    ctx.scale(dpr, dpr);

    const cx = RES * 0.5;
    const cy = RES * 0.5;
    const radius = RES * 0.42;
    const tilt = (TILT_DEG * Math.PI) / 180;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    let rotation = -30;
    let raf = 0;

    const project = (lat: number, lng: number) => {
      const latRad = (lat * Math.PI) / 180;
      const lngRad = ((lng + rotation) * Math.PI) / 180;
      const cosLat = Math.cos(latRad);
      const x3 = cosLat * Math.sin(lngRad);
      const y3 = Math.sin(latRad);
      const z3 = cosLat * Math.cos(lngRad);
      const yT = y3 * cosT - z3 * sinT;
      const zT = y3 * sinT + z3 * cosT;
      return {
        x: cx + x3 * radius,
        y: cy - yT * radius,
        z: zT,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, RES, RES);

      // Faint atmospheric halo
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.18);
      halo.addColorStop(0, "rgba(120, 140, 220, 0.18)");
      halo.addColorStop(1, "rgba(120, 140, 220, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Subtle outer ring
      ctx.strokeStyle = "rgba(187, 196, 247, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Background sphere dots
      for (const [lat, lng] of BG_DOTS) {
        const p = project(lat, lng);
        if (p.z < -0.05) continue;
        const front = Math.max(0, p.z);
        ctx.fillStyle = `rgba(187, 196, 247, ${0.04 + 0.14 * front})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.6 + 0.55 * front, 0, Math.PI * 2);
        ctx.fill();
      }

      // City lights — warm glow + bright core
      for (const [lat, lng] of CITIES) {
        const p = project(lat, lng);
        if (p.z < 0.02) continue;
        const front = Math.max(0, p.z);
        const glowR = 5 + 4 * front;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grad.addColorStop(0, `rgba(255, 210, 130, ${0.55 * front})`);
        grad.addColorStop(1, "rgba(255, 210, 130, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 235, 200, ${0.6 + 0.35 * front})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + 0.6 * front, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = () => {
      rotation = (rotation + ROTATION_PER_FRAME) % 360;
      draw();
      raf = requestAnimationFrame(tick);
    };

    draw();
    if (!prefersReducedMotion) {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        aria-hidden
      />

      {/* Home pin — upper right of the globe */}
      <div className="absolute left-[58%] top-[20%] flex items-center gap-3">
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-[#bbc4f7]/45" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#dfe2eb] shadow-[0_0_8px_rgba(187,196,247,0.6)]" />
        </span>
        <div className="flex flex-col">
          <span
            className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#9aa0b8]"
            style={SANS}
          >
            Your location
          </span>
          <span
            className="mt-1 text-[1rem] text-[#dfe2eb]"
            style={{ ...SANS, fontWeight: 500 }}
          >
            Home
          </span>
        </div>
      </div>

      {/* Freedom pin — lower left of the globe */}
      <div className="absolute left-[18%] top-[78%] flex items-center gap-3">
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-[#bbc4f7]/45" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#dfe2eb] shadow-[0_0_8px_rgba(187,196,247,0.6)]" />
        </span>
        <div className="flex flex-col">
          <span
            className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#9aa0b8]"
            style={SANS}
          >
            Your destination
          </span>
          <span
            className="mt-1 text-[1rem] text-[#dfe2eb]"
            style={{ ...SANS, fontWeight: 500 }}
          >
            Freedom
          </span>
        </div>
      </div>
    </div>
  );
}
