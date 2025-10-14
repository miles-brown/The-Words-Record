/**
 * Cases Sitemap
 * Generates sitemap for all case/statement pages
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
    // Fetch all public cases
    const cases = await prisma.case.findMany({
      where: {
        visibility: 'PUBLIC',
        isArchived: false
      },
      select: {
        slug: true,
        updatedAt: true,
        caseDate: true,
        prominenceScore: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const entries: SitemapEntry[] = cases.map(item => {
      // Calculate priority based on prominence and recency
      const ageDays = (Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      const recencyBoost = Math.max(0.3, 1 - (ageDays / 365))
      const prominenceBoost = (item.prominenceScore || 50) / 100
      const priority = Math.min(0.9, 0.5 + (recencyBoost * 0.3) + (prominenceBoost * 0.2))

      return {
        loc: `${SITE_URL}/statements/${item.slug}`,
        lastmod: item.updatedAt.toISOString(),
        changefreq: ageDays < 7 ? 'daily' : ageDays < 30 ? 'weekly' : 'monthly',
        priority: Math.round(priority * 10) / 10
      }
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.map(generateUrlXml).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200')
    res.status(200).send(xml)
  } catch (error) {
    console.error('Cases sitemap error:', error)
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
}
