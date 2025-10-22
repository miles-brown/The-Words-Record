/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core settings
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Compression
  compress: true,

  // Build optimizations
  swcMinify: true, // Use SWC for faster minification

  // Production source maps - disabled for faster builds
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    unoptimized: true, // You have this disabled - consider enabling in production
    formats: ['image/avif', 'image/webp'], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental optimizations
  experimental: {
    // Optimize package imports (tree-shaking for large packages)
    optimizePackageImports: ['recharts', 'react-markdown', 'remark'],
  },

  // TypeScript and ESLint - skip in dev, enforce in production
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },

  // Redirects are handled by redirect pages in pages/cases/*
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
      {
        source: '/sitemap-static.xml',
        destination: '/api/sitemap-static.xml',
      },
      {
        source: '/sitemap-cases.xml',
        destination: '/api/sitemap-cases.xml',
      },
      {
        source: '/sitemap-people.xml',
        destination: '/api/sitemap-people.xml',
      },
      {
        source: '/sitemap-organizations.xml',
        destination: '/api/sitemap-organizations.xml',
      },
      {
        source: '/sitemap-news.xml',
        destination: '/api/sitemap-news.xml',
      },
    ]
  },
}

const withPWA = require('@imbios/next-pwa')({
  dest: 'public',
  disable: true, // Temporarily disabled until icons are created
});

module.exports = withPWA(nextConfig);
