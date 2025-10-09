/**
 * Add these rewrites to your next.config.js
 * This enables sitemap.xml URLs to work properly
 */

module.exports = {
  // ... your existing config ...

  async rewrites() {
    return [
      // Sitemap rewrites
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml'
      },
      {
        source: '/sitemap-:type.xml',
        destination: '/api/sitemap.xml?type=:type'
      },
      {
        source: '/sitemap-index.xml',
        destination: '/api/sitemap.xml?type=index'
      }
    ]
  },

  // Add headers for security
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  }
}