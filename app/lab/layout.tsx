import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./lab.css";

// Design proposals for CP1 (PLAN.md §8.1). Deployed so Noel can review them, never indexed.
export const metadata: Metadata = {
  title: "Design lab · Noel Echeverría",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
