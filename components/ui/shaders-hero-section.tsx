"use client"

import { PulsingBorder, MeshGradient } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { Link } from "@/i18n/navigation"
import type React from "react"
import { useRef, useState, useEffect, useMemo } from "react"
import { Globe, Shield, Zap } from "lucide-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden pb-8"
      style={{ backgroundColor: "#0D0D1A" }}
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
        </defs>
      </svg>

      {/* Primary animated mesh — deep indigo brand palette */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#0D0D1A", "#1E1C30", "#353A63", "#181828", "#424975"]}
        speed={0.25}
        distortion={0.3}
        swirl={0.1}
      />

      {/* Second mesh layer for depth */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#0D0D1A", "#5A6397", "#28283A", "#0D0D1A"]}
        speed={0.15}
        distortion={0.5}
      />

      {/* Vignette overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A] via-transparent to-[#0D0D1A]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D1A]/70 via-transparent to-transparent pointer-events-none" />

      {children}
    </div>
  )
}

export function PulsingCircle() {
  return (
    <div className="absolute bottom-24 right-10 z-30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <PulsingBorder
          colors={["#5A6397", "#B8BAC7", "#F5F5F6", "#424975", "#8D90A3", "#353A63", "#A0A8CC"]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          spots={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{ width: "60px", height: "60px", borderRadius: "50%" }}
        />
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="concierge-circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text fontSize="8.5" fill="rgba(255,255,255,0.45)" letterSpacing="1">
            <textPath href="#concierge-circle" startOffset="0%">
              Second Citizenship • Expert Guidance • By Investment •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}

const TRUST_STATS = [
  { icon: Shield, value: "500+", label: "Clients served" },
  { icon: Globe, value: "15+", label: "Programs" },
  { icon: Zap, value: "3–6 mo", label: "Processing" },
]

const CYCLING_COUNTRIES = [
  "Grenada",
  "Portugal",
  "Dominica",
  "Dubai",
  "St Kitts",
  "Greece",
  "Serbia",
  "Antigua",
]

export function HeroContent() {
  const [countryIndex, setCountryIndex] = useState(0)
  const countries = useMemo(() => CYCLING_COUNTRIES, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCountryIndex((prev) => (prev + 1) % countries.length)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [countryIndex, countries])

  return (
    <main className="absolute inset-0 z-20 flex items-center justify-center pt-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* Badge */}
        <div className="flex justify-center mb-5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 relative"
            style={{ filter: "url(#glass-effect)" }}
          >
            <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
            <Globe className="w-3 h-3 text-white/50" />
            <span className="text-white/80 text-xs font-light tracking-wide relative z-10">
              Trusted by 500+ clients worldwide
            </span>
          </div>
        </div>

        {/* Heading with cycling country */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white mb-5">
          <span className="font-semibold">Your Pathway </span>
          <span className="font-light text-white/45 italic">to</span>
          <span className="relative flex w-full justify-center overflow-hidden md:pb-4 md:pt-1 h-[1.15em]">
            &nbsp;
            {countries.map((country, index) => (
              <motion.span
                key={index}
                className="absolute font-semibold"
                initial={{ opacity: 0, y: "-100" }}
                transition={{ type: "spring", stiffness: 50 }}
                animate={
                  countryIndex === index
                    ? { y: 0, opacity: 1 }
                    : { y: countryIndex > index ? -150 : 150, opacity: 0 }
                }
              >
                {country}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm font-light text-white/55 mb-8 leading-relaxed max-w-sm mx-auto">
          Expert guidance through citizenship by investment, golden visas, and residency programs —
          matched to your goals, budget, and timeline.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-qualify-modal"))}
            className="px-7 py-2.5 rounded-full bg-white text-[#0D0D1A] font-medium text-xs tracking-wide transition-all duration-200 hover:bg-white/90"
          >
            Get Qualified Free
          </button>
          <Link
            href="/programs"
            className="px-7 py-2.5 rounded-full border border-white/25 text-white/80 font-light text-xs tracking-wide transition-all duration-200 hover:bg-white/8 hover:border-white/40"
          >
            Explore Programs
          </Link>
        </div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-center gap-6"
        >
          {TRUST_STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-white/30" />
              <span className="text-xs text-white/50 font-light">
                <span className="text-white/70 font-medium">{value}</span> {label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  )
}
