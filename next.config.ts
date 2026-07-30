import type { NextConfig } from "next";

// GitHub Pages serves this repo at /website/, so the static export needs
// that prefix baked into every asset and link. Only applied in the CI
// build (GITHUB_PAGES=true) so local dev/build keep serving from the root.
const basePath = process.env.GITHUB_PAGES === "true" ? "/website" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
};

export default nextConfig;
