import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/GIG-Dashboard-Web",
  assetPrefix: "/GIG-Dashboard-Web/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
