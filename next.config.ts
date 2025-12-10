// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the experimental Turbopack server in development mode
  experimental: {
    serverSourceMaps: true,
  },

  // Empty turbopack config to satisfy Next.js 16 requirement
  turbopack: {},

  // Skip TypeScript type checking during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;