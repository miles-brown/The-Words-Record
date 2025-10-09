/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/cases',
        destination: '/cases',
        permanent: true,
      },
      {
        source: '/cases/:slug',
        destination: '/cases/:slug',
        permanent: true,
      },
    ]
  },
}

const withPWA = require('@imbios/next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA(nextConfig);
