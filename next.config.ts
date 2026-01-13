import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/case-studies",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/static/uploads/:path*",
        destination: "http://127.0.0.1:8000/static/uploads/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/static/uploads/**",
      },
    ],
  },
};

export default nextConfig;
