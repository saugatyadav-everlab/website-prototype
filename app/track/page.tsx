"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useDialKit } from "dialkit";
import dynamic from "next/dynamic";
import { CATEGORIES } from "../data/categories";

const BiomarkersArc = dynamic(
  () => import("../components/BiomarkersArc").then((m) => m.BiomarkersArc),
  { ssr: false },
);

const TrackMobile = dynamic(
  () => import("../components/TrackMobile").then((m) => m.TrackMobile),
  { ssr: false },
);

const MOBILE_BP = 768;

const ITEM_HEIGHT = 63; // measured: 63px per row (font 20, py 20+20, border 1)
const N           = CATEGORIES.length;

// Flatten every biomarker across all categories into one continuous stream.
const FLAT_WORDS: string[] = [];
const FLAT_CATEGORY_INDEX: number[] = []; // category index for each word
const CATEGORY_FIRST_WORD: number[] = []; // first flat index of each category
CATEGORIES.forEach((cat, ci) => {
  CATEGORY_FIRST_WORD[ci] = FLAT_WORDS.length;
  cat.biomarkers.forEach((b) => {
    FLAT_WORDS.push(b);
    FLAT_CATEGORY_INDEX.push(ci);
  });
});

// Responsive wrapper: mobile component below the breakpoint, desktop above.
export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (isMobile === null) return null; // avoid SSR/first-paint mismatch
  return isMobile ? <TrackMobile /> : <TrackDesktop />;
}

function TrackDesktop() {
  const [activeIndex, setActiveIndex] = useState(0);

  // DialKit — category-list change animation (with easing visualiser/editor)
  const listCfg = useDialKit("Category List", {
    transition: {
      type: "easing" as const,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
    shiftDistance: [40, 0, 120, 2], // how far the active label slides right
    visibleCount: [10, 3, 16, 1],   // how many categories are visible at once
  });
  const LIST_EASE = listCfg.transition;
  const DOT_SHIFT = listCfg.shiftDistance;
  const VISIBLE = Math.round(listCfg.visibleCount);
  const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE;

  // Seek token — bumping this tells the arc to step to seek.index (in seek.dir)
  const [seek, setSeek] = useState<{ index: number; token: number; dir: number }>({ index: 0, token: 0, dir: 1 });
  const seekTokenRef = useRef(0);

  // trackPos is a monotonic row position; the list track translates to
  // -trackPos*ITEM_HEIGHT and moves by the SHORTEST signed delta toward the new
  // category, so auto-advance and wrap both glide forward by one row.
  const [trackPos, setTrackPos] = useState(0);
  useEffect(() => {
    setTrackPos((prev) => {
      const cur = ((prev % N) + N) % N;
      let d = (((activeIndex - cur) % N) + N) % N;
      if (d > N / 2) d -= N;
      return prev + d;
    });
  }, [activeIndex]);

  // Auto-driven: arc tells us which flat word is in the pill → derive category
  const handlePillIndex = (flatIndex: number) => {
    setActiveIndex(FLAT_CATEGORY_INDEX[flatIndex] ?? 0);
  };

  // Manual: step the arc to a category's first biomarker. `explicitDir` comes
  // from the nav buttons; otherwise we use the shortest signed direction.
  const goToCategory = (ci: number, explicitDir?: 1 | -1) => {
    const wrapped = ((ci % N) + N) % N;
    let dir = explicitDir;
    if (dir === undefined) {
      let d = (((wrapped - activeIndex) % N) + N) % N;
      if (d > N / 2) d -= N;
      dir = d >= 0 ? 1 : -1;
    }
    setActiveIndex(wrapped);
    seekTokenRef.current += 1;
    setSeek({ index: CATEGORY_FIRST_WORD[wrapped], token: seekTokenRef.current, dir });
  };

  const navigate = (dir: 1 | -1) => goToCategory(activeIndex + dir, dir);

  // Windowed rows around trackPos (a couple above for exit anim, the rest below)
  const trackInt = Math.round(trackPos);
  const rows: number[] = [];
  for (let i = trackInt - 2; i <= trackInt + VISIBLE + 1; i++) rows.push(i);

  return (
    <div className="w-full bg-[#0f0f0f] py-[160px]" style={{ overflowX: "hidden" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          gap: 39,
        }}
      >
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div style={{ width: 540, minWidth: 0, flexShrink: 0, display: "flex", flexDirection: "column", gap: 54 }}>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Saans', Inter, system-ui, sans-serif",
              fontSize: 48,
              fontWeight: 500,
              lineHeight: "56px",
              color: "#fff",
              margin: 0,
            }}
          >
            Track your health with{" "}
            <br />
            <span style={{ color: "rgba(255,255,255,0.48)" }}>over 300 biomarkers.</span>
          </h2>

          {/* Category list — fixed dot at top, list track glides under it with
              easing; the active label slides right to sit beside the dot. */}
          <div style={{ position: "relative" }}>
            {/* Viewport — clip-path clips the bottom/sides cleanly (no peeking
                rows) but extends above the top so exiting rows can fly away. */}
            <div style={{ position: "relative", height: LIST_HEIGHT, overflow: "visible", clipPath: "inset(-90px 0px 0px 0px)" }}>
              {/* Animated track — windowed rows, each absolutely positioned */}
              <motion.div
                animate={{ y: -trackPos * ITEM_HEIGHT }}
                transition={LIST_EASE}
                style={{ position: "absolute", top: 0, left: 0, right: 0 }}
              >
                {rows.map((i) => {
                  const real = ((i % N) + N) % N;
                  const cat = CATEGORIES[real];
                  const offset = i - trackInt; // 0 = active (top), <0 above, >=VISIBLE below
                  const isActive = offset === 0;
                  // Off-window rows fade + blur out (fly away at top, fly in at
                  // the bottom); visible rows are crisp.
                  const offWindow = offset < 0 || offset >= VISIBLE;
                  const opacity = offWindow ? 0 : 1;
                  const blur = offWindow ? 12 : 0;
                  return (
                    <motion.div
                      key={i}
                      onClick={() => goToCategory(real)}
                      initial={false}
                      animate={{ opacity, filter: `blur(${blur}px)` }}
                      transition={LIST_EASE}
                      style={{
                        position: "absolute",
                        top: i * ITEM_HEIGHT,
                        left: 0,
                        right: 0,
                        height: ITEM_HEIGHT,
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        pointerEvents: opacity === 0 ? "none" : "auto",
                      }}
                    >
                      <motion.span
                        initial={false}
                        animate={{ x: isActive ? DOT_SHIFT : 0 }}
                        transition={LIST_EASE}
                        style={{
                          fontFamily: "var(--font-family-secondary, 'Saans', Inter, system-ui, sans-serif)",
                          fontSize: 18,
                          fontWeight: 570,
                          lineHeight: "22px",
                          letterSpacing: 0,
                          color: "#fff",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cat.label}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Fixed separators — static grid lines the text slides through */}
              {Array.from({ length: VISIBLE }).map((_, k) => (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    top: (k + 1) * ITEM_HEIGHT - 1,
                    left: 0,
                    right: 0,
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              ))}

              {/* Fixed orange dot — constant, pinned at the top row */}
              <div style={{
                position: "absolute",
                top: ITEM_HEIGHT / 2 - 10,
                left: 0,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#FF6B35",
                pointerEvents: "none",
                zIndex: 3,
              }} />

            </div>

            {/* Up / Down nav buttons — absolute, 40px to the left of the list, vertically centred */}
            <div style={{
              position: "absolute",
              right: "calc(100% + 40px)",
              top: 0,
              height: LIST_HEIGHT,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              justifyContent: "center",
            }}>
              {[
                { dir: -1, path: "M18 13L12 7L6 13" },
                { dir:  1, path: "M6 11L12 17L18 11" },
              ].map(({ dir, path }) => (
                <button
                  key={dir}
                  onClick={() => navigate(dir as 1 | -1)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: "none",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(128px)",
                    WebkitBackdropFilter: "blur(128px)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, minHeight: 1008, position: "relative", overflow: "visible" }}>
          <BiomarkersArc
            words={FLAT_WORDS}
            seekIndex={seek.index}
            seekToken={seek.token}
            seekDir={seek.dir}
            onPillIndexChange={handlePillIndex}
          />
        </div>
      </div>
    </div>
  );
}
