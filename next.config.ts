import type { NextConfig } from "next";

/** GitHub Pages project site: https://granonim.github.io/<repo>/ */
const pagesBase = (process.env.GITHUB_PAGES_BASE || "").replace(/\/$/, "");
const isGitHubPages = process.env.GITHUB_PAGES === "true" && pagesBase.length > 0;

const nextConfig: NextConfig = {
  // Static export only for GitHub Pages builds (like timefilter-mini files)
  ...(isGitHubPages
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
        basePath: pagesBase,
        assetPrefix: pagesBase,
      }
    : {}),
  // Allow computer-use / tunneled browsers to talk to Turbopack HMR
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
