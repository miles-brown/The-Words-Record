/**
 * Global Search API Endpoint
 * Searches across all entities in the admin dashboard
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verify } from 'jsonwebtoken'
import cookie from 'cookie'

const prisma = new PrismaClient()

interface SearchResult {
  id: string
  type: 'case' | 'person' | 'organization' | 'statement' | 'source' | 'user'
  title: string
  description?: string
  url: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse cookies and verify JWT
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.authToken

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Verify the JWT token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key')
    if (!decoded || typeof decoded === 'string') {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get search query
    const query = req.query.q as string
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query too short' })
    }

    const searchTerm = `%${query.toLowerCase()}%`
    const results: SearchResult[] = []

    // Search Cases
    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })

    cases.forEach(c => {
      results.push({
        id: c.id,
        type: 'case',
        title: c.title,
        description: c.summary || undefined,
        url: `/admin/cases/${c.slug}`
      })
    })

    // Search People
    const people = await prisma.person.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })

    people.forEach(p => {
      results.push({
        id: p.id,
        type: 'person',
        title: p.fullName || 'Unnamed Person',
        description: p.bio || undefined,
        url: `/admin/people/${p.slug}`
      })
    })

    // Search Organizations
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })

    organizations.forEach(o => {
      results.push({
        id: o.id,
        type: 'organization',
        title: o.name,
        description: o.description || undefined,
        url: `/admin/organizations/${o.slug}`
      })
    })

    // Search Statements
    const statements = await prisma.statement.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { context: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        person: true,
        organization: true
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })

    statements.forEach(s => {
      const speaker = s.person?.fullName || s.organization?.name || 'Unknown'
      results.push({
        id: s.id,
        type: 'statement',
        title: `${speaker}: ${s.content.substring(0, 100)}${s.content.length > 100 ? '...' : ''}`,
        description: s.context || undefined,
        url: `/admin/statements?id=${s.id}`
      })
    })

    // Search Sources
    const sources = await prisma.source.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { url: { contains: query, mode: 'insensitive' } },
          { sourceType: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })

    sources.forEach(s => {
      results.push({
        id: s.id,
        type: 'source',
        title: s.title,
        description: s.sourceType,
        url: `/admin/sources/${s.id}`
      })
    })

    // Search Users (if admin has permission)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })

    users.forEach(u => {
      results.push({
        id: u.id,
        type: 'user',
        title: u.username,
        description: u.email,
        url: `/admin/users/${u.id}`
      })
    })

    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(query.toLowerCase())
      const bExact = b.title.toLowerCase().startsWith(query.toLowerCase())
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return 0
    })

    res.status(200).json({
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length
    })

  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}