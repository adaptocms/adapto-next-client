import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.adaptocms.com",
      },
    ],
  },
};

export default nextConfig;
