import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    console.log(process.env.API_URL);
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://172.20.5.4:6001/api/v1/"}:path*`, // Run on docker compose 172.20.5.4
      },
    ];
  },
};

export default nextConfig;
