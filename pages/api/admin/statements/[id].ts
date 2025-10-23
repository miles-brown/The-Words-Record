import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth-middleware'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const authResult = await verifyAuth(req)
  if (!authResult.authenticated || !authResult.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid statement ID' })
  }

  switch (req.method) {
    case 'GET':
      return getStatement(id, res)
    case 'PATCH':
      return updateStatement(id, req.body, authResult.user.id, res)
    case 'DELETE':
      return deleteStatement(id, res)
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}

/**
 * GET /api/admin/statements/[id]
 * Retrieve a single statement with all related data
 */
async function getStatement(id: string, res: NextApiResponse) {
  try {
    const statement = await prisma.statement.findUnique({
      where: { id },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            slug: true,
            fullName: true,
            firstName: true,
            lastName: true,
            profession: true,
            imageUrl: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            organizationType: true
          }
        },
        case: {
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            caseDate: true
          }
        },
        primarySource: {
          select: {
            id: true,
            title: true,
            url: true,
            publication: true,
            author: true,
            publishDate: true,
            verificationStatus: true
          }
        },
        sources: {
          select: {
            id: true,
            title: true,
            url: true,
            publication: true,
            verificationStatus: true
          },
          take: 10
        },
        respondsTo: {
          select: {
            id: true,
            content: true,
            person: {
              select: {
                fullName: true,
                name: true
              }
            },
            organization: {
              select: {
                name: true
              }
            }
          }
        },
        responses: {
          select: {
            id: true,
            content: true,
            statementDate: true,
            person: {
              select: {
                fullName: true,
                name: true
              }
            }
          },
          orderBy: {
            statementDate: 'desc'
          },
          take: 10
        },
        groupAuthors: {
          select: {
            id: true,
            name: true,
            fullName: true,
            slug: true
          }
        },
        groupOrganizations: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        repercussionsCaused: {
          select: {
            id: true,
            type: true,
            description: true,
            severityScore: true
          }
        },
        _count: {
          select: {
            responses: true,
            sources: true,
            repercussionsCaused: true,
            repercussionsAbout: true
          }
        }
      }
    })

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' })
    }

    return res.status(200).json({ statement })
  } catch (error) {
    console.error('Error fetching statement:', error)
    return res.status(500).json({ error: 'Failed to fetch statement' })
  }
}

/**
 * PATCH /api/admin/statements/[id]
 * Update a statement
 */
async function updateStatement(id: string, data: any, userId: string, res: NextApiResponse) {
  try {
    // Build update data object with only provided fields
    const updateData: any = {
      lastEditedBy: userId,
      updatedAt: new Date()
    }

    // Core fields
    if (data.content !== undefined) updateData.content = data.content
    if (data.context !== undefined) updateData.context = data.context
    if (data.summary !== undefined) updateData.summary = data.summary
    if (data.statementDate !== undefined) updateData.statementDate = new Date(data.statementDate)
    if (data.statementTime !== undefined) updateData.statementTime = data.statementTime
    if (data.statementType !== undefined) updateData.statementType = data.statementType
    if (data.responseType !== undefined) updateData.responseType = data.responseType

    // Relationships
    if (data.personId !== undefined) updateData.personId = data.personId || null
    if (data.organizationId !== undefined) updateData.organizationId = data.organizationId || null
    if (data.caseId !== undefined) updateData.caseId = data.caseId || null
    if (data.respondsToId !== undefined) updateData.respondsToId = data.respondsToId || null
    if (data.primarySourceId !== undefined) updateData.primarySourceId = data.primarySourceId || null
    if (data.onBehalfOfOrgId !== undefined) updateData.onBehalfOfOrgId = data.onBehalfOfOrgId || null

    // Platform & Medium
    if (data.platform !== undefined) updateData.platform = data.platform
    if (data.medium !== undefined) updateData.medium = data.medium
    if (data.venue !== undefined) updateData.venue = data.venue
    if (data.event !== undefined) updateData.event = data.event
    if (data.mediumUrl !== undefined) updateData.mediumUrl = data.mediumUrl
    if (data.socialMediaUrl !== undefined) updateData.socialMediaUrl = data.socialMediaUrl
    if (data.socialMediaId !== undefined) updateData.socialMediaId = data.socialMediaId

    // Verification
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified
    if (data.verificationLevel !== undefined) updateData.verificationLevel = data.verificationLevel
    if (data.verificationStatus !== undefined) updateData.verificationStatus = data.verificationStatus
    if (data.verifiedBy !== undefined) updateData.verifiedBy = data.verifiedBy
    if (data.verifiedAt !== undefined) updateData.verifiedAt = data.verifiedAt ? new Date(data.verifiedAt) : null
    if (data.verificationDate !== undefined) updateData.verificationDate = data.verificationDate ? new Date(data.verificationDate) : null

    // Flags & Status
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic
    if (data.isFlagged !== undefined) updateData.isFlagged = data.isFlagged
    if (data.flagReason !== undefined) updateData.flagReason = data.flagReason
    if (data.isRetracted !== undefined) updateData.isRetracted = data.isRetracted
    if (data.retractionDate !== undefined) updateData.retractionDate = data.retractionDate ? new Date(data.retractionDate) : null
    if (data.retractionText !== undefined) updateData.retractionText = data.retractionText
    if (data.isDeleted !== undefined) updateData.isDeleted = data.isDeleted
    if (data.deletedDate !== undefined) updateData.deletedDate = data.deletedDate ? new Date(data.deletedDate) : null
    if (data.isDisputed !== undefined) updateData.isDisputed = data.isDisputed
    if (data.disputeNotes !== undefined) updateData.disputeNotes = data.disputeNotes

    // Engagement metrics
    if (data.likes !== undefined) updateData.likes = data.likes
    if (data.shares !== undefined) updateData.shares = data.shares
    if (data.views !== undefined) updateData.views = data.views
    if (data.responseCount !== undefined) updateData.responseCount = data.responseCount
    if (data.criticismCount !== undefined) updateData.criticismCount = data.criticismCount
    if (data.supportCount !== undefined) updateData.supportCount = data.supportCount
    if (data.mediaOutlets !== undefined) updateData.mediaOutlets = data.mediaOutlets
    if (data.articleCount !== undefined) updateData.articleCount = data.articleCount

    // Repercussions
    if (data.hasRepercussions !== undefined) updateData.hasRepercussions = data.hasRepercussions
    if (data.lostEmployment !== undefined) updateData.lostEmployment = data.lostEmployment
    if (data.lostContracts !== undefined) updateData.lostContracts = data.lostContracts
    if (data.paintedNegatively !== undefined) updateData.paintedNegatively = data.paintedNegatively
    if (data.repercussionDetails !== undefined) updateData.repercussionDetails = data.repercussionDetails
    if (data.responseImpact !== undefined) updateData.responseImpact = data.responseImpact

    // Additional metadata
    if (data.speakerRole !== undefined) updateData.speakerRole = data.speakerRole
    if (data.responseTime !== undefined) updateData.responseTime = data.responseTime
    if (data.responseDepth !== undefined) updateData.responseDepth = data.responseDepth
    if (data.isGroupStatement !== undefined) updateData.isGroupStatement = data.isGroupStatement
    if (data.contentWarning !== undefined) updateData.contentWarning = data.contentWarning
    if (data.category !== undefined) updateData.category = data.category
    if (data.sentiment !== undefined) updateData.sentiment = data.sentiment
    if (data.credibilityScore !== undefined) updateData.credibilityScore = data.credibilityScore

    const statement = await prisma.statement.update({
      where: { id },
      data: updateData,
      include: {
        person: {
          select: {
            fullName: true,
            name: true,
            slug: true
          }
        },
        organization: {
          select: {
            name: true,
            slug: true
          }
        },
        case: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    })

    return res.status(200).json({ statement })
  } catch (error) {
    console.error('Error updating statement:', error)
    return res.status(500).json({ error: 'Failed to update statement' })
  }
}

/**
 * DELETE /api/admin/statements/[id]
 * Delete a statement (soft delete by default)
 */
async function deleteStatement(id: string, res: NextApiResponse) {
  try {
    // Check if statement has responses
    const statement = await prisma.statement.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' })
    }

    if (statement._count.responses > 0) {
      // Soft delete if has responses
      await prisma.statement.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedDate: new Date()
        }
      })

      return res.status(200).json({
        message: 'Statement soft deleted (has responses)',
        softDelete: true
      })
    } else {
      // Hard delete if no responses
      await prisma.statement.delete({
        where: { id }
      })

      return res.status(200).json({
        message: 'Statement deleted',
        softDelete: false
      })
    }
  } catch (error) {
    console.error('Error deleting statement:', error)
    return res.status(500).json({ error: 'Failed to delete statement' })
  }
}
