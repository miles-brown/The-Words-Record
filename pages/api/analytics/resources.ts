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
      case '7d': return 7 * 24
      case '30d': return 30
      default: return 24
    }
  }

  const dataPoints = getDataPoints()
  const now = Date.now()
  const interval = range === '24h' ? 3600000 : range === '7d' ? 3600000 : 86400000

  // Mock resource usage data
  const resourcesData = {
    database: {
      current: {
        queries: 234,
        connections: 45,
        slowQueries: 3,
        storage: 2.4, // GB
        cpu: 34.5, // %
        memory: 67.8 // %
      },
      timeSeries: Array.from({ length: Math.min(dataPoints, 30) }, (_, i) => ({
        timestamp: new Date(now - (dataPoints - i - 1) * interval).toISOString(),
        queries: Math.floor(Math.random() * 100) + 150,
        connections: Math.floor(Math.random() * 20) + 30,
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 20 + 60
      })),
      dailyAverage: {
        queries: 8234,
        connections: 42,
        slowQueries: 12,
        cpu: 38.2,
        memory: 65.4
      }
    },
    api: {
      current: {
        requests: 456,
        avgLatency: 45,
        errorRate: 0.2,
        throughput: 78.5, // req/s
        bandwidth: 23.4 // MB/s
      },
      timeSeries: Array.from({ length: Math.min(dataPoints, 30) }, (_, i) => ({
        timestamp: new Date(now - (dataPoints - i - 1) * interval).toISOString(),
        requests: Math.floor(Math.random() * 200) + 300,
        latency: Math.random() * 30 + 30,
        errorRate: Math.random() * 0.5,
        throughput: Math.random() * 40 + 60
      })),
      dailyAverage: {
        requests: 45678,
        avgLatency: 52,
        errorRate: 0.3,
        throughput: 72.3,
        bandwidth: 567.8
      }
    },
    storage: {
      current: {
        used: 45.6, // GB
        total: 100, // GB
        files: 12345,
        largestFile: 234, // MB
        cacheSize: 2.3 // GB
      },
      breakdown: [
        { type: 'Images', size: 23.4, count: 8765, percentage: 51.3 },
        { type: 'Documents', size: 12.3, count: 2345, percentage: 27.0 },
        { type: 'Database', size: 5.6, count: 1, percentage: 12.3 },
        { type: 'Logs', size: 2.8, count: 987, percentage: 6.1 },
        { type: 'Cache', size: 1.5, count: 247, percentage: 3.3 }
      ],
      timeSeries: Array.from({ length: Math.min(dataPoints, 30) }, (_, i) => ({
        timestamp: new Date(now - (dataPoints - i - 1) * interval).toISOString(),
        used: 40 + Math.random() * 10,
        files: 12000 + Math.floor(Math.random() * 500)
      }))
    },
    serverResources: {
      cpu: {
        usage: 42.3,
        cores: 8,
        processes: 234,
        loadAverage: [1.23, 1.45, 1.67]
      },
      memory: {
        used: 6.7, // GB
        total: 16, // GB
        percentage: 41.9,
        cached: 2.3 // GB
      },
      disk: {
        read: 123.4, // MB/s
        write: 89.2, // MB/s
        iops: 4567
      },
      network: {
        in: 234.5, // Mbps
        out: 456.7, // Mbps
        packets: 12345,
        errors: 2
      }
    },
    range,
    timestamp: new Date().toISOString()
  }

  res.status(200).json(resourcesData)
}