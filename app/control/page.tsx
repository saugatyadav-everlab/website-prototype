"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { useDialKit } from "dialkit";
import dynamic from "next/dynamic";

const DialOverlay = dynamic(() => import("../components/DialOverlay"), { ssr: false });

const FONT = "'Saans', Inter, system-ui, sans-serif";
const ORANGE = "#FF6B35";

// ── Image transition presets ─────────────────────────────────────────────────
// Presets are DIRECTION-AWARE: `dir` is +1 when scrolling down (next slide) and
// -1 when scrolling up (previous slide), so masks/pushes reveal in the same
// direction as the scroll. `over` = incoming sits on top and reveals over the
// old image held beneath; otherwise the two cross-animate.
type Preset = {
  over: boolean;
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit: Record<string, unknown>;
};

const TRANSITION_NAMES = ["Wipe", "Noise Wipe", "Blur Dissolve"];

// Both presets keep the OLD image held fully opaque beneath (`over: true`,
// exit holds opacity 1) so the previous/next image is always behind the
// incoming one — the 4 images read as one continuous barrel, never gray.
function getPreset(name: string, dir: number, zoom: number, blur: number): Preset {
  const down = dir >= 0;
  switch (name) {
    // Direction-aware mask wipe + zoom. Down → reveal from bottom; up → from top.
    case "Wipe":
      return {
        over: true,
        initial: { clipPath: down ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: zoom },
        animate: { clipPath: "inset(0% 0% 0% 0%)", scale: 1 },
        exit: { opacity: 1 },
      };
    // Defocus dissolve + zoom, fading in over the opaque old image
    case "Blur Dissolve":
      return {
        over: true,
        initial: { opacity: 0, filter: `blur(${blur}px)`, scale: zoom },
        animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
        exit: { opacity: 1 },
      };
    default:
      return getPreset("Wipe", dir, zoom, blur);
  }
}

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    title: "Build your health profile",
    subtitle: "Review your health history and get a care plan tailored to your unique goals and risk profile.",
    image: "/control/slide-1.png",
  },
  {
    title: "Access tests & treatments",
    subtitle: "Advanced bloods, full-body scans, treatments and specialist care, available whenever you need them.",
    image: "/control/slide-2.png",
  },
  {
    title: "Understand your results",
    subtitle: "See what each result means for you: what's working, what's not, and what to keep an eye on, measured against your personalised targets",
    image: "/control/slide-3.png",
  },
  {
    title: "Get a doctor-built roadmap",
    subtitle: "A clear health plan built around your goals and risks, not a generic checklist.",
    image: "/control/slide-4.png",
  },
];

export default function ControlPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(0); // image shown on the base layer (the "from" image)
  const [dir, setDir] = useState(1); // scroll direction: +1 down/next, -1 up/prev
  const prevActive = useRef(0);

  // DialKit — transition style, timing (duration + easing editor), zoom, and
  // per-style controls (blur amount; noise scale/edge for the organic reveal).
  const cfg = useDialKit("Image Transition", {
    style: { type: "select" as const, options: TRANSITION_NAMES, value: "Wipe" },
    // Easing control bundles duration + a cubic-bezier visualiser/editor
    timing: { type: "easing" as const, duration: 0.6, ease: [0.5, 0, 0, 1] as [number, number, number, number] },
    zoom: [1.2, 1, 2, 0.01],   // 1.2 = 120%→100% (Lottie reference); 1 = no zoom
    blur: [28, 0, 80, 1],      // Blur Dissolve: blur amount (px)
    noise: {                   // Noise Wipe: organic edge
      scale: [0.012, 0.002, 0.05, 0.001], // turbulence frequency (smaller = bigger blobs)
      edge: [44, 0, 160, 1],              // edge displacement amount (px)
    },
  });

  // Normalise the timing control → a framer-motion transition
  const timing = cfg.timing;
  const trans =
    timing.type === "spring"
      ? timing
      : { duration: timing.duration, ease: timing.ease };

  const preset = getPreset(cfg.style, dir, cfg.zoom, cfg.blur);

  // Track the right panel's pixel size (for the SVG noise mask viewBox)
  const panelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 700 });
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sticky-scroll: scroll progress through the tall section drives the step
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(SLIDES.length - 1, Math.max(0, Math.floor(v * SLIDES.length)));
    if (idx !== prevActive.current) {
      setDir(idx > prevActive.current ? 1 : -1);
      prevActive.current = idx;
      setActive(idx);
    }
  });

  // Jump the page so a given step is centered in its scroll range. Uses an
  // INSTANT jump (not smooth) so the scroll-driven active doesn't sweep through
  // every intermediate step — which would flicker the accordion open/closed.
  const goToStep = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.offsetTop;
    const scrollable = el.offsetHeight - window.innerHeight;
    const target = top + (scrollable * (i + 0.5)) / SLIDES.length;
    window.scrollTo({ top: target, behavior: "auto" });
  };

  return (
    <div
      ref={sectionRef}
      style={{ height: `${SLIDES.length * 100}vh`, background: "#fff", position: "relative" }}
    >
      <DialOverlay />
      {/* Sticky viewport */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
        }}
      >
        <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", display: "flex", gap: 64, alignItems: "stretch" }}>
          {/* ── Left column ─────────────────────────────────────────── */}
          <div
            style={{
              width: 400,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              height: 700,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, lineHeight: "38px", color: "#000", margin: 0 }}>
                  Take control
                  <br />
                  <span style={{ color: "rgba(0,0,0,0.48)" }}>of your health.</span>
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 18, fontWeight: 400, lineHeight: "22px", color: "rgba(0,0,0,0.48)", margin: 0 }}>
                  Developed by doctors with deep expertise in longevity and preventative
                  health, Everlab provides access to assessments across 1,000+ health
                  markers to support your long-term health.
                </p>
              </div>

              <button
                style={{
                  height: 56,
                  padding: "0 32px",
                  borderRadius: 10000,
                  border: "none",
                  background: "#000",
                  color: "#fff",
                  fontFamily: FONT,
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: "18px",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                Get started for free
              </button>
            </div>

            {/* Selector list — fixed-height block pinned to the bottom; items are
                TOP-anchored inside so activating one never moves the items above it. */}
            <div style={{ display: "flex", flexDirection: "column", paddingLeft: 24, marginTop: "auto", height: 324 }}>
              {SLIDES.map((s, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={s.title}
                    onClick={() => goToStep(i)}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "20px 0",
                      cursor: "pointer",
                      borderBottom: i < SLIDES.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -24,
                        top: 25,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: isActive ? ORANGE : "transparent",
                        border: isActive ? "none" : "1.5px solid rgba(0,0,0,0.2)",
                        transition: "background 0.25s, border-color 0.25s",
                      }}
                    />
                    <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 500, lineHeight: "22px", color: "#000" }}>
                      {s.title}
                    </span>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.p
                          // Fixed reserved height (tallest subtitle = 3 lines = 60px)
                          // so the bottom-anchored list never changes total height
                          // and items above never shift.
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 60, opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          style={{ fontFamily: FONT, fontSize: 16, fontWeight: 400, lineHeight: "20px", color: "rgba(0,0,0,0.48)", margin: 0, overflow: "hidden" }}
                        >
                          {s.subtitle}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right panel — selectable image transitions ──────────── */}
          <div
            ref={panelRef}
            style={{
              flex: 1,
              minWidth: 0,
              height: 700,
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#e9e9e9",
            }}
          >
            {/* Barrel: base layer holds the previous ("from") image fully opaque
                so the incoming one always reveals over a real image — never gray. */}
            <img
              src={SLIDES[settled].image}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            />

            {cfg.style === "Noise Wipe" ? (
              // Organic reveal: a white rect grows from the scroll edge, its edge
              // displaced by fractal noise → soft, growing, organic boundary.
              <svg
                key={`noise-${active}`}
                viewBox={`0 0 ${size.w} ${size.h}`}
                preserveAspectRatio="none"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
              >
                <defs>
                  <filter id="noiseDisp" x="-30%" y="-30%" width="160%" height="160%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency={cfg.noise.scale}
                      numOctaves={2}
                      seed={4}
                      result="n"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="n"
                      scale={cfg.noise.edge}
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                  <mask id="noiseMask">
                    <motion.rect
                      x={-cfg.noise.edge}
                      width={size.w + cfg.noise.edge * 2}
                      fill="#fff"
                      filter="url(#noiseDisp)"
                      initial={{ y: dir >= 0 ? size.h : -cfg.noise.edge, height: 0 }}
                      animate={{ y: -cfg.noise.edge, height: size.h + cfg.noise.edge * 2 }}
                      transition={trans}
                    />
                  </mask>
                </defs>
                <motion.image
                  href={SLIDES[active].image}
                  x="0"
                  y="0"
                  width={size.w}
                  height={size.h}
                  preserveAspectRatio="xMidYMid slice"
                  mask="url(#noiseMask)"
                  initial={{ scale: cfg.zoom }}
                  animate={{ scale: 1 }}
                  transition={trans}
                  onAnimationComplete={() => setSettled(active)}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              </svg>
            ) : (
              <motion.img
                key={`${cfg.style}-${active}`}
                src={SLIDES[active].image}
                alt=""
                initial={preset.initial}
                animate={preset.animate}
                transition={trans}
                onAnimationComplete={() => setSettled(active)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 1,
                  willChange: "transform, opacity, clip-path, filter",
                }}
              />
            )}

            {/* Vertical pager dots */}
            <div
              style={{
                position: "absolute",
                right: 24,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                zIndex: 2,
              }}
            >
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => goToStep(i)}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    background: i === active ? "#fff" : "transparent",
                    border: i === active ? "none" : "1.5px solid #fff",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
