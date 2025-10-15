import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Mock data - replace with actual Vercel Build API integration
  const buildData = {
    latest: {
      duration: 45.2, // seconds
      bundleSize: 2.3, // MB
      jsAssets: 12,
      cssAssets: 4,
      timestamp: new Date().toISOString(),
      status: 'success',
      buildId: 'bld_' + Math.random().toString(36).substring(7)
    },
    history: [
      { duration: 45.2, timestamp: new Date(Date.now() - 0 * 3600000).toISOString() },
      { duration: 42.8, timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
      { duration: 48.1, timestamp: new Date(Date.now() - 12 * 3600000).toISOString() },
      { duration: 44.5, timestamp: new Date(Date.now() - 18 * 3600000).toISOString() },
      { duration: 46.3, timestamp: new Date(Date.now() - 24 * 3600000).toISOString() }
    ],
    health: 'good' // good, warning, critical
  }

  res.status(200).json(buildData)
}