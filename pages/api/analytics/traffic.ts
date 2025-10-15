import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { range = '7d' } = req.query

  // Generate traffic data based on range
  const getDataPoints = () => {
    switch(range) {
      case '24h': return 24
      case '7d': return 7
      case '30d': return 30
      default: return 7
    }
  }

  const dataPoints = getDataPoints()
  const now = Date.now()

  // Mock traffic data
  const trafficData = {
    overview: {
      visitors: 12543,
      sessions: 18234,
      pageViews: 45678,
      bounceRate: 32.5,
      avgSessionDuration: 245, // seconds
      changes: {
        visitors: 12.3,
        sessions: 8.7,
        pageViews: 15.2,
        bounceRate: -2.1,
        avgSessionDuration: 5.4
      }
    },
    timeSeries: Array.from({ length: dataPoints }, (_, i) => ({
      timestamp: new Date(now - (dataPoints - i - 1) * (range === '24h' ? 3600000 : 86400000)).toISOString(),
      visitors: Math.floor(Math.random() * 500) + 300,
      sessions: Math.floor(Math.random() * 700) + 400,
      pageViews: Math.floor(Math.random() * 2000) + 1000
    })),
    geography: [
      { country: 'United States', code: 'US', sessions: 5234, percentage: 28.7 },
      { country: 'United Kingdom', code: 'GB', sessions: 3456, percentage: 18.9 },
      { country: 'Canada', code: 'CA', sessions: 2345, percentage: 12.9 },
      { country: 'Germany', code: 'DE', sessions: 1987, percentage: 10.9 },
      { country: 'France', code: 'FR', sessions: 1543, percentage: 8.5 },
      { country: 'Japan', code: 'JP', sessions: 1234, percentage: 6.8 },
      { country: 'Australia', code: 'AU', sessions: 987, percentage: 5.4 },
      { country: 'Netherlands', code: 'NL', sessions: 765, percentage: 4.2 },
      { country: 'Spain', code: 'ES', sessions: 432, percentage: 2.4 },
      { country: 'Others', code: 'OTHER', sessions: 251, percentage: 1.4 }
    ],
    funnel: [
      { stage: 'Landing', value: 10000, dropoff: 0 },
      { stage: 'Browsing', value: 7500, dropoff: 25 },
      { stage: 'Interaction', value: 4500, dropoff: 40 },
      { stage: 'Engagement', value: 2000, dropoff: 55.6 },
      { stage: 'Retention', value: 800, dropoff: 60 }
    ],
    devices: {
      desktop: 58.3,
      mobile: 35.2,
      tablet: 6.5
    },
    browsers: {
      chrome: 65.2,
      safari: 18.3,
      firefox: 8.7,
      edge: 5.2,
      other: 2.6
    },
    topPages: [
      { path: '/', views: 8234, avgTime: 45 },
      { path: '/cases', views: 6543, avgTime: 123 },
      { path: '/people', views: 4567, avgTime: 98 },
      { path: '/statements', views: 3456, avgTime: 156 },
      { path: '/about', views: 2345, avgTime: 67 }
    ],
    range,
    timestamp: new Date().toISOString()
  }

  res.status(200).json(trafficData)
}