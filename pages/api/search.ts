// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

interface SearchResult {
  type: 'person' | 'incident' | 'organization'
  id: string
  title: string
  slug: string
  description: string
  relevanceScore: number
  metadata: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const query = (req.query.q as string)?.trim()
    const type = req.query.type as string
    const limit = parseInt(req.query.limit as string) || 20

    if (!query || query.length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      })
    }

    const searchResults: SearchResult[] = []

    // Search persons
    if (!type || type === 'persons') {
      const persons = await prisma.person.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { bio: { contains: query } },
            { profession: { contains: query } },
            { nationality: { contains: query } }
          ]
        },
        include: {
          _count: {
            select: {
              cases: true,
              statements: true
            }
          }
        },
        take: limit
      })

      persons.forEach(person => {
        let score = 0
        if (person.name.toLowerCase().includes(query.toLowerCase())) score += 10
        if (person.bio?.toLowerCase().includes(query.toLowerCase())) score += 5
        if (person.profession?.toLowerCase().includes(query.toLowerCase())) score += 3
        if (person.nationality?.toLowerCase().includes(query.toLowerCase())) score += 2

        searchResults.push({
          type: 'person',
          id: person.id,
          title: person.name,
          slug: person.slug,
          description: person.bio || `${person.profession || 'Individual'} with ${person._count.incidents} documented incidents`,
          relevanceScore: score,
          metadata: {
            profession: person.profession,
            nationality: person.nationality,
            incidentCount: person._count.incidents,
            statementCount: person._count.statements
          }
        })
      })
    }

    // Search incidents
    if (!type || type === 'incidents') {
      const incidents = await prisma.case.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { summary: { contains: query } },
            { description: { contains: query } },
            { locationCity: { contains: query } },
            { locationState: { contains: query } },
            { locationCountry: { contains: query } },
            { locationDetail: { contains: query } }
          ]
        },
        include: {
          persons: true,
          tags: true,
          _count: {
            select: {
              statements: true,
              sources: true
            }
          }
        },
        take: limit
      })

      incidents.forEach(incident => {
        let score = 0
        if (incident.title.toLowerCase().includes(query.toLowerCase())) score += 10
        if (incident.summary.toLowerCase().includes(query.toLowerCase())) score += 7
        if (incident.description.toLowerCase().includes(query.toLowerCase())) score += 5
        if (incident.locationCity?.toLowerCase().includes(query.toLowerCase())) score += 3
        if (incident.locationState?.toLowerCase().includes(query.toLowerCase())) score += 2
        if (incident.locationCountry?.toLowerCase().includes(query.toLowerCase())) score += 2

        const locationStr = [incident.locationCity, incident.locationState, incident.locationCountry]
          .filter(Boolean)
          .join(', ')

        searchResults.push({
          type: 'incident',
          id: incident.id,
          title: incident.title,
          slug: incident.slug,
          description: incident.summary,
          relevanceScore: score,
          metadata: {
            status: incident.status,
            severity: incident.severity,
            caseDate: incident.caseDate,
            location: locationStr || incident.locationDetail,
            persons: incident.persons.map(p => p.name),
            tags: incident.tags.map(t => t.name),
            statementCount: incident._count.statements,
            sourceCount: incident._count.sources
          }
        })
      })
    }

    // Search organizations
    if (!type || type === 'organizations') {
      const organizations = await prisma.organization.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { type: { contains: query } },
            { headquarters: { contains: query } }
          ]
        },
        include: {
          _count: {
            select: {
              cases: true,
              statements: true
            }
          },
          statements: {
            where: { statementType: 'RESPONSE' },
            select: { id: true }
          }
        },
        take: limit
      })

      organizations.forEach(org => {
        let score = 0
        if (org.name.toLowerCase().includes(query.toLowerCase())) score += 10
        if (org.description?.toLowerCase().includes(query.toLowerCase())) score += 5
        if (org.type.toLowerCase().includes(query.toLowerCase())) score += 3
        if (org.headquarters?.toLowerCase().includes(query.toLowerCase())) score += 2

        const responseCount = org.statements?.length || 0

        searchResults.push({
          type: 'organization',
          id: org.id,
          title: org.name,
          slug: org.slug,
          description: org.description || `${org.type} organization with ${org._count.incidents} related incidents`,
          relevanceScore: score,
          metadata: {
            type: org.type,
            headquarters: org.headquarters,
            founded: org.founded,
            website: org.website,
            incidentCount: org._count.incidents,
            responseCount: responseCount
          }
        })
      })
    }

    // Sort by relevance score
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Limit total results
    const limitedResults = searchResults.slice(0, limit)

    res.status(200).json({
      query,
      totalResults: limitedResults.length,
      results: limitedResults,
      summary: {
        persons: limitedResults.filter(r => r.type === 'person').length,
        cases: limitedResults.filter(r => r.type === 'incident').length,
        organizations: limitedResults.filter(r => r.type === 'organization').length
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    res.status(500).json({ error: 'Internal server error during search' })
  }
}