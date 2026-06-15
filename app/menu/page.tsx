"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

const SAANS = "'Saans', Inter, system-ui, sans-serif";
const TOBIAS = "'Tobias', Georgia, serif";
const MONO = "'Saans Mono', ui-monospace, monospace";

const NAV_LINKS = ["How it Works", "For business", "Book a discovery call"];

// Shared nav content (always transparent — the floating wrapper owns the bg).
function NavBar() {
  return (
    <nav
      style={{
        width: "100%",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "8px 9px 8px 24px",
        boxSizing: "border-box",
        background: "transparent",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <img src="/menu/logo.svg" alt="everlab" style={{ height: 24, width: "auto" }} />
      </div>

      {/* Center links */}
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexShrink: 1, minWidth: 0 }}>
        {NAV_LINKS.map((l) => (
          <a
            key={l}
            href="#"
            style={{
              fontFamily: SAANS,
              fontSize: 14,
              lineHeight: "18px",
              color: "#fff",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </a>
        ))}
      </div>

      {/* Right buttons */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
        <button
          style={{
            height: 44,
            padding: "0 24px",
            borderRadius: 12,
            border: "1.5px solid rgba(255,255,255,0.16)",
            background: "transparent",
            color: "#fff",
            fontFamily: SAANS,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Log in
        </button>
        <button
          style={{
            height: 44,
            padding: "0 24px",
            borderRadius: 12,
            border: "none",
            background: "#fff",
            color: "#000",
            fontFamily: SAANS,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            backdropFilter: "blur(128px)",
          }}
        >
          Join today
        </button>
      </div>
    </nav>
  );
}

const VALUES = [
  { label: "1000+ DATA POINTS", icon: "dots" },
  { label: "LONGEVITY EXPERT-LED", icon: "check" },
  { label: "PERSONALISED CARE", icon: "star" },
];

function ValueIcon({ kind }: { kind: string }) {
  const common = { width: 20, height: 20, fill: "none", stroke: "#fff", strokeWidth: 1.5 } as const;
  if (kind === "check")
    return (
      <svg {...common} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
    );
  if (kind === "star")
    return (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2l2.6 6.5L21 9.2l-5 4.3L17.6 20 12 16.4 6.4 20 8 13.5l-5-4.3 6.4-.7z" />
      </svg>
    );
  // dots
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="#fff">
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="13.5" cy="6" r="2.4" opacity="0.6" />
      <circle cx="6" cy="13.5" r="2.4" opacity="0.6" />
      <circle cx="13.5" cy="13.5" r="2.4" />
    </svg>
  );
}

export default function MenuPage() {
  const [floating, setFloating] = useState(false);

  // Sentinel sits where the nav rests in the hero; when it scrolls out of view
  // the single fixed nav morphs into the floating pill.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setFloating(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Measure the nav's resting (full container) width so it can animate to 900
  const wrapRef = useRef<HTMLDivElement>(null);
  const [restW, setRestW] = useState(1032);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setRestW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const floatW = Math.min(900, restW);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: 12, boxSizing: "border-box" }}>
      {/* Single nav — sits in place over the hero (transparent, full width), then
          morphs into a floating pill with a dark bg once scrolled. */}
      <div
        ref={wrapRef}
        style={{
          position: "fixed",
          top: 36,
          left: 0,
          right: 0,
          zIndex: 50,
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.div
          initial={false}
          animate={{
            width: floating ? floatW : restW,
            backgroundColor: floating ? "rgba(0,0,0,0.64)" : "rgba(0,0,0,0)",
          }}
          transition={{ type: "spring", visualDuration: 0.45, bounce: 0.25 }}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            backdropFilter: floating ? "blur(64px)" : "none",
            WebkitBackdropFilter: floating ? "blur(64px)" : "none",
            pointerEvents: "auto",
          }}
        >
          <NavBar />
        </motion.div>
      </div>

      {/* Core hero card */}
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
        {/* Background image + dark overlay */}
        <img
          src="/menu/hero.png"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />

        {/* Container */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 1080,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 24px 0",
            boxSizing: "border-box",
          }}
        >
          {/* Nav slot — the real nav is the fixed element above; this reserves
              its space and acts as the scroll sentinel. */}
          <div ref={sentinelRef} style={{ width: "100%", height: 60, flexShrink: 0 }} />

          {/* ── Center hero content ────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div
              style={{
                maxWidth: 448,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 32,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <h1
                  style={{
                    fontFamily: TOBIAS,
                    fontSize: 56,
                    fontWeight: 400,
                    lineHeight: "48px",
                    letterSpacing: "-1px",
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
                    fontSize: 18,
                    fontWeight: 400,
                    lineHeight: "22px",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Personalised programs, longevity-trained doctors,
                  <br />
                  and year-round support, in one platform.
                </p>
              </div>

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
                  backdropFilter: "blur(128px)",
                }}
              >
                Learn more
              </button>
            </div>
          </div>

          {/* ── Values bar ─────────────────────────────────────────── */}
          <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {VALUES.map((v, i) => (
                <div key={v.label} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 8 }}>
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
                  {i < VALUES.length - 1 && (
                    <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.24)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder scroll space — replace with the scrolled menu content.
          Scrolling past the hero reveals the floating nav. */}
      <div style={{ height: "140vh" }} />
    </div>
  );
}
