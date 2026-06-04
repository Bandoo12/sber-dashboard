import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/sber-dashboard',
  assetPrefix: '/sber-dashboard',
};

export default nextConfig;
