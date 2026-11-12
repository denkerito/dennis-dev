import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build as plain static files in `out/` so any static host can serve the site.
  output: "export",
  // AGENTS.md is maintained by hand; stop `next dev` from appending its own block.
  agentRules: false,
};

export default nextConfig;
