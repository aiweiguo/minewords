import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow 127.0.0.1 during local/dev playtests (HMR + client bundles).
  allowedDevOrigins: ["127.0.0.1"],
  // Old speak-attack path used "review" (复习); keep bookmarks working.
  async redirects() {
    return [
      {
        source: "/review",
        destination: "/fight",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
