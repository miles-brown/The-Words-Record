import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Mock conversion funnel data
  const funnelData = {
    stages: [
      {
        name: 'Landing',
        value: 10000,
        percentage: 100,
        dropoff: 0,
        color: '#3B82F6'
      },
      {
        name: 'Interaction',
        value: 7500,
        percentage: 75,
        dropoff: 25,
        color: '#8B5CF6'
      },
      {
        name: 'Conversion',
        value: 4500,
        percentage: 45,
        dropoff: 40,
        color: '#EC4899'
      },
      {
        name: 'Retention',
        value: 2000,
        percentage: 20,
        dropoff: 55.6,
        color: '#F59E0B'
      }
    ],
    timestamp: new Date().toISOString()
  }

  res.status(200).json(funnelData)
}