/**
 * Usage Quotas API Endpoint
 * Handles usage tracking and quota management
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Quota, QuotaSummary } from '@/lib/apps/types'

const sampleQuotas: Quota[] = [
  {
    provider: 'OpenAI',
    unit: 'tokens',
    used: 450000,
    limit: 1000000,
    period: 'monthly',
    resetAt: new Date(new Date().setDate(1)).toISOString(),
  },
  {
    provider: 'Gmail',
    unit: 'emails',
    used: 234,
    limit: 500,
    period: 'daily',
    resetAt: new Date(new Date().setHours(0, 0, 0, 0) + 86400000).toISOString(),
  },
  {
    provider: 'Supabase',
    unit: 'GB bandwidth',
    used: 12.5,
    limit: 50,
    period: 'monthly',
    resetAt: new Date(new Date().setDate(1)).toISOString(),
  },
  {
    provider: 'Cloudflare',
    unit: 'requests',
    used: 890000,
    limit: 1000000,
    period: 'monthly',
    resetAt: new Date(new Date().setDate(1)).toISOString(),
  },
  {
    provider: 'Vercel',
    unit: 'function calls',
    used: 45000,
    limit: 100000,
    period: 'monthly',
    resetAt: new Date(new Date().setDate(1)).toISOString(),
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/apps/quotas`)

  try {
    if (req.method === 'GET') {
      const atRisk = sampleQuotas.filter(q => (q.used / q.limit) >= 0.8).length
      const averageUsage = sampleQuotas.reduce((acc, q) => acc + (q.used / q.limit) * 100, 0) / sampleQuotas.length

      const summary: QuotaSummary = {
        atRisk,
        averageUsage: Math.round(averageUsage * 10) / 10,
        totalServices: sampleQuotas.length,
      }

      console.log(`✅ Returning ${sampleQuotas.length} quotas, ${atRisk} at risk, avg ${summary.averageUsage}% usage`)
      return res.status(200).json({ status: 'ok', data: sampleQuotas, summary })
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
