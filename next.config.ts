import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://cinetube-backend-beta.vercel.app/api/v1/:path*',
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/t/p/**",
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // This allows all paths from Cloudinary
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org', // Adding this too since your cast photos use it!
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // For your fallbacks
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
