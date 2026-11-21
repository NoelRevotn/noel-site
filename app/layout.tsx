import type { ReactNode } from "react";

// The real <html> lives in app/[locale]/layout.tsx so `lang` can follow the locale.
// The root redirect page (app/page.tsx) renders its own minimal document.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
