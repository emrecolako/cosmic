import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import path from "path";

// Lockfiles in parent directories otherwise make Turbopack infer the wrong
// workspace root, so `@import "tailwindcss"` resolves outside the project.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
