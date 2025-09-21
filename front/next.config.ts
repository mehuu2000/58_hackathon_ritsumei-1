import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://bomu.info:8000/:path*',
      },
    ]
  },
};

export default nextConfig;
