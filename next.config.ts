import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import path from "path";

// Lockfiles in parent directories otherwise make Turbopack infer the wrong
// workspace root, so `@import "tailwindcss"` resolves outside the project.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/.well-known/agent-skills/cosmic-blueprint/SKILL.md",
      destination: "/.well-known/agent-skills/unified-reading/SKILL.md",
      permanent: true,
    }];
  },
  async headers() {
    return [{
      source: "/",
      headers: [{
        key: "Link",
        value: '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby"; type="text/plain", </index.md>; rel="alternate"; type="text/markdown"',
      }],
    }];
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
