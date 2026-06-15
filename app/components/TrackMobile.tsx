"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { CATEGORIES } from "../data/categories";
import { RollingNumber } from "./RollingNumber";

const SAANS = "'Saans', Inter, system-ui, sans-serif";
const N = CATEGORIES.length;
const AUTO_MS = 3500;

// ── Category carousel ─────────────────────────────────────────────────────────
function CategoryCarousel({
  active,
  setActive,
}: {
  active: number;
  setActive: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(402);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const GAP = 8;
  const barW = Math.round(w * 0.64); // active bar width; neighbours peek
  const step = barW + GAP;
  const targetX = w / 2 - (active * step + barW / 2);

  return (
    <div ref={ref} style={{ width: "100%", overflow: "hidden" }}>
      <motion.div
        style={{ display: "flex", gap: GAP }}
        drag="x"
        dragConstraints={{ left: w / 2 - ((N - 1) * step + barW / 2), right: w / 2 - barW / 2 }}
        dragElastic={0.12}
        animate={{ x: targetX }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onDragEnd={(_, info) => {
          // snap to nearest bar based on where it landed
          const landedX = targetX + info.offset.x;
          const idx = Math.round((w / 2 - barW / 2 - landedX) / step);
          setActive(Math.max(0, Math.min(N - 1, idx)));
        }}
      >
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.id}
            onClick={() => setActive(i)}
            animate={{ opacity: i === active ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
            style={{
              width: barW,
              flexShrink: 0,
              height: 70,
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: SAANS,
                fontSize: 20,
                fontWeight: 500,
                lineHeight: "22px",
                color: "#fff",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Arc dial + count ──────────────────────────────────────────────────────────
function ArcDial({ active }: { active: number }) {
  const count = CATEGORIES[active].biomarkers.length;
  // Tick marks across a wide top arc
  const TICKS = 41;
  const SPREAD = 150; // degrees the ticks span
  const R = 300;
  const cx = 250;
  const cy = 320; // centre below the visible band → only the top arc shows
  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const t = i / (TICKS - 1); // 0..1
    const deg = -SPREAD / 2 + t * SPREAD;
    const rad = (deg * Math.PI) / 180;
    const outer = R;
    const inner = R - (i % 5 === 0 ? 16 : 10);
    return {
      x1: cx + Math.sin(rad) * inner,
      y1: cy - Math.cos(rad) * inner,
      x2: cx + Math.sin(rad) * outer,
      y2: cy - Math.cos(rad) * outer,
    };
  });

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 500, height: 120, overflow: "hidden" }}>
        <svg width={500} height={340} viewBox="0 0 500 340" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Tick dial — symmetric at rest; nudges + settles on category change */}
          <motion.g
            key={active}
            initial={{ rotate: 7 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 14 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {ticks.map((tk, i) => (
              <line
                key={i}
                x1={tk.x1}
                y1={tk.y1}
                x2={tk.x2}
                y2={tk.y2}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
              />
            ))}
          </motion.g>
          {/* Orange marker pinned at top centre */}
          <line x1={cx} y1={cy - R - 6} x2={cx} y2={cy - R + 17} stroke="#ff6a1a" strokeWidth={3} strokeLinecap="round" />
        </svg>
        {/* edge fades */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0f0f0f, transparent 18%, transparent 82%, #0f0f0f)", pointerEvents: "none" }} />
      </div>

      <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
        <RollingNumber value={count} fontSize={73} fontWeight={500} />
      </div>
    </div>
  );
}

// ── Biomarker pill marquee rows ────────────────────────────────────────────────
function PillRow({ items, dir, duration }: { items: string[]; dir: 1 | -1; duration: number }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <motion.div
        style={{ display: "flex", gap: 8, width: "max-content" }}
        animate={{ x: dir < 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((b, i) => (
          <div
            key={i}
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 10000,
              padding: "12px 20px",
              flexShrink: 0,
              fontFamily: SAANS,
              fontSize: 16,
              fontWeight: 400,
              lineHeight: "20px",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {b}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function PillMarquee({ active }: { active: number }) {
  const bio = CATEGORIES[active].biomarkers;
  // rotate the list differently per row so the rows look varied
  const rotated = (arr: string[], by: number) => arr.map((_, i) => arr[(i + by) % arr.length]);
  const dur = Math.max(12, bio.length * 2.4);
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <PillRow items={rotated(bio, 0)} dir={-1} duration={dur} />
        <PillRow items={rotated(bio, 2)} dir={1} duration={dur} />
        <PillRow items={rotated(bio, 4)} dir={-1} duration={dur} />
      </div>
      {/* edge fades */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 60, background: "linear-gradient(to right, #0f0f0f, transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 60, background: "linear-gradient(to left, #0f0f0f, transparent)", pointerEvents: "none" }} />
    </div>
  );
}

export function TrackMobile() {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  // Auto-advance categories
  useEffect(() => {
    const t = window.setInterval(() => {
      if (!pausedRef.current) setActive((a) => (a + 1) % N);
    }, AUTO_MS);
    return () => window.clearInterval(t);
  }, []);

  const choose = (i: number) => {
    pausedRef.current = true; // stop auto-advance after manual interaction
    setActive(((i % N) + N) % N);
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 72, paddingBottom: 48, gap: 48 }}>
      {/* Heading */}
      <h2
        style={{
          fontFamily: SAANS,
          fontSize: 36,
          fontWeight: 500,
          lineHeight: "36px",
          letterSpacing: "-0.5px",
          color: "#fff",
          textAlign: "center",
          margin: 0,
          padding: "0 16px",
          maxWidth: 370,
        }}
      >
        Make sense of results{" "}
        <span style={{ color: "rgba(255,255,255,0.48)" }}>from 1000+ data points.</span>
      </h2>

      {/* Category carousel */}
      <CategoryCarousel active={active} setActive={choose} />

      {/* Arc dial + count */}
      <ArcDial active={active} />

      {/* Biomarker pill marquee */}
      <PillMarquee active={active} />

      {/* CTA */}
      <button
        style={{
          height: 56,
          padding: "0 32px",
          borderRadius: 10000,
          border: "none",
          background: "#fff",
          color: "#000",
          fontFamily: SAANS,
          fontSize: 16,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Get started
      </button>
    </div>
  );
}
