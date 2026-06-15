"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { CATEGORIES } from "../data/categories";
import { RollingNumber } from "./RollingNumber";

const SAANS = "'Saans', Inter, system-ui, sans-serif";
const N = CATEGORIES.length;
const AUTO_MS = 4500;          // auto-advance one category every X ms
const DEG = 4.2;               // arc degrees per biomarker tick
const VISIBLE_DEG = 82;        // how far around the top the ticks are drawn
const DIAL_EASE = { type: "spring" as const, stiffness: 90, damping: 18 };
const mod = (n: number) => ((n % N) + N) % N;
const count = (c: number) => CATEGORIES[c].biomarkers.length;

// ── Category carousel (circular) ───────────────────────────────────────────────
function CategoryCarousel({
  pos,
  goTo,
  draggingRef,
}: {
  pos: number;
  goTo: (p: number) => void;
  draggingRef: React.MutableRefObject<boolean>;
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
  const barW = Math.round(w * 0.64);
  const step = barW + GAP;
  const trackX = (p: number) => w / 2 - (p * step + barW / 2);
  const c = Math.round(pos);
  const win: number[] = [];
  for (let i = c - 4; i <= c + 4; i++) win.push(i);

  return (
    <div ref={ref} style={{ width: "100%", overflow: "hidden" }}>
      <motion.div
        style={{ position: "relative", height: 70 }}
        drag="x"
        dragMomentum={false}
        animate={{ x: trackX(pos) }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onDragStart={() => { draggingRef.current = true; }}
        onDragEnd={(_, info) => {
          draggingRef.current = false;
          const curX = trackX(pos) + info.offset.x;
          goTo(Math.round((w / 2 - barW / 2 - curX) / step));
        }}
      >
        {win.map((i) => {
          const cat = CATEGORIES[mod(i)];
          const isActive = i === c;
          return (
            <motion.div
              key={i}
              onClick={() => goTo(i)}
              animate={{ opacity: isActive ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                left: i * step,
                top: 0,
                width: barW,
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
              <span style={{ fontFamily: SAANS, fontSize: 20, fontWeight: 500, lineHeight: "22px", color: "#fff", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {cat.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Arc dial: continuous biomarker-tick strip, per-category scroll ─────────────
function ArcDial({
  pos,
  dir,
  goTo,
  draggingRef,
}: {
  pos: number;
  dir: number;
  goTo: (p: number) => void;
  draggingRef: React.MutableRefObject<boolean>;
}) {
  const active = mod(pos);
  const R = 300;
  const cx = 250;
  const cy = 320;

  const toXY = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + Math.sin(rad) * r, y: cy - Math.cos(rad) * r };
  };

  // Build a window of categories around the active one, laid out as a flat tick
  // sequence with the ACTIVE category's centre at angle 0 (under the marker).
  type Tick = { angle: number; major: boolean };
  const ticks: Tick[] = [];
  let prevDotAngle = 0;
  let nextDotAngle = 0;
  {
    // sequence index of the active category's centre
    const seq: { o: number; k: number; n: number }[] = [];
    for (let o = -10; o <= 10; o++) {
      const n = count(mod(active + o));
      for (let k = 0; k < n; k++) seq.push({ o, k, n });
    }
    const activeStart = seq.findIndex((s) => s.o === 0);
    const activeCentre = activeStart + (count(active) - 1) / 2;
    const angleAt = (idx: number) => (idx - activeCentre) * DEG;
    seq.forEach((s, idx) => {
      const angle = angleAt(idx);
      if (Math.abs(angle) <= VISIBLE_DEG) ticks.push({ angle, major: s.k % 5 === 0 });
    });
    const prevStart = seq.findIndex((s) => s.o === -1);
    const nextStart = seq.findIndex((s) => s.o === 1);
    prevDotAngle = angleAt(prevStart + (count(mod(active - 1)) - 1) / 2);
    nextDotAngle = angleAt(nextStart + (count(mod(active + 1)) - 1) / 2);
  }

  // Entry rotation so the new category scrolls in from the travel direction.
  const travel = ((count(active) + count(mod(pos - dir))) / 2) * DEG;

  const dot = (angle: number, r: number, fill: string, key: string) => {
    const p = toXY(angle, R + 14);
    return <circle key={key} cx={p.x} cy={p.y} r={r} fill={fill} />;
  };

  return (
    <motion.div
      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
      drag="x"
      dragMomentum={false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => { draggingRef.current = true; }}
      onDragEnd={(_, info) => {
        draggingRef.current = false;
        if (info.offset.x < -40) goTo(pos + 1);
        else if (info.offset.x > 40) goTo(pos - 1);
      }}
    >
      <div style={{ position: "relative", width: 500, height: 130, overflow: "hidden", touchAction: "pan-y" }}>
        <svg width={500} height={360} viewBox="0 0 500 360" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Strip scrolls in from the travel direction and settles centred */}
          <motion.g
            key={pos}
            initial={{ rotate: dir * travel }}
            animate={{ rotate: 0 }}
            transition={DIAL_EASE}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {ticks.map((tk, i) => {
              const a = toXY(tk.angle, R - (tk.major ? 16 : 10));
              const b = toXY(tk.angle, R);
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />;
            })}
            {/* prev / next category position dots (above the ticks) */}
            {dot(prevDotAngle, 3, "rgba(255,255,255,0.45)", "prev")}
            {dot(nextDotAngle, 3, "rgba(255,255,255,0.45)", "next")}
          </motion.g>

          {/* Orange marker pinned at top centre (line + dot) */}
          <line x1={cx} y1={cy - R - 4} x2={cx} y2={cy - R + 19} stroke="#ff6a1a" strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx} cy={cy - R - 12} r={4.5} fill="#ff6a1a" />
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0f0f0f, transparent 16%, transparent 84%, #0f0f0f)", pointerEvents: "none" }} />
      </div>

      <div style={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
        <RollingNumber value={count(active)} fontSize={73} fontWeight={500} />
      </div>
    </motion.div>
  );
}

// ── Biomarker pill marquee rows ────────────────────────────────────────────────
function PillRow({ items, dir }: { items: string[]; dir: 1 | -1 }) {
  const reps = Math.max(2, Math.ceil(14 / items.length));
  const set = Array.from({ length: reps }, () => items).flat();
  const content = [...set, ...set];
  const duration = set.length * 1.5;
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <motion.div
        style={{ display: "flex", gap: 8, width: "max-content" }}
        animate={{ x: dir < 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {content.map((b, i) => (
          <div key={i} style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10000, padding: "12px 20px", flexShrink: 0, fontFamily: SAANS, fontSize: 16, fontWeight: 400, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
            {b}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function PillMarquee({ active }: { active: number }) {
  const bio = CATEGORIES[active].biomarkers;
  const rotated = (by: number) => bio.map((_, i) => bio[(i + by) % bio.length]);
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <PillRow items={rotated(0)} dir={-1} />
        <PillRow items={rotated(Math.floor(bio.length / 3) || 1)} dir={1} />
        <PillRow items={rotated(Math.floor((bio.length * 2) / 3) || 2)} dir={-1} />
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 60, background: "linear-gradient(to right, #0f0f0f, transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 60, background: "linear-gradient(to left, #0f0f0f, transparent)", pointerEvents: "none" }} />
    </div>
  );
}

export function TrackMobile() {
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState(1);
  const posRef = useRef(0);
  const draggingRef = useRef(false);
  const active = mod(pos);

  const go = (np: number, d: number) => {
    posRef.current = np;
    setDir(d);
    setPos(np);
  };
  const goTo = (p: number) => go(p, Math.sign(p - posRef.current) || 1);

  // Auto-advance one category; the timer restarts whenever pos changes
  // (so a manual swipe/tap resets the countdown).
  useEffect(() => {
    if (draggingRef.current) return;
    const t = window.setTimeout(() => go(posRef.current + 1, 1), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [pos]);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 72, paddingBottom: 48, gap: 48 }}>
      <h2 style={{ fontFamily: SAANS, fontSize: 36, fontWeight: 500, lineHeight: "36px", letterSpacing: "-0.5px", color: "#fff", textAlign: "center", margin: 0, padding: "0 16px", maxWidth: 370 }}>
        Make sense of results{" "}
        <span style={{ color: "rgba(255,255,255,0.48)" }}>from 1000+ data points.</span>
      </h2>

      <CategoryCarousel pos={pos} goTo={goTo} draggingRef={draggingRef} />

      <ArcDial pos={pos} dir={dir} goTo={goTo} draggingRef={draggingRef} />

      <PillMarquee active={active} />

      <button style={{ height: 56, padding: "0 32px", borderRadius: 10000, border: "none", background: "#fff", color: "#000", fontFamily: SAANS, fontSize: 16, fontWeight: 500, cursor: "pointer" }}>
        Get started
      </button>
    </div>
  );
}
