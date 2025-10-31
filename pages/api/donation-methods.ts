import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Public endpoint - only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Try to get donation methods from database
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
      }
    ]

    return res.status(200).json(defaultMethods)
  } catch (error) {
    console.error('Error fetching donation methods:', error)
    return res.status(500).json({ error: 'Failed to fetch donation methods' })
  } finally {
    await prisma.$disconnect()
  }
}