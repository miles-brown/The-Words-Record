/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/incidents',
        destination: '/cases',
        permanent: true,
      },
      {
        source: '/incidents/:slug',
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
