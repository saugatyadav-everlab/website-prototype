"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useDialKit, DialRoot } from "dialkit";
import { RollingNumber } from "./RollingNumber";

interface Props {
  words: string[];                          // full flat list of all biomarkers
  seekIndex?: number;                       // flat index to jump the pill to
  seekToken?: number;                       // bump to trigger a seek
  onPillIndexChange?: (flatIndex: number) => void; // current pill flat index
}

export function BiomarkersArc({ words, seekIndex = 0, seekToken = 0, onPillIndexChange }: Props) {
  // ── DialKit controls ──────────────────────────────────────────────────────
  const p = useDialKit("Biomarker Arc", {
    arc: {
      radius:  [300, 100, 600, 10],
      centerX: [40,  -200, 400, 10],
      centerY: [550, 100, 900, 10],
      gap:     [8,   4,   40,  1],
      slots:   [20,  6,   28,  2],
    },
    text: {
      fontSize:   [20, 10, 80, 1],
      minScale:   [0.5, 0.2, 1, 0.05],
      maxBlur:    [11,  0,  20, 0.5],
      baseOpacity:[1,   0.2, 1, 0.05],
      minOpacity: [0,   0,  0.8, 0.05],
    },
    timing: {
      intervalMs:      [1100, 200, 5000, 50],
      firstTickDelay:  [400,  0,   3000, 50],
      fillStaggerMs:   [35,   5,   300,  5],
      tickStartMs:     [300,  0,   2000, 50],
      curveDuration:   [0.3,  0.05, 1.5, 0.05],
    },
    pill: {
      paddingX:    [16, 4,  60, 2],
      paddingY:    [8,  2,  40, 2],
      borderWidth: [0.5, 0, 4,  0.5],
      blurAmount:  [45, 0,  120, 5],
    },
    counter: {
      distanceFromArc: [64, 0, 400, 4],
      fontSize:        [102, 40, 200, 2],
    },
  });

  const slotCount = Math.max(4, Math.round(p.arc.slots / 2) * 2);
  const pillSlot  = Math.floor((slotCount - 1) / 2);
  const maxReveal = Math.max(pillSlot, slotCount - 1 - pillSlot);

  const safeWords = words.length > 0 ? words : ["—"];
  const len = safeWords.length;
  const wrap = (n: number) => ((n % len) + len) % len;

  const baseTick   = Math.max(0, slotCount - 2);
  const basePillId = baseTick - pillSlot;

  // ── Animation state ───────────────────────────────────────────────────────
  const [revealRadius,    setRevealRadius]    = useState(0);
  const [rotationStarted, setRotationStarted] = useState(false);
  const [tickStarted,     setTickStarted]     = useState(false);
  const [rotationTick,    setRotationTick]    = useState(0);
  const [pillDisplayName, setPillDisplayName] = useState(safeWords[wrap(seekIndex)] ?? "");
  const [seqKey,          setSeqKey]          = useState(0);
  const [indexOffset,     setIndexOffset]     = useState(seekIndex - basePillId);

  const pillWordIdxRef = useRef(basePillId);

  // Seek — re-map the content offset so the pill lands directly on seekIndex.
  // No fill reset → wheel keeps spinning, no redraw. Counter jumps straight to
  // the target biomarker's number (can go up or down).
  const firstSeek = useRef(true);
  useEffect(() => {
    if (firstSeek.current) { firstSeek.current = false; return; }
    setIndexOffset(seekIndex - pillWordIdxRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekToken]);

  // Tick-start gate
  useEffect(() => {
    const t = window.setTimeout(() => setTickStarted(true), p.timing.tickStartMs);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqKey, p.timing.tickStartMs]);

  // Fill phase
  useEffect(() => {
    if (!tickStarted || rotationStarted) return;
    if (revealRadius >= maxReveal) { setRotationStarted(true); return; }
    const t = window.setTimeout(() => setRevealRadius((r) => r + 1), p.timing.fillStaggerMs);
    return () => window.clearTimeout(t);
  }, [tickStarted, revealRadius, maxReveal, rotationStarted, p.timing.fillStaggerMs]);

  // Rotation phase — runs forever, conveyor never stops
  useEffect(() => {
    if (!rotationStarted) return;
    let interval = 0;
    const first = window.setTimeout(() => {
      setRotationTick((n) => n + 1);
      interval = window.setInterval(
        () => setRotationTick((n) => n + 1),
        p.timing.intervalMs,
      ) as unknown as number;
    }, p.timing.firstTickDelay);
    return () => { window.clearTimeout(first); if (interval) window.clearInterval(interval); };
  }, [rotationStarted, p.timing.intervalMs, p.timing.firstTickDelay]);

  const tick = baseTick + rotationTick;

  const wordAt = (logicalIdx: number) => safeWords[wrap(logicalIdx + indexOffset)];

  // Pill label with slight resize delay
  const pillWordIdx  = Math.max(0, tick - pillSlot);
  pillWordIdxRef.current = pillWordIdx;
  const pillFlatIdx  = wrap(pillWordIdx + indexOffset);
  const pillName     = safeWords[pillFlatIdx];
  useEffect(() => {
    const delay = p.timing.curveDuration * 1000 * 0.05;
    const t = setTimeout(() => setPillDisplayName(pillName), Math.max(0, delay));
    return () => clearTimeout(t);
  }, [pillName, p.timing.curveDuration]);

  // Tell the parent which flat biomarker is in the pill → drives active category
  useEffect(() => {
    if (rotationStarted) onPillIndexChange?.(pillFlatIdx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillFlatIdx, rotationStarted]);

  // ── Slot geometry ─────────────────────────────────────────────────────────
  const CURVE = {
    type: "easing" as const,
    duration: p.timing.curveDuration,
    ease: [0.45, -0.1, 0.5, 1] as [number, number, number, number],
  };

  const slotAt = (slotIdx: number) => {
    const offset   = slotIdx - pillSlot;
    const angleDeg = offset * p.arc.gap;
    const a        = (angleDeg * Math.PI) / 180;
    const x        = p.arc.centerX + p.arc.radius * Math.cos(a);
    const y        = p.arc.centerY - p.arc.radius * Math.sin(a);
    const dist     = Math.abs(offset);
    const edgeSpan = Math.max(1, maxReveal);
    const tVal     = Math.min(1, dist / edgeSpan);
    const fontSize = p.text.fontSize * (p.text.minScale + (1 - p.text.minScale) * (1 - tVal));
    const opacity  = p.text.minOpacity + (p.text.baseOpacity - p.text.minOpacity) * (1 - tVal);
    const blur     = p.text.maxBlur * tVal;
    const isEdge   = slotIdx <= 0 || slotIdx >= slotCount - 1;
    const revealed = rotationStarted || (tickStarted && dist <= revealRadius);
    return {
      x, y,
      rotate: -angleDeg,
      fontSize,
      opacity: (isEdge || !revealed) ? 0 : opacity,
      blur,
      letterSpacing: -fontSize * 0.02,
      lineHeight:    fontSize * 1.33,
    };
  };

  const visibleWords: { wordIdx: number; slotIdx: number }[] = [];
  for (let i = Math.max(0, tick - (slotCount - 1)); i <= tick; i++) {
    visibleWords.push({ wordIdx: i, slotIdx: tick - i });
  }

  const pillPos = slotAt(pillSlot);
  // Counter sits on the pill's horizontal line; right edge `distanceFromArc`
  // inward from the arc edge; right-aligned so it grows left.
  const counterRightX = p.arc.centerX + p.arc.radius - p.counter.distanceFromArc;
  const counterY      = p.arc.centerY;

  const pillSpring = { type: "spring" as const, bounce: 0.3, duration: 0.65 };
  const pillEntry  = { type: "spring" as const, bounce: 0.18, duration: 0.5, delay: 0.5 };

  return (
    <>
    <DialRoot />
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 1008,
        overflow: "visible", // let long pill labels extend right without clipping
        isolation: "isolate",
      }}
    >
      {/* Pill shell */}
      <div
        style={{
          position: "absolute",
          left: pillPos.x - p.pill.paddingX,
          top:  pillPos.y,
          transform: "translate(0, -50%)",
          pointerEvents: "none",
        }}
      >
        <motion.div
          key={seqKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={pillEntry}
        >
          <motion.div
            layout
            transition={pillSpring}
            style={{
              padding: `${p.pill.paddingY}px ${p.pill.paddingX}px`,
              borderRadius: 800,
              border: `${p.pill.borderWidth}px solid #ffffff`,
              background: "transparent",
              backdropFilter: `blur(${p.pill.blurAmount}px)`,
              WebkitBackdropFilter: `blur(${p.pill.blurAmount}px)`,
              willChange: "backdrop-filter",
              transform: "translateZ(0)",
            }}
          >
            <span
              style={{
                fontFamily: "'Saans', Inter, system-ui, sans-serif",
                fontSize: p.text.fontSize,
                fontWeight: 400,
                lineHeight: `${p.text.fontSize * 1.33}px`,
                letterSpacing: `${-p.text.fontSize * 0.02}px`,
                whiteSpace: "nowrap",
                visibility: "hidden",
                display: "inline-block",
              }}
            >
              {pillDisplayName}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Arc words */}
      {visibleWords.map(({ wordIdx, slotIdx }) => {
        const slot = slotAt(slotIdx);
        const name = wordAt(wordIdx);
        return (
          <motion.div
            key={`${seqKey}-${wordIdx}`}
            initial={false}
            animate={{
              x: slot.x,
              y: slot.y,
              rotate: slot.rotate,
              opacity: slot.opacity,
              fontSize: slot.fontSize,
              lineHeight: slot.lineHeight,
              letterSpacing: slot.letterSpacing,
              filter: `blur(${slot.blur}px)`,
            }}
            transition={CURVE}
            transformTemplate={(t) => {
              const x = (t.x as string | undefined) ?? "0px";
              const y = (t.y as string | undefined) ?? "0px";
              const r = (t.rotate as string | undefined) ?? "0deg";
              return `translate(${x}, ${y}) translate(0, -50%) rotate(${r})`;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transformOrigin: "0% 50%",
              pointerEvents: "none",
              fontFamily: "'Saans', Inter, system-ui, sans-serif",
              fontWeight: 400,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </motion.div>
        );
      })}

      {/* Counter — rolling digits, right-aligned (right edge anchored, grows left) */}
      <div
        style={{
          position: "absolute",
          left: counterRightX,
          top: counterY,
          transform: "translate(-100%, -50%)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <RollingNumber value={pillFlatIdx + 1} fontSize={p.counter.fontSize} fontWeight={700} />
      </div>
    </div>
    </>
  );
}
