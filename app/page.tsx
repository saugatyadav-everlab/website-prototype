import Link from "next/link";

const ROUTES = [
  {
    href: "/menu",
    title: "Menu",
    desc: "The new home for your health — hero.",
  },
  {
    href: "/track",
    title: "Track your biomarkers",
    desc: "Over 300 biomarkers on a living dial.",
  },
  {
    href: "/control",
    title: "Take control",
    desc: "Sticky-scroll accordion section.",
  },
];

export default function Landing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: 32,
      }}
    >
      <h1
        style={{
          fontFamily: "'Saans', Inter, system-ui, sans-serif",
          fontSize: 40,
          fontWeight: 500,
          color: "#fff",
          margin: 0,
          textAlign: "center",
        }}
      >
        Choose a section
      </h1>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {ROUTES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: 320,
              padding: 32,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              textDecoration: "none",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            <span
              style={{
                fontFamily: "'Saans', Inter, system-ui, sans-serif",
                fontSize: 24,
                fontWeight: 570,
                color: "#fff",
              }}
            >
              {r.title}
            </span>
            <span
              style={{
                fontFamily: "'Saans', Inter, system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 400,
                color: "rgba(255,255,255,0.56)",
              }}
            >
              {r.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
