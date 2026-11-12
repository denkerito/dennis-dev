import type { Metadata } from "next";

import { CatLab } from "./CatLab";

// Development only: `page.lab.tsx` is a route only under `next dev`
// (see next.config.ts), so this page is never part of the published site.
export const metadata: Metadata = {
  title: "Cat lab",
  description: "Development page for tuning the look of the cat.",
  robots: { index: false, follow: false },
};

export default function CatLabPage() {
  return <CatLab />;
}
