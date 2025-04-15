import type { NextConfig } from "next";

const isInDocker = process.env.DOCKER === "true";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:6001/api/v1/"}:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: isInDocker, // Skip ESLint checks during production build
  },
};

export default nextConfig;
