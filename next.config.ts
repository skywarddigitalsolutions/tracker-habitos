import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  turbopack: {},
};

// Only apply PWA wrapper in production
let configToExport: NextConfig = nextConfig;

if (process.env.NODE_ENV === 'production') {
  try {
    const withPWA = require('next-pwa')({
      dest: 'public',
      register: true,
      skipWaiting: true,
    });
    configToExport = withPWA(nextConfig);
  } catch {
    configToExport = nextConfig;
  }
}

export default configToExport;
