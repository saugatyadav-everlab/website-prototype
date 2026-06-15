"use client";

// Continuous rolling counter (NumberFlow-style) with no extra deps.
// Each digit slot swaps with an always-upward motion: the old digit exits
// upward (blur + fade out) while the new one enters from below (blur + fade in).
// Because every change animates in the same direction, wrapping (e.g. 280 → 1)
// reads as continuous instead of scrolling backward.

import { AnimatePresence, motion } from "motion/react";

interface Props {
  value: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
}

const SWAP = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

export function RollingNumber({
  value,
  fontSize = 102,
  fontWeight = 700,
  color = "#fff",
}: Props) {
  const str = Math.max(0, Math.round(value)).toString();
  const chars = str.split("");
  const height = fontSize;       // lineHeight 1 → cell height = font size
  const slotW = fontSize * 0.62; // tabular digit advance (approx)
  const blur = Math.max(4, fontSize * 0.08);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end", // right-aligned: grows leftward
        fontFamily: "'Saans', Inter, system-ui, sans-serif",
        fontSize,
        fontWeight,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {chars.map((c, i) => {
        // Key each slot by its position from the RIGHT so the units digit keeps
        // its identity as the number grows/shrinks (digit count change).
        const slotKey = chars.length - i;
        return (
          <span
            key={slotKey}
            style={{
              position: "relative",
              display: "inline-block",
              width: slotW,
              height,
              overflow: "hidden",
            }}
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={c} // changing digit → swap animation
                initial={{ y: height, opacity: 0, filter: `blur(${blur}px)` }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -height, opacity: 0, filter: `blur(${blur}px)` }}
                transition={SWAP}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {c}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </div>
  );
}
