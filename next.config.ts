import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow computer-use / tunneled browsers to talk to Turbopack HMR
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
