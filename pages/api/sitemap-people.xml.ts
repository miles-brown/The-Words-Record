/**
 * People Sitemap
 * Generates sitemap for all people profile pages
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
    // Fetch all active people
    const people = await prisma.person.findMany({
      where: {
        isActive: true
      },
      select: {
        slug: true,
        updatedAt: true,
        influenceScore: true,
        statementCount: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const entries: SitemapEntry[] = people.map(person => {
      // Calculate priority based on influence score and activity
      const influenceBoost = (person.influenceScore || 0) / 200
      const activityBoost = Math.min(0.2, (person.statementCount || 0) / 50)
      const priority = Math.min(0.9, 0.5 + influenceBoost + activityBoost)

      return {
        loc: `${SITE_URL}/people/${person.slug}`,
        lastmod: person.updatedAt.toISOString(),
        changefreq: 'weekly',
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
    console.error('People sitemap error:', error)
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
}
