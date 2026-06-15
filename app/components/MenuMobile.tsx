"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

const SAANS = "'Saans', Inter, system-ui, sans-serif";
const TOBIAS = "'Tobias', Georgia, serif";
const MONO = "'Saans Mono', ui-monospace, monospace";

const VALUES = [
  { label: "1000+ DATA POINTS", icon: "dots" },
  { label: "LONGEVITY EXPERT-LED", icon: "check" },
  { label: "PERSONALISED CARE", icon: "star" },
];

function ValueIcon({ kind }: { kind: string }) {
  const common = { width: 18, height: 18, fill: "none", stroke: "#fff", strokeWidth: 1.5 } as const;
  if (kind === "check")
    return (
      <svg {...common} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
    );
  if (kind === "star")
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2l2.6 6.5L21 9.2l-5 4.3L17.6 20 12 16.4 6.4 20 8 13.5l-5-4.3 6.4-.7z" />
      </svg>
    );
  return (
    <svg width={18} height={18} viewBox="0 0 20 20" fill="#fff">
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="13.5" cy="6" r="2.4" opacity="0.6" />
      <circle cx="6" cy="13.5" r="2.4" opacity="0.6" />
      <circle cx="13.5" cy="13.5" r="2.4" />
    </svg>
  );
}

export function MenuMobile() {
  const [scrolled, setScrolled] = useState(false);

  // Sentinel sits where the nav rests; when it scrolls out, the nav gains a bg.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Opens a bottom sheet (to be designed) — no-op stub for now.
  const onMenu = () => {};

  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: 12, boxSizing: "border-box" }}>
      {/* Fixed nav — full width, transparent over the hero, gains a dark bg on
          scroll (no width morph). Hamburger only; no links. */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          right: 20,
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <motion.div
          initial={false}
          animate={{ backgroundColor: scrolled ? "rgba(0,0,0,0.64)" : "rgba(0,0,0,0)" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            borderRadius: 16,
            overflow: "hidden",
            backdropFilter: scrolled ? "blur(64px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(64px)" : "none",
            pointerEvents: "auto",
          }}
        >
          <nav
            style={{
              width: "100%",
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 6px 6px 16px",
              boxSizing: "border-box",
            }}
          >
            <img src="/menu/logo.svg" alt="everlab" style={{ height: 22, width: "auto" }} />

            <button
              onClick={onMenu}
              aria-label="Open menu"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H21M3 17H14" stroke="#fff" strokeWidth="2" strokeLinecap="square" />
              </svg>
            </button>
          </nav>
        </motion.div>
      </div>

      {/* Hero card */}
      <div
        style={{
          position: "relative",
          minHeight: "calc(100vh - 24px)",
          borderRadius: 24,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src="/menu/hero.png"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 20px 0",
            boxSizing: "border-box",
          }}
        >
          {/* Nav slot / scroll sentinel */}
          <div ref={sentinelRef} style={{ width: "100%", height: 56, flexShrink: 0 }} />

          {/* Center hero content */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <h1
                  style={{
                    fontFamily: TOBIAS,
                    fontSize: 40,
                    fontWeight: 400,
                    lineHeight: "38px",
                    letterSpacing: "-0.5px",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  The new home
                  <br />
                  for your health.
                </h1>
                <p
                  style={{
                    fontFamily: SAANS,
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: "21px",
                    color: "#fff",
                    margin: 0,
                    maxWidth: 320,
                  }}
                >
                  Personalised programs, longevity-trained doctors, and year-round support, in one platform.
                </p>
              </div>

              <button
                style={{
                  height: 52,
                  padding: "0 28px",
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
                Learn more
              </button>
            </div>
          </div>

          {/* Values — stacked vertically on mobile */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "28px 0 32px" }}>
            {VALUES.map((v) => (
              <div key={v.label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <ValueIcon kind={v.icon} />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    lineHeight: "14px",
                    letterSpacing: 1,
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll space — scrolling past the hero reveals the nav bg. */}
      <div style={{ height: "140vh" }} />
    </div>
  );
}
