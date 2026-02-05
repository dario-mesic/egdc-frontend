import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  serverExternalPackages: ["@countrystatecity/countries"],
  outputFileTracingIncludes: {
    "*": ["./node_modules/@countrystatecity/countries/**"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://wp-domain.com;",
          },
        ],
      },
    ];
  },
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
    const apiBase = process.env.API_BASE_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/static/uploads/:path*",
        destination: `${apiBase}/static/uploads/:path*`,
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
