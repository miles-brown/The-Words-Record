import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { range = '24h' } = req.query

  // Generate time series data based on range
  const getDataPoints = () => {
    switch(range) {
      case '24h': return 24
      case '7d': return 7 * 4 // 4 times per day
      case '30d': return 30
      default: return 24
    }
  }

  const dataPoints = getDataPoints()
  const now = Date.now()

  // Mock API latency data
  const latencyData = {
    endpoints: [
      {
        path: '/api/cases',
        method: 'GET',
        avgLatency: 45,
        p95Latency: 89,
        p99Latency: 142,
        requestCount: 3542,
        errorRate: 0.2,
        data: Array.from({ length: dataPoints }, (_, i) => ({
          timestamp: new Date(now - (dataPoints - i) * 3600000).toISOString(),
          latency: 40 + Math.random() * 20
        }))
      },
      {
        path: '/api/people',
        method: 'GET',
        avgLatency: 38,
        p95Latency: 72,
        p99Latency: 118,
        requestCount: 2891,
        errorRate: 0.1,
        data: Array.from({ length: dataPoints }, (_, i) => ({
          timestamp: new Date(now - (dataPoints - i) * 3600000).toISOString(),
          latency: 35 + Math.random() * 15
        }))
      },
      {
        path: '/api/statements',
        method: 'GET',
        avgLatency: 52,
        p95Latency: 98,
        p99Latency: 156,
        requestCount: 1987,
        errorRate: 0.3,
        data: Array.from({ length: dataPoints }, (_, i) => ({
          timestamp: new Date(now - (dataPoints - i) * 3600000).toISOString(),
          latency: 48 + Math.random() * 25
        }))
      },
      {
        path: '/api/search',
        method: 'POST',
        avgLatency: 125,
        p95Latency: 245,
        p99Latency: 389,
        requestCount: 5234,
        errorRate: 0.5,
        data: Array.from({ length: dataPoints }, (_, i) => ({
          timestamp: new Date(now - (dataPoints - i) * 3600000).toISOString(),
          latency: 110 + Math.random() * 50
        }))
      },
      {
        path: '/api/analytics',
        method: 'GET',
        avgLatency: 28,
        p95Latency: 54,
        p99Latency: 87,
        requestCount: 892,
        errorRate: 0.1,
        data: Array.from({ length: dataPoints }, (_, i) => ({
          timestamp: new Date(now - (dataPoints - i) * 3600000).toISOString(),
          latency: 25 + Math.random() * 10
        }))
      }
    ],
    summary: {
      totalRequests: 14556,
      avgLatency: 58,
      errorRate: 0.24,
      uptime: 99.98
    },
    range,
    timestamp: new Date().toISOString()
  }

  res.status(200).json(latencyData)
}