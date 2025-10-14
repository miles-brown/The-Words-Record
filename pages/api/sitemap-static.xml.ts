/**
 * Static Pages Sitemap
 * Generates sitemap for static/navigation pages
 */

import { NextApiRequest, NextApiResponse } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

interface SitemapEntry {
  loc: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

/**
 * Define all static pages with their SEO metadata
 */
function getStaticPages(): SitemapEntry[] {
  return [
    {
      loc: `${SITE_URL}/`,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${SITE_URL}/statements`,
      changefreq: 'hourly',
      priority: 0.9
    },
    {
      loc: `${SITE_URL}/cases`,
      changefreq: 'hourly',
      priority: 0.9
    },
    {
      loc: `${SITE_URL}/people`,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      loc: `${SITE_URL}/organizations`,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      loc: `${SITE_URL}/topics`,
      changefreq: 'daily',
      priority: 0.7
    },
    {
      loc: `${SITE_URL}/search`,
      changefreq: 'weekly',
      priority: 0.6
    },
    {
      loc: `${SITE_URL}/about`,
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      loc: `${SITE_URL}/privacy`,
      changefreq: 'monthly',
      priority: 0.3
    },
    {
      loc: `${SITE_URL}/terms`,
      changefreq: 'monthly',
      priority: 0.3
    }
  ]
}

function generateUrlXml(entry: SitemapEntry): string {
  return `  <url>
    <loc>${entry.loc}</loc>
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
    const pages = getStaticPages()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(generateUrlXml).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400') // Cache for 24 hours
    res.status(200).send(xml)
  } catch (error) {
    console.error('Static sitemap error:', error)
    res.status(500).json({ error: 'Failed to generate static sitemap' })
  }
}
