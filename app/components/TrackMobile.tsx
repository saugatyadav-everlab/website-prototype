"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { CATEGORIES } from "../data/categories";
import { RollingNumber } from "./RollingNumber";

const SAANS = "'Saans', Inter, system-ui, sans-serif";
const N = CATEGORIES.length;

// ── Flat biomarker stream across all categories ────────────────────────────────
const FLAT_CAT: number[] = [];   // category index for each biomarker
const CAT_FIRST: number[] = [];  // first flat index of each category
const IS_START: boolean[] = [];  // true at the first biomarker of a category
CATEGORIES.forEach((c, ci) => {
  CAT_FIRST[ci] = FLAT_CAT.length;
  c.biomarkers.forEach((_, k) => {
    IS_START[FLAT_CAT.length] = k === 0;
    FLAT_CAT.push(ci);
  });
});
const TOTAL = FLAT_CAT.length;

const mod = (n: number) => ((n % N) + N) % N;
const modT = (n: number) => ((n % TOTAL) + TOTAL) % TOTAL;
const catOf = (tick: number) => FLAT_CAT[modT(tick)];
const count = (c: number) => CATEGORIES[c].biomarkers.length;

const TICK_MS = 1000;     // one biomarker per second — like a second hand
const DEG = 4;            // arc degrees between biomarker ticks
// A fast settle each second → a discrete "tick", not a continuous glide.
const TICK_SNAP = { type: "spring" as const, stiffness: 700, damping: 38 };
const JUMP = { type: "spring" as const, stiffness: 120, damping: 22 };

// ── Category carousel (circular) ───────────────────────────────────────────────
function CategoryCarousel({
  pos,
  onPick,
  draggingRef,
}: {
  pos: number;
  onPick: (monotonicIndex: number) => void;
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
          onPick(Math.round((w / 2 - barW / 2 - curX) / step));
        }}
      >
        {win.map((i) => {
          const cat = CATEGORIES[mod(i)];
          const isActive = i === c;
          return (
            <motion.div
              key={i}
              onClick={() => onPick(i)}
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

// ── Arc dial: continuous biomarker strip sweeping one tick per second ──────────
function ArcDial({
  tick,
  trans,
  onSwipe,
  draggingRef,
  activeCount,
}: {
  tick: number;
  trans: typeof TICK_SNAP | typeof JUMP;
  onSwipe: (dir: 1 | -1) => void;
  draggingRef: React.MutableRefObject<boolean>;
  activeCount: number;
}) {
  const R = 300;
  const cx = 250;
  const cy = 320;
  const TICK_LEN = 13;     // every tick the same length
  const WIN = 26;          // biomarkers rendered either side of the marker

  const toXY = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + Math.sin(a) * r, y: cy - Math.cos(a) * r };
  };

  // Ticks live at ABSOLUTE angles (index * DEG); the group rotates by -tick*DEG so
  // biomarker[tick] sits under the marker. Rotating a continuous group (no remount)
  // keeps every tick radial → a smooth, true-to-arc sweep.
  const t = Math.round(tick);
  const lines = [];
  const dots = [];
  for (let i = t - WIN; i <= t + WIN; i++) {
    const aDeg = i * DEG;
    const p1 = toXY(aDeg, R);
    const p2 = toXY(aDeg, R - TICK_LEN);
    lines.push(
      <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.32)" strokeWidth={1.6} strokeLinecap="round" />,
    );
    if (IS_START[modT(i)]) {
      const d = toXY(aDeg, R + 13);
      dots.push(<circle key={`d${i}`} cx={d.x} cy={d.y} r={3} fill="rgba(255,255,255,0.5)" />);
    }
  }

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
        if (info.offset.x < -40) onSwipe(1);
        else if (info.offset.x > 40) onSwipe(-1);
      }}
    >
      <div style={{ position: "relative", width: 500, height: 130, overflow: "hidden", touchAction: "pan-y" }}>
        <svg width={500} height={360} viewBox="0 0 500 360" style={{ position: "absolute", top: 0, left: 0 }}>
          <motion.g
            animate={{ rotate: -tick * DEG }}
            transition={trans}
            style={{ transformBox: "view-box", originX: `${cx}px`, originY: `${cy}px` }}
          >
            {lines}
            {dots}
          </motion.g>

          {/* Orange marker pinned at top centre (line + dot) */}
          <line x1={cx} y1={cy - R - 4} x2={cx} y2={cy - R + 19} stroke="#ff6a1a" strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx} cy={cy - R - 12} r={4.5} fill="#ff6a1a" />
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0f0f0f, transparent 18%, transparent 82%, #0f0f0f)", pointerEvents: "none" }} />
      </div>

      <div style={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
        <RollingNumber value={activeCount} fontSize={73} fontWeight={500} />
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
  const [tick, setTick] = useState(0);
  const [catPos, setCatPos] = useState(0); // monotonic, for the carousel
  const [trans, setTrans] = useState<typeof TICK_SNAP | typeof JUMP>(TICK_SNAP);
  const tickRef = useRef(0);
  const activeRef = useRef(0);
  const catPosRef = useRef(0);
  const draggingRef = useRef(false);

  const active = catOf(tick);

  const moveCatPos = (next: number) => { catPosRef.current = next; setCatPos(next); };

  // Continuous sweep: advance one biomarker every second. The timer restarts on
  // every tick change, so a manual jump cleanly resumes ticking afterwards.
  useEffect(() => {
    if (draggingRef.current) return;
    const id = window.setTimeout(() => {
      const nt = tickRef.current + 1;
      const na = catOf(nt);
      if (na !== activeRef.current) {      // crossed into the next category
        activeRef.current = na;
        moveCatPos(catPosRef.current + 1);
      }
      tickRef.current = nt;
      setTrans(TICK_SNAP);
      setTick(nt);
    }, TICK_MS);
    return () => window.clearTimeout(id);
  }, [tick]);

  // Jump the sweep to the start of a category (carousel tap/swipe, arc swipe).
  // `p` is a monotonic category position so the carousel glides the chosen way.
  const selectCategory = (p: number) => {
    const ci = mod(p);
    const targetBio = CAT_FIRST[ci];
    const mb = modT(tickRef.current);
    let d = modT(targetBio - mb);
    if (d > TOTAL / 2) d -= TOTAL;
    const targetTick = tickRef.current + d;
    activeRef.current = ci;
    tickRef.current = targetTick;
    moveCatPos(p);
    setTrans(JUMP);
    setTick(targetTick);
  };

  const onSwipe = (dir: 1 | -1) => selectCategory(catPosRef.current + dir);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 72, paddingBottom: 48, gap: 48 }}>
      <h2 style={{ fontFamily: SAANS, fontSize: 36, fontWeight: 500, lineHeight: "36px", letterSpacing: "-0.5px", color: "#fff", textAlign: "center", margin: 0, padding: "0 16px", maxWidth: 370 }}>
        Make sense of results{" "}
        <span style={{ color: "rgba(255,255,255,0.48)" }}>from 1000+ data points.</span>
      </h2>

      <CategoryCarousel pos={catPos} onPick={selectCategory} draggingRef={draggingRef} />

      <ArcDial tick={tick} trans={trans} onSwipe={onSwipe} draggingRef={draggingRef} activeCount={count(active)} />

      <PillMarquee active={active} />

      <button style={{ height: 56, padding: "0 32px", borderRadius: 10000, border: "none", background: "#fff", color: "#000", fontFamily: SAANS, fontSize: 16, fontWeight: 500, cursor: "pointer" }}>
        Get started
      </button>
    </div>
  );
}
