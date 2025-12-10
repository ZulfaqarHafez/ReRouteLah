// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the experimental Turbopack server in development mode
  experimental: {
    serverSourceMaps: true,
    turbopack: {
      resolveAlias: {
        // Ensure this alias matches the one in your tsconfig.json
        '@/': './src/', 
      },
    },
  },
  
  // This is the CRITICAL block to force Tailwind to read the config file.
  webpack: (config, { isServer, dev }) => {
    // Only apply this logic in development mode (where Turbopack is running)
    if (dev) {
      // Find the TailwindCssWebpackPlugin (the internal Next.js/Turbopack Tailwind plugin)
      const tailwindPlugin = config.plugins.find(
        (plugin) => plugin.constructor.name === 'TailwindCssWebpackPlugin'
      );
      
      if (tailwindPlugin) {
        // Explicitly set the configuration file path. This bypasses auto-detection issues.
        tailwindPlugin.options = {
          ...tailwindPlugin.options,
          configFile: './tailwind.config.js',
        };
      }
    }
    return config;
  },
};

export default nextConfig;