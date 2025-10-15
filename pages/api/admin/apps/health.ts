import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'POST') {
    // Mock health check data
    const healthData = [
      { provider: 'Supabase', status: 'ok', latencyMs: 12, checkedAt: new Date().toISOString() },
      { provider: 'Vercel', status: 'ok', latencyMs: 8, checkedAt: new Date().toISOString() },
      { provider: 'Cloudflare', status: 'ok', latencyMs: 3, checkedAt: new Date().toISOString() },
      { provider: 'OpenAI', status: 'ok', latencyMs: 125, checkedAt: new Date().toISOString() },
      { provider: 'Discord', status: 'error', latencyMs: 0, checkedAt: new Date().toISOString(), message: 'Invalid token' },
      { provider: 'Gmail', status: 'timeout', latencyMs: 5000, checkedAt: new Date().toISOString(), message: 'Request timeout' }
    ]

    return res.status(200).json(healthData)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}