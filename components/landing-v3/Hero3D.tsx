"use client";

/* Hero3D — port of Concierge Hero v3.html (Claude Design handoff bundle).
   3D scene: tilted orbits with comet-trail satellites, a glassy UAE focus
   card with thickness, holographic mouse-tracked sheen, and per-tile
   diagonal-light alignment. CSS lives in Hero3D.module.css; JS here
   handles cursor-driven scene parallax, holographic shine, satellite
   glint tracking, and pill/tile coordinate measurement. */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { OpenQualifyButton } from "@/components/landing-v2/OpenQualifyButton";
import styles from "./Hero3D.module.css";

const ORBIT_TRAILS_1 = [
  { ang: -30, s: 3, o: 0.05, g1: 5, g2: 1, gop: 0.3 },
  { ang: -24, s: 4, o: 0.10, g1: 6, g2: 2, gop: 0.35 },
  { ang: -18, s: 5, o: 0.18, g1: 7, g2: 2, gop: 0.4 },
  { ang: -13, s: 6, o: 0.30, g1: 8, g2: 3, gop: 0.5 },
  { ang: -9,  s: 7, o: 0.45, g1: 10, g2: 3, gop: 0.6 },
  { ang: -5,  s: 9, o: 0.65, g1: 11, g2: 4, gop: 0.7 },
  { ang: -2,  s: 11, o: 0.85, g1: 12, g2: 4, gop: 0.8 },
];
const ORBIT_TRAILS_2 = [
  { ang: -26, s: 3, o: 0.05, g1: 5, g2: 1, gop: 0.3 },
  { ang: -20, s: 4, o: 0.10, g1: 6, g2: 2, gop: 0.35 },
  { ang: -15, s: 5, o: 0.20, g1: 7, g2: 2, gop: 0.4 },
  { ang: -11, s: 6, o: 0.32, g1: 8, g2: 3, gop: 0.5 },
  { ang: -7,  s: 8, o: 0.50, g1: 10, g2: 3, gop: 0.6 },
  { ang: -3,  s: 10, o: 0.72, g1: 11, g2: 4, gop: 0.75 },
];
const ORBIT_TRAILS_3 = [
  { ang: -32, s: 3, o: 0.05, g1: 5, g2: 1, gop: 0.3 },
  { ang: -25, s: 4, o: 0.10, g1: 6, g2: 2, gop: 0.35 },
  { ang: -19, s: 5, o: 0.20, g1: 7, g2: 2, gop: 0.4 },
  { ang: -14, s: 6, o: 0.32, g1: 8, g2: 3, gop: 0.5 },
  { ang: -9,  s: 8, o: 0.48, g1: 10, g2: 3, gop: 0.6 },
  { ang: -4,  s: 10, o: 0.70, g1: 11, g2: 4, gop: 0.75 },
];

type TrailDot = (typeof ORBIT_TRAILS_1)[number];

function dotStyle(t: TrailDot): React.CSSProperties {
  return {
    ["--s" as string]: `${t.s}px`,
    ["--o" as string]: t.o,
    ["--g1" as string]: `${t.g1}px`,
    ["--g2" as string]: `${t.g2}px`,
    ["--gop" as string]: t.gop,
  };
}
function trailStyle(ang: number): React.CSSProperties {
  return { ["--ang" as string]: `${ang}deg` };
}

export function Hero3D() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const holoRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const orbit1Ref = useRef<HTMLDivElement>(null);
  const orbit2Ref = useRef<HTMLDivElement>(null);
  const orbit3Ref = useRef<HTMLDivElement>(null);
  const lead1Ref = useRef<HTMLDivElement>(null);
  const lead2Ref = useRef<HTMLDivElement>(null);
  const lead3Ref = useRef<HTMLDivElement>(null);
  const glint1Ref = useRef<HTMLDivElement>(null);
  const glint2Ref = useRef<HTMLDivElement>(null);
  const glint3Ref = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);

  // ---- Mouse parallax + holographic shine + tile/glint tracking ----
  useEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const card = cardRef.current;
    const holo = holoRef.current;
    const sheen = sheenRef.current;
    const grain = grainRef.current;
    if (!scene || !stage || !card) return;

    let targetRX = 8, targetRY = -12;
    let curRX = 8, curRY = -12;
    let mouseActive = false;
    let mouseTimer: ReturnType<typeof setTimeout> | null = null;
    let targetMX = 50, targetMY = 50;
    let curMX = 50, curMY = 50;
    let targetCardRX = 0, targetCardRY = 0;
    let curCardRX = 0, curCardRY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRX = 8 - y * 14;
      targetRY = -12 - x * 16;
      mouseActive = true;
      if (mouseTimer) clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
        mouseActive = false;
        targetRX = 8; targetRY = -12;
        targetCardRX = 0; targetCardRY = 0;
      }, 1200);

      const cr = card.getBoundingClientRect();
      const lx = (e.clientX - cr.left) / cr.width;
      const ly = (e.clientY - cr.top) / cr.height;
      targetMX = Math.max(-0.2, Math.min(1.2, lx)) * 100;
      targetMY = Math.max(-0.2, Math.min(1.2, ly)) * 100;
      targetCardRY = Math.max(-5, Math.min(5, (lx - 0.5) * 8));
      targetCardRX = Math.max(-4, Math.min(4, -(ly - 0.5) * 6));
      const near =
        e.clientX > cr.left - 80 && e.clientX < cr.right + 80 &&
        e.clientY > cr.top - 80 && e.clientY < cr.bottom + 80;
      holo?.classList.toggle(styles.isActive, near);
      sheen?.classList.toggle(styles.isActive, near);
      card.classList.toggle(styles.isSheen, near);
    };
    const onLeave = () => {
      mouseActive = false;
      targetRX = 8; targetRY = -12;
      targetCardRX = 0; targetCardRY = 0;
      holo?.classList.remove(styles.isActive);
      sheen?.classList.remove(styles.isActive);
      card.classList.remove(styles.isSheen);
    };
    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const tick = () => {
      curRX += (targetRX - curRX) * 0.08;
      curRY += (targetRY - curRY) * 0.08;
      curMX += (targetMX - curMX) * 0.18;
      curMY += (targetMY - curMY) * 0.18;
      curCardRX += (targetCardRX - curCardRX) * 0.10;
      curCardRY += (targetCardRY - curCardRY) * 0.10;

      if (mouseActive) {
        stage.style.animation = "none";
        stage.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      } else {
        stage.style.animation = "";
        stage.style.transform = "";
      }
      if (holo) {
        holo.style.setProperty("--mx", `${curMX.toFixed(2)}%`);
        holo.style.setProperty("--my", `${curMY.toFixed(2)}%`);
        holo.style.setProperty("--ang", `${(curMX * 3.6).toFixed(1)}deg`);
      }
      if (grain) {
        grain.style.setProperty(
          "--ang",
          `${(curCardRY * 14 + curCardRX * 6 + 200).toFixed(1)}deg`
        );
      }
      card.style.transform = `translateZ(0) rotateX(${curCardRX.toFixed(2)}deg) rotateY(${curCardRY.toFixed(2)}deg)`;
      const tilt = Math.max(-1, Math.min(1, curCardRY / 5));
      const tsx = -120 + (tilt + 1) * 0.5 * 240;
      card.style.setProperty("--tile-sx", `${tsx.toFixed(2)}%`);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
      if (mouseTimer) clearTimeout(mouseTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---- Satellite-following glints + foil flake intensity ----
  useEffect(() => {
    const card = cardRef.current;
    const grain = grainRef.current;
    if (!card) return;
    const targets = [
      { lead: lead1Ref.current, glint: glint1Ref.current, orbit: orbit1Ref.current, max: 1.0 },
      { lead: lead2Ref.current, glint: glint2Ref.current, orbit: orbit2Ref.current, max: 0.95 },
      { lead: lead3Ref.current, glint: glint3Ref.current, orbit: orbit3Ref.current, max: 0.85 },
    ].filter((t): t is { lead: HTMLDivElement; glint: HTMLDivElement; orbit: HTMLDivElement; max: number } =>
      Boolean(t.lead && t.glint && t.orbit)
    );
    if (!targets.length) return;

    let raf = 0;
    const frame = () => {
      const cr = card.getBoundingClientRect();
      let peakGlow = 0;
      for (const t of targets) {
        const dr = t.lead.getBoundingClientRect();
        const sx = dr.left + dr.width / 2;
        const sy = dr.top + dr.height / 2;
        let xPct = ((sx - cr.left) / cr.width) * 100;
        let yPct = ((sy - cr.top) / cr.height) * 100;
        const dx = Math.max(0, Math.max(cr.left - sx, sx - cr.right));
        const dy = Math.max(0, Math.max(cr.top - sy, sy - cr.bottom));
        const dist = Math.hypot(dx, dy);
        const fade = Math.exp(-dist / 140);
        const orbR = t.orbit.getBoundingClientRect();
        const orbCY = orbR.top + orbR.height / 2;
        const dyFromCenter = sy - orbCY;
        const frontFactor = 1 / (1 + Math.exp(-dyFromCenter / 24));
        xPct = Math.max(-15, Math.min(115, xPct));
        yPct = Math.max(-15, Math.min(115, yPct));
        t.glint.style.left = `${xPct}%`;
        t.glint.style.top = `${yPct}%`;
        const opacity = fade * frontFactor * t.max;
        if (opacity > peakGlow) peakGlow = opacity;
        t.glint.style.opacity = opacity.toFixed(3);
      }
      if (grain) {
        const foil = 0.015 + peakGlow * 0.07;
        grain.style.setProperty("--foil", foil.toFixed(3));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- Measure card + tile geometry → CSS vars (sheen alignment) ----
  useEffect(() => {
    const card = cardRef.current;
    const tilesContainer = tilesRef.current;
    const pill = pillRef.current;
    if (!card) return;
    const measure = () => {
      const cr = card.getBoundingClientRect();
      card.style.setProperty("--card-w", `${cr.width.toFixed(2)}px`);
      card.style.setProperty("--card-h", `${cr.height.toFixed(2)}px`);
      if (tilesContainer) {
        const tiles = tilesContainer.querySelectorAll<HTMLElement>(`.${styles.infoTile}`);
        tiles.forEach((tile) => {
          const tr = tile.getBoundingClientRect();
          tile.style.setProperty("--tile-offset", `${(tr.left - cr.left).toFixed(2)}px`);
          tile.style.setProperty("--tile-y", `${(tr.top - cr.top).toFixed(2)}px`);
        });
      }
      if (pill) {
        const pr = pill.getBoundingClientRect();
        pill.style.setProperty("--pill-offset", `${(pr.left - cr.left).toFixed(2)}px`);
        pill.style.setProperty("--pill-y", `${(pr.top - cr.top).toFixed(2)}px`);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const t1 = setTimeout(measure, 200);
    const t2 = setTimeout(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className={styles.hero3d}>
      {/* Background layers (scoped to hero) */}
      <div className={styles.bg} aria-hidden>
        <div className={styles.bgRadial} />
        <div className={styles.bgStars} />
        <div className={styles.bgSkyline}>
          <Image
            src="/images/landing-v3/dubai-skyline.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
          />
        </div>
      </div>

      <div className={styles.page}>
        <main className={styles.hero}>
          {/* Left: copy + CTAs + stats */}
          <section>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              Private advisory for global mobility
            </span>

            <h1 className={styles.headline}>
              Build a more<br />
              <em>sovereign life</em><br />
              <span className={styles.tail}>with a jurisdiction strategy that fits.</span>
            </h1>

            <p className={styles.lede}>
              Concierge advises founders, investors, and globally mobile families on second
              citizenship, residency planning, and international positioning. Start with a
              discreet qualification review, then move forward with a route built around your
              actual constraints.
            </p>

            <div className={styles.ctas}>
              <OpenQualifyButton className={styles.btnPrimary}>
                Get Qualified
                <ArrowRight />
              </OpenQualifyButton>
              <Link href="/programs" className={styles.btnSecondary}>
                Browse Programmes
                <ArrowUpRight />
              </Link>
            </div>

            <div className={styles.stats}>
              <div>
                <svg className={styles.statIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="5" r="2.2" />
                  <circle cx="11.5" cy="6" r="1.7" />
                  <path d="M2 13c.5-2 2-3 4-3s3.5 1 4 3M9.5 13c.4-1.5 1.5-2.2 3-2.2s2.6.7 3 2.2" />
                </svg>
                <div className={styles.statLabel}>Clients guided</div>
                <div className={styles.statValue}>500+</div>
                <div className={styles.statText}>Private advisory across citizenship, residency, and global positioning.</div>
              </div>
              <div>
                <svg className={styles.statIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M2 8h12M8 2c1.8 2 2.6 4 2.6 6S9.8 14 8 14M8 2c-1.8 2-2.6 4-2.6 6S6.2 14 8 14" />
                </svg>
                <div className={styles.statLabel}>Active programmes</div>
                <div className={styles.statValue}>15+</div>
                <div className={styles.statText}>Real routes across the Caribbean, Europe, the Middle East, and the Americas.</div>
              </div>
              <div>
                <svg className={styles.statIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
                  <path d="M8 1.5L2.5 4v4.5C2.5 11.5 5 13.7 8 14.5c3-.8 5.5-3 5.5-6V4L8 1.5z" />
                  <path d="M5.5 8l1.8 1.8L10.5 6.5" />
                </svg>
                <div className={styles.statLabel}>Approval rate</div>
                <div className={styles.statValue}>98%</div>
                <div className={styles.statText}>Careful screening, document discipline, and experienced submission support.</div>
              </div>
            </div>
          </section>

          {/* Right: 3D Scene */}
          <section>
            <div className={styles.scene} ref={sceneRef}>
              <div className={styles.stage} ref={stageRef}>

                <div className={`${styles.orbit} ${styles.orbit1}`} ref={orbit1Ref}>
                  <svg className={`${styles.orbitArc} ${styles.back}`} viewBox="-100 -100 200 100">
                    <path className={styles.ringBase} d="M -98 0 A 98 98 0 0 1 98 0" />
                  </svg>
                  <svg className={`${styles.orbitArc} ${styles.front}`} viewBox="-100 0 200 100">
                    <path className={styles.ringBase} d="M -98 0 A 98 98 0 0 0 98 0" />
                  </svg>
                  <div className={styles.satTrack}>
                    {ORBIT_TRAILS_1.map((t, i) => (
                      <div key={i} className={styles.trail} style={trailStyle(t.ang)}>
                        <div className={styles.dot} style={dotStyle(t)} />
                      </div>
                    ))}
                    <div className={`${styles.trail} ${styles.lead}`} style={trailStyle(0)}>
                      <div className={styles.dot} ref={lead1Ref} style={{ ["--s" as string]: "13px", ["--o" as string]: 1 }} />
                    </div>
                  </div>
                </div>

                <div className={`${styles.orbit} ${styles.orbit2}`} ref={orbit2Ref}>
                  <svg className={`${styles.orbitArc} ${styles.back}`} viewBox="-100 -100 200 100">
                    <path className={styles.ringBase} d="M -98 0 A 98 98 0 0 1 98 0" />
                  </svg>
                  <svg className={`${styles.orbitArc} ${styles.front}`} viewBox="-100 0 200 100">
                    <path className={styles.ringBase} d="M -98 0 A 98 98 0 0 0 98 0" />
                  </svg>
                  <div className={styles.satTrack}>
                    {ORBIT_TRAILS_2.map((t, i) => (
                      <div key={i} className={styles.trail} style={trailStyle(t.ang)}>
                        <div className={styles.dot} style={dotStyle(t)} />
                      </div>
                    ))}
                    <div className={`${styles.trail} ${styles.lead}`} style={trailStyle(0)}>
                      <div className={styles.dot} ref={lead2Ref} style={{ ["--s" as string]: "12px", ["--o" as string]: 1 }} />
                    </div>
                  </div>
                </div>

                <div className={`${styles.orbit} ${styles.orbit3}`} ref={orbit3Ref}>
                  <svg className={`${styles.orbitArc} ${styles.back}`} viewBox="-100 -100 200 100">
                    <path className={styles.ringBase} d="M -98 0 A 98 98 0 0 1 98 0" />
                  </svg>
                  <svg className={`${styles.orbitArc} ${styles.front}`} viewBox="-100 0 200 100">
                    <path className={styles.ringBase} d="M -98 0 A 98 98 0 0 0 98 0" />
                  </svg>
                  <div className={styles.satTrack}>
                    {ORBIT_TRAILS_3.map((t, i) => (
                      <div key={i} className={styles.trail} style={trailStyle(t.ang)}>
                        <div className={styles.dot} style={dotStyle(t)} />
                      </div>
                    ))}
                    <div className={`${styles.trail} ${styles.lead}`} style={trailStyle(0)}>
                      <div className={styles.dot} ref={lead3Ref} style={{ ["--s" as string]: "12px", ["--o" as string]: 1 }} />
                    </div>
                  </div>
                </div>

                {/* The 3D card */}
                <div className={styles.card3d}>
                  <div className={styles.cardShadow} aria-hidden />
                  <div className={styles.cardBack} aria-hidden />
                  <div className={`${styles.cardSide} ${styles.cardSideTop}`} aria-hidden />
                  <div className={`${styles.cardSide} ${styles.cardSideBottom}`} aria-hidden />
                  <div className={`${styles.cardSide} ${styles.cardSideLeft}`} aria-hidden />
                  <div className={`${styles.cardSide} ${styles.cardSideRight}`} aria-hidden />

                  <div className={styles.card} ref={cardRef}>
                    <div className={styles.cardHolo} aria-hidden ref={holoRef} />
                    <div className={styles.cardShine} aria-hidden>
                      <div className={`${styles.glint} ${styles.glint1}`} ref={glint1Ref} />
                      <div className={`${styles.glint} ${styles.glint2}`} ref={glint2Ref} />
                      <div className={`${styles.glint} ${styles.glint3}`} ref={glint3Ref} />
                    </div>
                    <div className={styles.cardGrain} aria-hidden ref={grainRef} />
                    <div className={styles.cardSheen} aria-hidden ref={sheenRef} />

                    <div className={styles.cardBg} aria-hidden>
                      <Image
                        src="/images/landing-v3/dubai-burj.jpg"
                        alt=""
                        fill
                        sizes="(min-width: 1080px) 460px, 80vw"
                        priority
                      />
                    </div>

                    <div className={styles.cardContent} ref={tilesRef}>
                      <span className={styles.cardPill} ref={pillRef}>
                        <span className={styles.dot} />
                        Focus route
                      </span>

                      <div className={styles.cardEyebrow}>Residency</div>
                      <h2 className={styles.cardTitle}>UAE</h2>

                      <p className={styles.cardDesc}>
                        Zero income tax, world-class lifestyle. Dubai&apos;s Golden Visa is the ultimate base for global entrepreneurs.
                      </p>

                      <div className={styles.cardInfo}>
                        <div className={styles.infoTile}>
                          <div className={styles.infoLabel}>Entry Point</div>
                          <div className={styles.infoValue}>From<br />AED 100,000</div>
                        </div>
                        <div className={styles.infoTile}>
                          <div className={styles.infoLabel}>Timeline</div>
                          <div className={styles.infoValue}>2 months</div>
                        </div>
                        <div className={styles.infoTile}>
                          <div className={styles.infoLabel}>Access</div>
                          <div className={styles.infoValue}>183 visa-free</div>
                        </div>
                      </div>

                      <Link href="/programs/dubai" className={styles.cardLink}>
                        Review route
                        <ArrowUpRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Region labels */}
              <div className={styles.labels}>
                <div className={`${styles.lbl} ${styles.lblAmericas}`}>Americas</div>
                <div className={`${styles.lbl} ${styles.lblEurope}`}>Europe</div>
                <div className={`${styles.lbl} ${styles.lblCaribbean}`}>Caribbean</div>
              </div>

              {/* Floating dust */}
              <div className={styles.dust} aria-hidden>
                <span style={{ top: "18%", left: "14%", ["--d" as string]: "12s" } as React.CSSProperties} />
                <span style={{ top: "32%", left: "78%", ["--d" as string]: "16s" } as React.CSSProperties} />
                <span style={{ top: "62%", left: "22%", ["--d" as string]: "14s" } as React.CSSProperties} />
                <span style={{ top: "78%", left: "68%", ["--d" as string]: "18s" } as React.CSSProperties} />
                <span style={{ top: "8%", left: "46%", ["--d" as string]: "11s" } as React.CSSProperties} />
                <span style={{ top: "46%", left: "88%", ["--d" as string]: "13s" } as React.CSSProperties} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
    </svg>
  );
}
function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10L10 4M5 4h5v5" />
    </svg>
  );
}
