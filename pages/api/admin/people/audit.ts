import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { generateAuditSummary } from '@/lib/admin/personAudit'

async function requireAdmin(req: NextApiRequest): Promise<{ userId: string } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true }
  })

  if (!user || !user.isActive || user.role !== UserRole.ADMIN) {
    return null
  }

  return { userId: user.id }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { limit, offset, priority, category } = req.query

    // Fetch all people with all fields
    // Note: Prisma includes all scalar fields by default
    const people = await prisma.person.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined
    })

    // Generate audit summary
    const auditSummary = generateAuditSummary(people)

    // Filter by priority if requested
    let filteredIssuesByField = auditSummary.issuesByField
    if (priority) {
      filteredIssuesByField = Object.fromEntries(
        Object.entries(auditSummary.issuesByField).filter(
          ([_, data]) => data.priority === priority
        )
      )
    }

    // Filter by category if requested
    if (category) {
      filteredIssuesByField = Object.fromEntries(
        Object.entries(filteredIssuesByField).filter(
          ([_, data]) => data.category === category
        )
      )
    }

    // Calculate statistics
    const totalIssues = Object.values(auditSummary.issuesByField).reduce(
      (sum, field) => sum + field.total,
      0
    )

    const issuesByPriority = {
      high: auditSummary.highPriorityIssues.length,
      medium: Object.values(auditSummary.issuesByPerson).reduce(
        (sum, person) => sum + person.mediumPriorityIssues,
        0
      ),
      low: Object.values(auditSummary.issuesByPerson).reduce(
        (sum, person) => sum + person.lowPriorityIssues,
        0
      )
    }

    // Add missing fields list to each person
    const issuesByPersonWithFields = Object.fromEntries(
      Object.entries(auditSummary.issuesByPerson).map(([id, person]) => [
        id,
        {
          ...person,
          missingFields: person.issues
            .filter((issue: any) => issue.issueType === 'missing' || issue.issueType === 'placeholder')
            .map((issue: any) => issue.field)
        }
      ])
    )

    const response = {
      summary: {
        totalPeople: auditSummary.totalPeople,
        peopleWithIssues: auditSummary.peopleWithIssues,
        peopleComplete: auditSummary.totalPeople - auditSummary.peopleWithIssues,
        completenessPercentage: auditSummary.completenessPercentage,
        totalIssues,
        issuesByPriority,
        generatedAt: new Date().toISOString()
      },
      issuesByField: filteredIssuesByField,
      issuesByPerson: issuesByPersonWithFields,
      highPriorityIssues: auditSummary.highPriorityIssues
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'private, max-age=300')

    return res.status(200).json(response)
  } catch (error) {
    console.error('Error generating audit:', error)
    return res.status(500).json({ error: 'Failed to generate audit report' })
  }
}
