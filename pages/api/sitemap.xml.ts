/**
 * Dynamic Sitemap Generator
 * Generates XML sitemaps for all public content with proper priorities and update frequencies
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * Generate sitemap entries for static pages
 */
function getStaticPages(): SitemapEntry[] {
  return [
    {
      loc: `${SITE_URL}/`,
      changefreq: 'daily',
      priority: 1.0
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
      loc: `${SITE_URL}/search`,
      changefreq: 'weekly',
      priority: 0.6
    }
  ]
}

/**
 * Generate XML for a sitemap entry
 */
function generateUrlXml(entry: SitemapEntry): string {
  const parts = [`<url><loc>${entry.loc}</loc>`]

  if (entry.lastmod) {
    parts.push(`<lastmod>${entry.lastmod}</lastmod>`)
  }

  if (entry.changefreq) {
    parts.push(`<changefreq>${entry.changefreq}</changefreq>`)
  }

  if (entry.priority !== undefined) {
    parts.push(`<priority>${entry.priority}</priority>`)
  }

  parts.push('</url>')
  return parts.join('')
}

/**
 * Generate the full sitemap XML
 */
async function generateSitemap(type?: string): Promise<string> {
  const entries: SitemapEntry[] = []

  try {
    if (!type || type === 'main') {
      // Add static pages
      entries.push(...getStaticPages())

      // Add cases (most recent first, higher priority)
      const cases = await prisma.case.findMany({
        where: {
          visibility: 'PUBLIC',
          isArchived: false
        },
        select: {
          slug: true,
          updatedAt: true,
          prominenceScore: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 1000 // Limit to prevent huge sitemaps
      })

      cases.forEach((item, index) => {
        // Calculate priority based on prominence and recency
        const ageDays = (Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
        const recencyBoost = Math.max(0.3, 1 - (ageDays / 365))
        const prominenceBoost = (item.prominenceScore || 50) / 100
        const priority = Math.min(0.9, 0.5 + (recencyBoost * 0.3) + (prominenceBoost * 0.2))

        entries.push({
          loc: `${SITE_URL}/cases/${item.slug}`,
          lastmod: item.updatedAt.toISOString(),
          changefreq: ageDays < 7 ? 'daily' : ageDays < 30 ? 'weekly' : 'monthly',
          priority: Math.round(priority * 10) / 10
        })
      })

      // Add people profiles
      const people = await prisma.person.findMany({
        where: {
          isActive: true
        },
        select: {
          slug: true,
          updatedAt: true,
          influenceScore: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 500
      })

      people.forEach(person => {
        const priority = Math.min(0.8, 0.4 + (person.influenceScore || 0) / 200)
        entries.push({
          loc: `${SITE_URL}/people/${person.slug}`,
          lastmod: person.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: Math.round(priority * 10) / 10
        })
      })

      // Add organizations
      const organizations = await prisma.organization.findMany({
        select: {
          slug: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 500
      })

      organizations.forEach(org => {
        entries.push({
          loc: `${SITE_URL}/organizations/${org.slug}`,
          lastmod: org.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: 0.6
        })
      })
    } else if (type === 'cases') {
      // Dedicated sitemap for cases only
      const cases = await prisma.case.findMany({
        where: {
          visibility: 'PUBLIC'
        },
        select: {
          slug: true,
          updatedAt: true,
          prominenceScore: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      cases.forEach(item => {
        entries.push({
          loc: `${SITE_URL}/cases/${item.slug}`,
          lastmod: item.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: 0.7
        })
      })
    } else if (type === 'people') {
      // Dedicated sitemap for people
      const people = await prisma.person.findMany({
        where: {
          isActive: true
        },
        select: {
          slug: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      people.forEach(person => {
        entries.push({
          loc: `${SITE_URL}/people/${person.slug}`,
          lastmod: person.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: 0.6
        })
      })
    } else if (type === 'organizations') {
      // Dedicated sitemap for organizations
      const orgs = await prisma.organization.findMany({
        select: {
          slug: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      orgs.forEach(org => {
        entries.push({
          loc: `${SITE_URL}/organizations/${org.slug}`,
          lastmod: org.updatedAt.toISOString(),
          changefreq: 'monthly',
          priority: 0.5
        })
      })
    } else if (type === 'news') {
      // Recent content for news sitemap
      const recentCases = await prisma.case.findMany({
        where: {
          visibility: 'PUBLIC',
          caseDate: {
            gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // Last 48 hours
          }
        },
        select: {
          slug: true,
          caseDate: true,
          title: true
        },
        orderBy: {
          caseDate: 'desc'
        }
      })

      recentCases.forEach(item => {
        entries.push({
          loc: `${SITE_URL}/cases/${item.slug}`,
          lastmod: item.caseDate.toISOString(),
          changefreq: 'hourly',
          priority: 0.9
        })
      })
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(generateUrlXml).join('\n')}
</urlset>`

  return xml
}

/**
 * Generate sitemap index for multiple sitemaps
 */
function generateSitemapIndex(): string {
  const sitemaps = [
    'sitemap.xml',
    'sitemap-cases.xml',
    'sitemap-people.xml',
    'sitemap-organizations.xml',
    'sitemap-news.xml'
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${SITE_URL}/${sitemap}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
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
    // Determine sitemap type from URL
    const { type } = req.query

    let xml: string

    if (type === 'index') {
      xml = generateSitemapIndex()
    } else {
      xml = await generateSitemap(type as string)
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600') // Cache for 1 hour

    res.status(200).send(xml)
  } catch (error) {
    console.error('Sitemap error:', error)
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
}