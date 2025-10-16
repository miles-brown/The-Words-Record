import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { batchValidatePersons, getRecentChangesStats } from '@/lib/admin/changeTracking'

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
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' })
  }

  try {
    const { sample = '50', includeChanges = 'true' } = req.query
    const sampleSize = Math.min(parseInt(sample as string, 10), 500) // Max 500 records

    // Get random sample of people for validation
    const allPeople = await prisma.person.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true },
      orderBy: { updatedAt: 'desc' },
      take: sampleSize
    })

    const personIds = allPeople.map(p => p.id)

    // Validate referential integrity for the sample
    const validationResults = await batchValidatePersons(personIds)

    // Get recent changes statistics if requested
    let recentChanges = null
    if (includeChanges === 'true') {
      recentChanges = await getRecentChangesStats(7) // Last 7 days
    }

    // Check for data consistency between database and expected values
    const inconsistencies: any[] = []

    for (const person of allPeople.slice(0, 10)) { // Deep check first 10
      const fullPerson = await prisma.person.findUnique({
        where: { id: person.id }
      })

      if (!fullPerson) continue

      // Check for required field consistency
      if (!fullPerson.firstName || !fullPerson.lastName) {
        inconsistencies.push({
          personId: person.id,
          personSlug: person.slug,
          issue: 'Missing required fields (firstName or lastName)'
        })
      }

      // Check slug format
      if (fullPerson.slug.includes(' ') || fullPerson.slug.includes('_')) {
        inconsistencies.push({
          personId: person.id,
          personSlug: person.slug,
          issue: 'Invalid slug format (contains spaces or underscores)'
        })
      }

      // Check name consistency
      const expectedName = `${fullPerson.firstName} ${fullPerson.lastName}`
      if (fullPerson.name && fullPerson.name !== expectedName && !fullPerson.middleName) {
        inconsistencies.push({
          personId: person.id,
          personSlug: person.slug,
          issue: `Name mismatch: expected "${expectedName}", got "${fullPerson.name}"`
        })
      }
    }

    // Compile summary
    const summary = {
      validationTimestamp: new Date().toISOString(),
      totalPeopleInDatabase: await prisma.person.count(),
      sampleSize: allPeople.length,
      referentialIntegrity: {
        recordsChecked: validationResults.totalChecked,
        validRecords: validationResults.validRecords,
        invalidRecords: validationResults.invalidRecords,
        validityPercentage: Math.round((validationResults.validRecords / validationResults.totalChecked) * 100),
        issues: validationResults.issuesByPerson
      },
      dataConsistency: {
        recordsDeepChecked: 10,
        inconsistenciesFound: inconsistencies.length,
        details: inconsistencies
      },
      recentActivity: recentChanges,
      status: validationResults.invalidRecords === 0 && inconsistencies.length === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION',
      recommendations: generateRecommendations(validationResults, inconsistencies)
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'private, max-age=300')

    return res.status(200).json(summary)
  } catch (error) {
    console.error('Error validating people sync:', error)
    return res.status(500).json({ error: 'Failed to validate synchronization' })
  }
}

function generateRecommendations(
  validationResults: any,
  inconsistencies: any[]
): string[] {
  const recommendations: string[] = []

  if (validationResults.invalidRecords > 0) {
    recommendations.push(
      `Fix ${validationResults.invalidRecords} record(s) with broken referential links`
    )
  }

  if (inconsistencies.length > 0) {
    recommendations.push(
      `Review ${inconsistencies.length} record(s) with data consistency issues`
    )
  }

  if (validationResults.invalidRecords === 0 && inconsistencies.length === 0) {
    recommendations.push('All systems operational - no action required')
  } else {
    recommendations.push('Run validation regularly to maintain data quality')
    recommendations.push('Check the audit log for recent changes that may have caused issues')
  }

  return recommendations
}
