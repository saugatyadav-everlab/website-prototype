"use client";

import { DialRoot } from "dialkit";

// Mounts the DialKit panel overlay. Import this with `dynamic(..., { ssr: false })`
// so it never renders on the server (DialRoot is not SSR-safe).
export default function DialOverlay() {
  return <DialRoot />;
}
