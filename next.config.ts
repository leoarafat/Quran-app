import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: no server or database needed, works on any static host.
  output: "export",
  trailingSlash: true,
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
