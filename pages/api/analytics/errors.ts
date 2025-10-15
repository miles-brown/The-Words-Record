import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { range = '7d' } = req.query

  // Generate error data based on range
  const getDays = () => {
    switch(range) {
      case '24h': return 1
      case '7d': return 7
      case '30d': return 30
      default: return 7
    }
  }

  const days = getDays()
  const now = Date.now()

  // Mock error data
  const errorData = {
    daily: Array.from({ length: days }, (_, i) => {
      const date = new Date(now - (days - i - 1) * 86400000)
      return {
        date: date.toISOString().split('T')[0],
        errors4xx: Math.floor(Math.random() * 50) + 20,
        errors5xx: Math.floor(Math.random() * 20) + 5
      }
    }),
    recentErrors: [
      {
        id: 'err_1',
        timestamp: new Date(now - 300000).toISOString(),
        type: '500',
        message: 'Internal Server Error',
        path: '/api/statements/bulk',
        method: 'POST',
        stackTrace: 'Error: Database connection timeout\n  at Connection.query\n  at async handler',
        userAgent: 'Mozilla/5.0',
        ip: '192.168.1.1'
      },
      {
        id: 'err_2',
        timestamp: new Date(now - 600000).toISOString(),
        type: '404',
        message: 'Resource not found',
        path: '/api/cases/non-existent',
        method: 'GET',
        stackTrace: null,
        userAgent: 'Chrome/91.0',
        ip: '10.0.0.1'
      },
      {
        id: 'err_3',
        timestamp: new Date(now - 900000).toISOString(),
        type: '403',
        message: 'Forbidden',
        path: '/api/admin/users',
        method: 'DELETE',
        stackTrace: null,
        userAgent: 'Safari/14.1',
        ip: '172.16.0.1'
      },
      {
        id: 'err_4',
        timestamp: new Date(now - 1200000).toISOString(),
        type: '502',
        message: 'Bad Gateway',
        path: '/api/external/webhook',
        method: 'POST',
        stackTrace: 'Error: Upstream server error\n  at Proxy.forward\n  at async middleware',
        userAgent: 'PostmanRuntime/7.28',
        ip: '192.168.2.1'
      },
      {
        id: 'err_5',
        timestamp: new Date(now - 1500000).toISOString(),
        type: '429',
        message: 'Too Many Requests',
        path: '/api/search',
        method: 'POST',
        stackTrace: null,
        userAgent: 'Python/3.9',
        ip: '10.1.1.1'
      }
    ],
    summary: {
      total4xx: days * 35,
      total5xx: days * 12,
      trend: {
        '4xx': -5.2, // percentage change
        '5xx': 2.3
      },
      mostCommonErrors: [
        { code: '404', count: 145, percentage: 42 },
        { code: '403', count: 89, percentage: 26 },
        { code: '500', count: 67, percentage: 19 },
        { code: '429', count: 34, percentage: 10 },
        { code: '502', count: 11, percentage: 3 }
      ]
    },
    range,
    timestamp: new Date().toISOString()
  }

  res.status(200).json(errorData)
}