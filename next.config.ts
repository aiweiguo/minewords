import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow 127.0.0.1 during local/dev playtests (HMR + client bundles).
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
