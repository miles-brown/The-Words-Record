import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Verify admin authentication
async function verifyAdmin(req: NextApiRequest): Promise<boolean> {
  try {
    const token = req.cookies?.adminToken
    if (!token) return false

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user is admin in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    return user?.role === 'ADMIN'
  } catch {
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin authentication
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    if (req.method === 'GET') {
      // Get current donation methods
      const settings = await prisma.settings.findFirst({
        where: { key: 'donation_methods' }
      })

      if (settings && settings.value) {
        const methods = JSON.parse(settings.value as string)
        return res.status(200).json(methods)
      }

      // Return default methods if none are saved
      const defaultMethods = [
        {
          id: 'buymeacoffee',
          name: 'Buy Me a Coffee',
          url: 'https://buymeacoffee.com/thewordsrecord',
          icon: '☕',
          description: 'Quick and easy one-time support',
          isActive: true,
          displayOrder: 1
        },
        {
          id: 'stripe',
          name: 'Stripe',
          url: '#stripe',
          icon: '💳',
          description: 'Secure recurring or one-time donations',
          isActive: true,
          displayOrder: 2
        },
        {
          id: 'paypal',
          name: 'PayPal',
          url: '#paypal',
          icon: '💰',
          description: 'Trusted worldwide payment platform',
          isActive: true,
          displayOrder: 3
        },
        {
          id: 'patreon',
          name: 'Patreon',
          url: '#patreon',
          icon: '🎨',
          description: 'Monthly membership support',
          isActive: false,
          displayOrder: 4
        },
        {
          id: 'github',
          name: 'GitHub Sponsors',
          url: '#github',
          icon: '💻',
          description: 'Support through GitHub',
          isActive: false,
          displayOrder: 5
        },
        {
          id: 'crypto',
          name: 'Cryptocurrency',
          url: '#crypto',
          icon: '₿',
          description: 'Bitcoin and other cryptocurrencies',
          isActive: false,
          displayOrder: 6
        }
      ]

      return res.status(200).json(defaultMethods)

    } else if (req.method === 'POST') {
      // Update donation methods
      const { methods } = req.body

      if (!methods || !Array.isArray(methods)) {
        return res.status(400).json({ error: 'Invalid methods data' })
      }

      // Validate each method
      for (const method of methods) {
        if (!method.id || !method.name || !method.url) {
          return res.status(400).json({ error: 'Each method must have id, name, and url' })
        }
      }

      // Save to database
      await prisma.settings.upsert({
        where: { key: 'donation_methods' },
        create: {
          key: 'donation_methods',
          value: JSON.stringify(methods)
        },
        update: {
          value: JSON.stringify(methods)
        }
      })

      // Log the change
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      })

      if (adminUser) {
        await prisma.auditLog.create({
          data: {
            userId: adminUser.id,
            action: 'UPDATE',
            entityType: 'Settings',
            entityId: 'donation_methods',
            changes: JSON.stringify({ methods }),
            ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || ''
          }
        })
      }

      return res.status(200).json({ success: true, methods })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Error managing donation methods:', error)
    return res.status(500).json({ error: 'Failed to manage donation methods' })
  } finally {
    await prisma.$disconnect()
  }
}