/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
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
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA(nextConfig);
