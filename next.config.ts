import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["lvh.me", "*.lvh.me"],
  async redirects() {
    return [
      {
        source: "/j/:tel",
        destination: "/booking/:tel",
        permanent: false,
      },
      {
        source: "/b/:bookingId",
        destination: "/booking/:bookingId",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "hue-line.s3.us-east-1.amazonaws.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "utfs.io", port: "", pathname: "/**" },
      { protocol: "https", hostname: "hue-line.s3.amazonaws.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "cdn.hue-line.com", port: "", pathname: "/**" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["lvh.me:5000", "*.lvh.me:5000", "localhost:5000"],
    },
  },
};

export default nextConfig;