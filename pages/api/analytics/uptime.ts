import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { range = '30d' } = req.query

  // Generate uptime data based on range
  const getDays = () => {
    switch(range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      default: return 30
    }
  }

  const days = getDays()
  const now = Date.now()

  // Mock uptime data
  const uptimeData = {
    current: {
      status: 'operational',
      uptime: 99.98,
      lastDowntime: {
        date: new Date(now - 5 * 86400000).toISOString(),
        duration: 324, // seconds
        cause: 'Database maintenance',
        severity: 'planned'
      }
    },
    history: Array.from({ length: days }, (_, i) => {
      const date = new Date(now - (days - i - 1) * 86400000)
      // Simulate mostly good uptime with occasional issues
      const randomUptime = i % 7 === 3 ? 99.5 + Math.random() * 0.4 : 99.9 + Math.random() * 0.1
      return {
        date: date.toISOString().split('T')[0],
        uptime: Math.min(randomUptime, 100),
        incidents: i % 7 === 3 ? 1 : 0,
        maintenanceMinutes: i % 14 === 7 ? 30 : 0
      }
    }),
    incidents: [
      {
        id: 'inc_1',
        date: new Date(now - 5 * 86400000).toISOString(),
        duration: 324,
        type: 'planned',
        severity: 'low',
        title: 'Database maintenance',
        description: 'Scheduled database optimization and backup',
        affectedServices: ['Database', 'API'],
        resolution: 'Maintenance completed successfully'
      },
      {
        id: 'inc_2',
        date: new Date(now - 12 * 86400000).toISOString(),
        duration: 89,
        type: 'unplanned',
        severity: 'medium',
        title: 'API timeout errors',
        description: 'Increased latency on API endpoints',
        affectedServices: ['API'],
        resolution: 'Auto-scaled instances to handle load'
      },
      {
        id: 'inc_3',
        date: new Date(now - 23 * 86400000).toISOString(),
        duration: 1245,
        type: 'unplanned',
        severity: 'high',
        title: 'CDN outage',
        description: 'Cloudflare regional outage affecting asset delivery',
        affectedServices: ['CDN', 'Assets'],
        resolution: 'Failed over to backup CDN provider'
      }
    ],
    metrics: {
      averageUptime: 99.97,
      totalIncidents: 3,
      totalDowntime: 1658, // seconds
      mtbf: 10.2, // Mean time between failures (days)
      mttr: 552, // Mean time to recovery (seconds)
      slaCompliance: true,
      slaTarget: 99.9
    },
    monitoring: {
      checks: [
        { name: 'Homepage', status: 'up', latency: 234, lastCheck: new Date(now - 30000).toISOString() },
        { name: 'API Health', status: 'up', latency: 45, lastCheck: new Date(now - 28000).toISOString() },
        { name: 'Database', status: 'up', latency: 12, lastCheck: new Date(now - 32000).toISOString() },
        { name: 'CDN', status: 'up', latency: 3, lastCheck: new Date(now - 35000).toISOString() },
        { name: 'Search', status: 'up', latency: 89, lastCheck: new Date(now - 31000).toISOString() }
      ],
      locations: [
        { name: 'US East', status: 'operational', latency: 23 },
        { name: 'US West', status: 'operational', latency: 45 },
        { name: 'EU West', status: 'operational', latency: 67 },
        { name: 'Asia Pacific', status: 'operational', latency: 123 }
      ]
    },
    range,
    timestamp: new Date().toISOString()
  }

  res.status(200).json(uptimeData)
}