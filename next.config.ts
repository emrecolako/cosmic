import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import path from "path";
import { ALL_ENTRIES, reversePairRedirects } from "./lib/library/registry";

// Lockfiles in parent directories otherwise make Turbopack infer the wrong
// workspace root, so `@import "tailwindcss"` resolves outside the project.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Markdown twins are routed by pattern, not one rewrite per page: with well over
// a thousand library pages, per-page rules would pass Vercel's 2,048-route cap.
// The first path segments are listed so public files like /index.md are untouched.
const sections = [...new Set(ALL_ENTRIES.map((entry) => entry.path.split("/")[1]))].join("|");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/.well-known/agent-skills/cosmic-blueprint/SKILL.md",
        destination: "/.well-known/agent-skills/unified-reading/SKILL.md",
        permanent: true,
      },
      // Pair pages have one canonical order; the reversed URL is a 301.
      ...reversePairRedirects().map((redirect) => ({ ...redirect, statusCode: 301 as const })),
    ];
  },
  async rewrites() {
    return {
      // Before the filesystem, or /life-path/[slug] would claim "1-vs-9.md".
      beforeFiles: [
        // sitemap.ts uses generateSitemaps (/sitemap/{id}.xml), which leaves /sitemap.xml to the index.
        { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
        { source: `/:section(${sections}).md`, destination: "/library-md/:section" },
        { source: `/:section(${sections})/:slug.md`, destination: "/library-md/:section/:slug" },
        { source: `/:section(${sections})/:group/:slug.md`, destination: "/library-md/:section/:group/:slug" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [{
          key: "Link",
          value: '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby"; type="text/plain", </index.md>; rel="alternate"; type="text/markdown"',
        }],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/*": ["./content/library/**/*.json", "./public/fonts/romana-regular.otf"],
    "/compare/og/*": ["./public/fonts/*", "./public/artwork/*.png"],
  },
  experimental: {
    // Two root layouts ((app) and (library)) leave no shared not-found page.
    globalNotFound: true,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
