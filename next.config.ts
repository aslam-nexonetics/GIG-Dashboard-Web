import type { NextConfig } from "next";

// Use basePath for GitHub Pages CI/CD deployment, but serve from root "/" locally
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGithubActions ? "/GIG-Dashboard-Web" : "");

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
