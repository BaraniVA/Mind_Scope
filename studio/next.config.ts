
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Suppress React DevTools message
    reactStrictMode: false,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress certain webpack warnings in development
      config.stats = {
        ...config.stats,
        warnings: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
