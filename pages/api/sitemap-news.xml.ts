/**
 * News Sitemap
 * Generates Google News sitemap for recent content (last 48 hours)
 * https://support.google.com/news/publisher-center/answer/9606710
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

interface NewsSitemapEntry {
  loc: string
  lastmod: string
  title: string
  publicationDate: string
}

function generateNewsUrlXml(entry: NewsSitemapEntry): string {
  // Escape XML special characters
  const escapeXml = (str: string) =>
    str.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;'
        case '>': return '&gt;'
        case '&': return '&amp;'
        case "'": return '&apos;'
        case '"': return '&quot;'
        default: return c
      }
    })

  return `  <url>
    <loc>${entry.loc}</loc>
    <news:news>
      <news:publication>
        <news:name>The Words Record</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${entry.publicationDate}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
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
    // Fetch recent cases from last 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const recentCases = await prisma.case.findMany({
      where: {
        visibility: 'PUBLIC',
        isArchived: false,
        caseDate: {
          gte: twoDaysAgo
        }
      },
      select: {
        slug: true,
        title: true,
        caseDate: true,
        updatedAt: true
      },
      orderBy: {
        caseDate: 'desc'
      },
      take: 100 // Limit for news sitemap
    })

    const entries: NewsSitemapEntry[] = recentCases.map(item => ({
      loc: `${SITE_URL}/statements/${item.slug}`,
      lastmod: item.updatedAt.toISOString(),
      title: item.title || 'Statement Record',
      publicationDate: item.caseDate.toISOString()
    }))

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.map(generateNewsUrlXml).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600') // Cache for 30 min / 1 hour
    res.status(200).send(xml)
  } catch (error) {
    console.error('News sitemap error:', error)
    res.status(500).json({ error: 'Failed to generate news sitemap' })
  }
}
