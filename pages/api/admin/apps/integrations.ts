import { NextApiRequest, NextApiResponse } from 'next'

// Mock data for development
const integrations = [
  {
    id: '1',
    provider: 'supabase',
    name: 'Supabase',
    status: 'connected',
    lastPing: 12,
    config: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    provider: 'vercel',
    name: 'Vercel',
    status: 'connected',
    lastPing: 8,
    config: {},
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add authentication check for SuperAdmin

  switch (req.method) {
    case 'GET':
      // Return list of integrations
      return res.status(200).json(integrations)

    case 'POST':
      // Create new integration
      const { provider, name, config } = req.body
      const newIntegration = {
        id: Date.now().toString(),
        provider,
        name,
        status: 'connected',
        lastPing: 0,
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      integrations.push(newIntegration)
      return res.status(201).json(newIntegration)

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}