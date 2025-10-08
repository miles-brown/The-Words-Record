import type { NextApiRequest, NextApiResponse } from 'next'
import { getTokenFromCookie, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const token = getTokenFromCookie(req)
    
    if (!token) {
      return res.status(401).json({ error: 'No token found' })
    }

    const user = verifyToken(token)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    res.status(500).json({ error: 'Authentication check failed' })
  }
}