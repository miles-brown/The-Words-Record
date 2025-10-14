/**
 * Organizations Sitemap
 * Generates sitemap for all organization pages
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

interface SitemapEntry {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

function generateUrlXml(entry: SitemapEntry): string {
  return `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch all organizations
    const organizations = await prisma.organization.findMany({
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            statements: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const entries: SitemapEntry[] = organizations.map(org => {
      // Calculate priority based on activity
      const activityBoost = Math.min(0.2, (org._count.statements || 0) / 25)
      const priority = Math.min(0.8, 0.5 + activityBoost)

      // Determine change frequency based on recency
      const ageDays = (Date.now() - new Date(org.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      const changefreq: SitemapEntry['changefreq'] =
        ageDays < 30 ? 'weekly' : ageDays < 180 ? 'monthly' : 'yearly'

      return {
        loc: `${SITE_URL}/organizations/${org.slug}`,
        lastmod: org.updatedAt.toISOString(),
        changefreq,
        priority: Math.round(priority * 10) / 10
      }
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(generateUrlXml).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=7200, s-maxage=14400')
    res.status(200).send(xml)
  } catch (error) {
    console.error('Organizations sitemap error:', error)
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
}
