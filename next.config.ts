import type { NextConfig } from "next"

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = withBundleAnalyzer({
  output: "standalone",
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  typescript: {
    // Temporarily ignore type errors for deployment
    // TODO: Remove after fixing component test configuration
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  serverExternalPackages: ["shiki", "vscode-oniguruma"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        port: "",
        pathname: "/favicon.ico",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
})

export default nextConfig
