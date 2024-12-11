import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['firebasestorage.googleapis.com','lh3.googleusercontent.com'], // Add Firebase Storage domain
  },
};

export default nextConfig;
