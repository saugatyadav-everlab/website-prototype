import Link from "next/link";

const ROUTES = [
  { href: "/menu", title: "Menu" },
  { href: "/track", title: "Track your biomarkers" },
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
        gap: 16,
        padding: 32,
      }}
    >
      {ROUTES.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          style={{
            fontFamily: "'Saans', Inter, system-ui, sans-serif",
            fontSize: 24,
            fontWeight: 500,
            color: "#fff",
            textDecoration: "none",
          }}
        >
          {r.title}
        </Link>
      ))}
    </div>
  );
}
