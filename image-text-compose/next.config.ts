import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['fabric', 'zustand', 'react-icons'],
  },
  images: {
    domains: [],
  },
  trailingSlash: false,
};

export default nextConfig;
