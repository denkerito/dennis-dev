import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const pageExtensions = ["tsx", "ts", "jsx", "js"];

// Lab pages (see the `prototype-lab` spec) are named `page.lab.tsx`. `lab.tsx`
// is a page extension only for the development server, so a production build
// does not treat them as routes and nothing of a lab reaches `out/`.
//
// Checked against the documentation bundled with next 16.4.6
// (node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/pageExtensions.md):
// compound extensions are documented for the Pages Router (`page.tsx`) and for
// `proxy.page.ts`, but the App Router case is not spelled out. It was therefore
// verified by running both modes: `/lab/cat` renders under `next dev`, and
// `next build` lists no lab route and writes no `lab` entry to `out/`.
export default function nextConfig(phase: string): NextConfig {
  return {
    // Build as plain static files in `out/` so any static host can serve the site.
    output: "export",
    // AGENTS.md is maintained by hand; stop `next dev` from appending its own block.
    agentRules: false,
    pageExtensions:
      phase === PHASE_DEVELOPMENT_SERVER
        ? ["lab.tsx", ...pageExtensions]
        : pageExtensions,
  };
}
