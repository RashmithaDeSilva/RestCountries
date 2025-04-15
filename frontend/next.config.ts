import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Any request to /api/... will be redirected
        destination: "http://192.168.1.6:6001/api/v1/:path*", // Your Flask backend
      },
    ];
  },
};

export default nextConfig;