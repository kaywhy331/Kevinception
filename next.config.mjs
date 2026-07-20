/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd()
  },
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'three']
  }
};

export default nextConfig;
