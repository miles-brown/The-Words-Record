import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Mock Lighthouse metrics - replace with actual Lighthouse API
  const lighthouseData = {
    performance: 92,
    accessibility: 98,
    bestPractices: 95,
    seo: 100,
    metrics: {
      fcp: { // First Contentful Paint
        value: 1.2,
        score: 95,
        unit: 's',
        description: 'First Contentful Paint marks the time when the first text or image is painted'
      },
      lcp: { // Largest Contentful Paint
        value: 2.1,
        score: 92,
        unit: 's',
        description: 'Largest Contentful Paint marks when the largest content element becomes visible'
      },
      cls: { // Cumulative Layout Shift
        value: 0.05,
        score: 98,
        unit: '',
        description: 'Cumulative Layout Shift measures visual stability'
      },
      tbt: { // Total Blocking Time
        value: 89,
        score: 96,
        unit: 'ms',
        description: 'Sum of all time periods where task length exceeded 50ms'
      },
      tti: { // Time to Interactive
        value: 3.2,
        score: 94,
        unit: 's',
        description: 'Time when page becomes fully interactive'
      },
      si: { // Speed Index
        value: 1.8,
        score: 93,
        unit: 's',
        description: 'How quickly contents of page are visibly populated'
      }
    },
    timestamp: new Date().toISOString(),
    url: 'https://who-said-what.com'
  }

  res.status(200).json(lighthouseData)
}