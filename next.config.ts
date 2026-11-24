import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // OG images read these fonts from disk at build/request time.
  outputFileTracingIncludes: { "/**": ["./src/assets/fonts/*.ttf"], "/pdf/**": ["./public/graphs/*.png"] },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
