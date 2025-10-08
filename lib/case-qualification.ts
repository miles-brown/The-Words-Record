/**
 * Statement-to-Case Graduation System
 *
 * Implements the qualification criteria from Database & Content Rules Guide v1:
 * - Public Reaction: Statement sparks debate, condemnation, or support
 * - Response: Referenced by 2+ notable people
 * - Media Coverage: Covered in 3+ recognized outlets
 * - Repercussion: Tangible outcome (job loss, legal action, etc.)
 * - Editorial Judgment: Manually promoted
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface QualificationCriteria {
  hasPublicReaction: boolean
  responseCount: number
  mediaOutletCount: number
  hasRepercussion: boolean
  score: number
  meetsThreshold: boolean
  reasons: string[]
}

/**
 * Calculate qualification score for a statement
 * Returns score and whether it meets the threshold to become a case
 */
export async function calculateQualificationScore(
  statementId: string
): Promise<QualificationCriteria> {
  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: {
      responses: true,
      sources: true,
      repercussionsAbout: true,
      repercussionsCaused: true,
    }
  })

  if (!statement) {
    throw new Error('Statement not found')
  }

  const criteria: QualificationCriteria = {
    hasPublicReaction: false,
    responseCount: 0,
    mediaOutletCount: 0,
    hasRepercussion: false,
    score: 0,
    meetsThreshold: false,
    reasons: []
  }

  // Count responses from notable people
  criteria.responseCount = statement.responses?.length || 0
  if (criteria.responseCount >= 2) {
    criteria.score += 25
    criteria.reasons.push(`${criteria.responseCount} responses from notable people`)
  }

  // Count unique media outlets
  const uniqueOutlets = new Set(
    statement.sources?.map(s => s.publication).filter(Boolean)
  )
  criteria.mediaOutletCount = uniqueOutlets.size
  if (criteria.mediaOutletCount >= 3) {
    criteria.score += 30
    criteria.reasons.push(`Covered by ${criteria.mediaOutletCount} media outlets`)
  }

  // Check for repercussions
  const totalRepercussions =
    (statement.repercussionsAbout?.length || 0) +
    (statement.repercussionsCaused?.length || 0)

  if (totalRepercussions > 0) {
    criteria.hasRepercussion = true
    criteria.score += 30
    criteria.reasons.push(`Has ${totalRepercussions} documented repercussion(s)`)
  }

  // Check for public reaction indicators
  // (This is a simplified check - in production, you'd analyze sentiment, engagement, etc.)
  if (statement.views && statement.views > 10000) {
    criteria.hasPublicReaction = true
    criteria.score += 15
    criteria.reasons.push('High public engagement')
  }

  // Check if meets threshold (need 2+ criteria met, score >= 50)
  const criteriaMet =
    (criteria.responseCount >= 2 ? 1 : 0) +
    (criteria.mediaOutletCount >= 3 ? 1 : 0) +
    (criteria.hasRepercussion ? 1 : 0) +
    (criteria.hasPublicReaction ? 1 : 0)

  criteria.meetsThreshold = criteriaMet >= 2 && criteria.score >= 50

  return criteria
}

/**
 * Get all statements that qualify for case promotion
 */
export async function getQualifiedStatements(limit: number = 50) {
  const statements = await prisma.statement.findMany({
    where: {
      statementType: 'ORIGINAL',
      caseId: null, // Not already part of a case
    },
    include: {
      responses: {
        select: { id: true }
      },
      sources: {
        select: { publication: true }
      },
      repercussionsAbout: {
        select: { id: true }
      },
      repercussionsCaused: {
        select: { id: true }
      },
      person: {
        select: { id: true, name: true, slug: true }
      }
    },
    take: limit * 3, // Get more than needed to filter
    orderBy: {
      statementDate: 'desc'
    }
  })

  const qualified: Array<{
    statement: typeof statements[0]
    criteria: QualificationCriteria
  }> = []

  for (const statement of statements) {
    const criteria = await calculateQualificationScore(statement.id)
    if (criteria.meetsThreshold) {
      qualified.push({ statement, criteria })
    }
    if (qualified.length >= limit) break
  }

  return qualified.sort((a, b) => b.criteria.score - a.criteria.score)
}

/**
 * Promote a statement to a case
 */
export async function promoteStatementToCase(
  statementId: string,
  promotedBy: string,
  promotionReason?: string,
  isManualOverride: boolean = false
) {
  const criteria = await calculateQualificationScore(statementId)

  if (!isManualOverride && !criteria.meetsThreshold) {
    throw new Error(
      `Statement does not meet qualification threshold. Score: ${criteria.score}/50. ` +
      `Criteria met: ${criteria.reasons.join(', ')}`
    )
  }

  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: {
      person: true,
      organization: true,
      responses: {
        select: { id: true }
      }
    }
  })

  if (!statement) {
    throw new Error('Statement not found')
  }

  // Create the case
  const newCase = await prisma.case.create({
    data: {
      title: `${statement.person?.name || statement.organization?.name || 'Unknown'}: ${statement.content.substring(0, 100)}...`,
      slug: `case-${Date.now()}-${statementId.substring(0, 8)}`,
      summary: statement.summary || statement.content.substring(0, 200),
      description: statement.context || statement.content,
      caseDate: statement.statementDate,
      originatingStatementId: statementId,
      promotedAt: new Date(),
      promotedBy,
      promotionReason: promotionReason || criteria.reasons.join('; '),
      qualificationScore: criteria.score,
      responseCount: criteria.responseCount,
      mediaOutletCount: criteria.mediaOutletCount,
      hasPublicReaction: criteria.hasPublicReaction,
      hasRepercussion: criteria.hasRepercussion,
      wasManuallyPromoted: isManualOverride,
      persons: statement.personId ? {
        connect: { id: statement.personId }
      } : undefined,
      organizations: statement.organizationId ? {
        connect: { id: statement.organizationId }
      } : undefined,
    }
  })

  // Link the statement to the case
  await prisma.statement.update({
    where: { id: statementId },
    data: { caseId: newCase.id }
  })

  // Link all responses to the case
  if (statement.responses) {
    await prisma.statement.updateMany({
      where: {
        respondsToId: statementId
      },
      data: {
        caseId: newCase.id
      }
    })
  }

  return newCase
}
