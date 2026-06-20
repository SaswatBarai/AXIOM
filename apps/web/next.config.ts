import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@axiom/ui", "@axiom/shared-types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
