import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Mock integration health data
  const integrationsData = {
    services: [
      {
        name: 'Supabase',
        type: 'Database',
        status: 'operational',
        statusCode: 200,
        latency: 12,
        lastChecked: new Date(Date.now() - 30000).toISOString(),
        uptime: 99.99,
        details: {
          connections: 45,
          activeQueries: 8,
          poolSize: 100,
          version: '1.88.2'
        }
      },
      {
        name: 'Vercel',
        type: 'Hosting',
        status: 'operational',
        statusCode: 200,
        latency: 8,
        lastChecked: new Date(Date.now() - 35000).toISOString(),
        uptime: 99.98,
        details: {
          region: 'us-east-1',
          functions: 12,
          bandwidth: '234 GB',
          builds: 156
        }
      },
      {
        name: 'Cloudflare',
        type: 'CDN',
        status: 'operational',
        statusCode: 200,
        latency: 3,
        lastChecked: new Date(Date.now() - 28000).toISOString(),
        uptime: 100,
        details: {
          cacheHitRate: 92.3,
          bandwidth: '1.2 TB',
          requests: '2.3M',
          threats: 234
        }
      },
      {
        name: 'Redis',
        type: 'Cache',
        status: 'degraded',
        statusCode: 200,
        latency: 45,
        lastChecked: new Date(Date.now() - 40000).toISOString(),
        uptime: 98.5,
        details: {
          memory: '78%',
          keys: 4567,
          hitRate: 87.2,
          connections: 23
        }
      },
      {
        name: 'Stripe',
        type: 'Payments',
        status: 'operational',
        statusCode: 200,
        latency: 125,
        lastChecked: new Date(Date.now() - 32000).toISOString(),
        uptime: 99.95,
        details: {
          mode: 'live',
          webhooks: 8,
          subscriptions: 234,
          revenue: '$12,345'
        }
      },
      {
        name: 'SendGrid',
        type: 'Email',
        status: 'operational',
        statusCode: 200,
        latency: 89,
        lastChecked: new Date(Date.now() - 38000).toISOString(),
        uptime: 99.9,
        details: {
          sent: 5678,
          delivered: 5543,
          bounced: 23,
          opened: 3456
        }
      },
      {
        name: 'GitHub',
        type: 'Version Control',
        status: 'operational',
        statusCode: 200,
        latency: 67,
        lastChecked: new Date(Date.now() - 25000).toISOString(),
        uptime: 99.8,
        details: {
          repos: 5,
          branches: 23,
          commits: 1234,
          pullRequests: 45
        }
      },
      {
        name: 'Sentry',
        type: 'Error Tracking',
        status: 'error',
        statusCode: 503,
        latency: null,
        lastChecked: new Date(Date.now() - 20000).toISOString(),
        uptime: 95.2,
        details: {
          issues: 89,
          events: 2345,
          users: 567,
          projects: 3
        }
      },
      {
        name: 'Google Analytics',
        type: 'Analytics',
        status: 'operational',
        statusCode: 200,
        latency: 34,
        lastChecked: new Date(Date.now() - 42000).toISOString(),
        uptime: 99.99,
        details: {
          properties: 2,
          views: 4,
          events: '234K',
          users: '12K'
        }
      }
    ],
    summary: {
      total: 9,
      operational: 7,
      degraded: 1,
      error: 1,
      avgLatency: 48.5,
      avgUptime: 99.2
    },
    timestamp: new Date().toISOString()
  }

  res.status(200).json(integrationsData)
}