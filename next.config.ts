import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60000,
  },

  // Turbopack configuration to silence the custom webpack configuration warning/error
  turbopack: {},

  // Bundle analysis (run with: ANALYZE=true npm run build)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Split vendor code
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Split React Query separately
        reactQuery: {
          test: /[\\/]node_modules[\\/](@tanstack|react-query)[\\/]/,
          name: 'react-query',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Split common modules
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      };
    }

    return config;
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },

  // Rewrites for API calls
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },

  // TypeScript strict mode
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@tanstack/react-query',
      'lodash-es',
      '@mui/icons-material',
    ],
  },
};

export default nextConfig;