import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/j/:tel',
        destination: '/booking/:tel',
        permanent: false,
      },
      // Short URL for subdomain bookings
      {
        source: '/b/:bookingId',
        destination: '/booking/:bookingId',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hue-line.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: "/**"
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'hue-line.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'cdn.hue-line.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;