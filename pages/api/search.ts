import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

interface SearchResult {
  type: 'person' | 'case' | 'organization'
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

    // Search people
    if (!type || type === 'people') {
      const people = await prisma.person.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { bio: { contains: query } },
            { professionDetail: { contains: query } },
            { nationalityDetail: { contains: query } },
            { bestKnownFor: { contains: query } }
          ]
        },
        select: {
          id: true,
          slug: true,
          name: true,
          bio: true,
          profession: true,
          professionDetail: true,
          nationality: true,
          nationalityDetail: true,
          statementCount: true,
          caseCount: true
        },
        take: limit
      })

      people.forEach(person => {
        let score = 0
        if (person.name.toLowerCase().includes(query.toLowerCase())) score += 10
        if (person.bio?.toLowerCase().includes(query.toLowerCase())) score += 5
        if (person.professionDetail?.toLowerCase().includes(query.toLowerCase())) score += 3
        if (person.nationalityDetail?.toLowerCase().includes(query.toLowerCase())) score += 2

        searchResults.push({
          type: 'person',
          id: person.id,
          title: person.name,
          slug: person.slug,
          description: person.bio || `${person.professionDetail || person.profession} with ${person.caseCount} documented cases`,
          relevanceScore: score,
          metadata: {
            profession: person.professionDetail || person.profession,
            nationality: person.nationalityDetail || person.nationality,
            caseCount: person.caseCount,
            statementCount: person.statementCount
          }
        })
      })
    }

    // Search cases
    if (!type || type === 'cases') {
      const cases = await prisma.case.findMany({
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
          people: true,
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

      cases.forEach(caseItem => {
        let score = 0
        if (caseItem.title.toLowerCase().includes(query.toLowerCase())) score += 10
        if (caseItem.summary.toLowerCase().includes(query.toLowerCase())) score += 7
        if (caseItem.description.toLowerCase().includes(query.toLowerCase())) score += 5
        if (caseItem.locationCity?.toLowerCase().includes(query.toLowerCase())) score += 3
        if (caseItem.locationState?.toLowerCase().includes(query.toLowerCase())) score += 2
        if (caseItem.locationCountry?.toLowerCase().includes(query.toLowerCase())) score += 2

        const locationStr = [caseItem.locationCity, caseItem.locationState, caseItem.locationCountry]
          .filter(Boolean)
          .join(', ')

        searchResults.push({
          type: 'case',
          id: caseItem.id,
          title: caseItem.title,
          slug: caseItem.slug,
          description: caseItem.summary,
          relevanceScore: score,
          metadata: {
            status: caseItem.status,
            severity: caseItem.severity,
            caseDate: caseItem.caseDate,
            location: locationStr || caseItem.locationDetail,
            people: caseItem.people.map(p => p.name),
            tags: caseItem.tags.map(t => t.name),
            statementCount: caseItem._count.statements,
            sourceCount: caseItem._count.sources
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
            { legalName: { contains: query } },
            { headquarters: { contains: query } }
          ]
        },
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          description: true,
          headquarters: true,
          founded: true,
          website: true,
          statementCount: true,
          caseCount: true
        },
        take: limit
      })

      organizations.forEach(org => {
        let score = 0
        if (org.name.toLowerCase().includes(query.toLowerCase())) score += 10
        if (org.description?.toLowerCase().includes(query.toLowerCase())) score += 5
        if (org.headquarters?.toLowerCase().includes(query.toLowerCase())) score += 2

        searchResults.push({
          type: 'organization',
          id: org.id,
          title: org.name,
          slug: org.slug,
          description: org.description || `${org.type} organization with ${org.caseCount} related cases`,
          relevanceScore: score,
          metadata: {
            type: org.type,
            headquarters: org.headquarters,
            founded: org.founded,
            website: org.website,
            caseCount: org.caseCount,
            statementCount: org.statementCount
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
        people: limitedResults.filter(r => r.type === 'person').length,
        cases: limitedResults.filter(r => r.type === 'case').length,
        organizations: limitedResults.filter(r => r.type === 'organization').length
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    res.status(500).json({ error: 'Internal server error during search' })
  }
}