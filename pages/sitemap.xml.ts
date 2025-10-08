import { GetServerSideProps } from 'next'
import prisma from '@/lib/prisma'

function generateSiteMap(
  incidents: Array<{ slug: string; updatedAt: Date }>,
  persons: Array<{ slug: string; updatedAt: Date }>,
  organizations: Array<{ slug: string; updatedAt: Date }>
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${baseUrl}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${baseUrl}/incidents</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${baseUrl}/people</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${baseUrl}/organizations</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${baseUrl}/about</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.7</priority>
     </url>
     <url>
       <loc>${baseUrl}/methodology</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <priority>0.7</priority>
     </url>
     ${incidents
       .map((incident) => {
         return `
       <url>
           <loc>${baseUrl}/incidents/${incident.slug}</loc>
           <lastmod>${incident.updatedAt.toISOString()}</lastmod>
           <priority>0.8</priority>
       </url>
     `
       })
       .join('')}
     ${persons
       .map((person) => {
         return `
       <url>
           <loc>${baseUrl}/people/${person.slug}</loc>
           <lastmod>${person.updatedAt.toISOString()}</lastmod>
           <priority>0.7</priority>
       </url>
     `
       })
       .join('')}
     ${organizations
       .map((org) => {
         return `
       <url>
           <loc>${baseUrl}/organizations/${org.slug}</loc>
           <lastmod>${org.updatedAt.toISOString()}</lastmod>
           <priority>0.6</priority>
       </url>
     `
       })
       .join('')}
   </urlset>
 `
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Fetch all cases, persons, and organizations
  const cases = await prisma.case.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  })

  const persons = await prisma.person.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  })

  const organizations = await prisma.organization.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  })

  const sitemap = generateSiteMap(cases, persons, organizations)

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate')
  res.write(sitemap)
  res.end()

  return {
    props: {}
  }
}

export default function SiteMap() {
  // getServerSideProps will do all the work
  return null
}
