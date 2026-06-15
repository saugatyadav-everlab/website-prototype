import type { Metadata } from "next";
import "./globals.css";
import "./dialkit.css";

export const metadata: Metadata = {
  title: "Biomarkers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
