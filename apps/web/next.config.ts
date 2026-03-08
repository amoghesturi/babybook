import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@babybook/shared'],
  async headers() {
    return [
      {
        // Block all search engine indexing on public share pages
        source: '/share/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
