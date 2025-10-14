/**
 * Main Sitemap Index
 * Serves as the master sitemap index that references all specialized sitemaps
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
 */

import { NextApiRequest, NextApiResponse } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

/**
 * Generate sitemap index XML that references all sub-sitemaps
 */
function generateSitemapIndex(): string {
  const now = new Date().toISOString()

  const sitemaps = [
    { loc: `${SITE_URL}/sitemap-static.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-cases.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-people.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-organizations.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap-news.xml`, lastmod: now }
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return xml
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const xml = generateSitemapIndex()

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200')
    res.status(200).send(xml)
  } catch (error) {
    console.error('Sitemap index error:', error)
    res.status(500).json({ error: 'Failed to generate sitemap index' })
  }
}
