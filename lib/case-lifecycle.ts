/**
 * Case Lifecycle & Visibility Management
 *
 * Implements visibility states and lifecycle rules from Database & Content Rules Guide v1
 */

import { PrismaClient, CaseStatus, CaseVisibility } from '@prisma/client'
import { logArchive, logUnarchive, logLock, logFeature } from './case-history'

const prisma = new PrismaClient()

/**
 * Archive a case
 * Archived cases remain visible but with less prominence
 */
export async function archiveCase(
  caseId: string,
  archivedBy: string,
  reason?: string
) {
  const caseData = await prisma.case.update({
    where: { id: caseId },
    data: {
      status: CaseStatus.ARCHIVED,
      isArchived: true,
      archivedAt: new Date(),
      archivedBy,
      archivedReason: reason,
      visibility: CaseVisibility.ARCHIVED,
      isFeatured: false, // Can't be featured when archived
      prominenceScore: 20, // Reduce prominence
    }
  })

  // Log history
  await logArchive(caseId, archivedBy, reason || 'Case archived')

  return caseData
}

/**
 * Lock a case (completely hide from public)
 * Locked cases redirect to 404
 */
export async function lockCase(
  caseId: string,
  lockedBy: string,
  reason: string
) {
  const caseData = await prisma.case.update({
    where: { id: caseId },
    data: {
      visibility: CaseVisibility.LOCKED,
      isFeatured: false,
      internalNotes: `LOCKED by ${lockedBy} on ${new Date().toISOString()}: ${reason}`,
    }
  })

  // Log history
  await logLock(caseId, lockedBy, reason)

  return caseData
}

/**
 * Unarchive a case
 */
export async function unarchiveCase(caseId: string, reviewedBy: string) {
  const caseData = await prisma.case.update({
    where: { id: caseId },
    data: {
      status: CaseStatus.DOCUMENTED,
      isArchived: false,
      visibility: CaseVisibility.PUBLIC,
      prominenceScore: 50, // Reset to default
      lastReviewedAt: new Date(),
      lastReviewedBy: reviewedBy,
    }
  })

  // Log history
  await logUnarchive(caseId, reviewedBy)

  return caseData
}

/**
 * Set case as featured (appears prominently on homepage)
 */
export async function featureCase(caseId: string, featuredBy: string) {
  // Can't feature archived or locked cases
  const existing = await prisma.case.findUnique({
    where: { id: caseId },
    select: { visibility: true, isArchived: true }
  })

  if (existing?.isArchived || existing?.visibility === CaseVisibility.LOCKED) {
    throw new Error('Cannot feature archived or locked cases')
  }

  const caseData = await prisma.case.update({
    where: { id: caseId },
    data: {
      isFeatured: true,
      prominenceScore: 100,
      lastReviewedAt: new Date(),
      lastReviewedBy: featuredBy,
    }
  })

  // Log history
  await logFeature(caseId, featuredBy)

  return caseData
}

/**
 * Remove featured status
 */
export async function unfeatureCase(caseId: string) {
  const caseData = await prisma.case.update({
    where: { id: caseId },
    data: {
      isFeatured: false,
      prominenceScore: 50,
    }
  })

  return caseData
}

/**
 * Get cases for homepage (respecting visibility and prominence)
 */
export async function getFeaturedCases(limit: number = 10) {
  return await prisma.case.findMany({
    where: {
      visibility: CaseVisibility.PUBLIC,
      isFeatured: true,
      isArchived: false,
    },
    include: {
      people: {
        select: { id: true, name: true, slug: true }
      },
      tags: {
        select: { id: true, name: true, slug: true }
      },
      _count: {
        select: {
          statements: true,
          sources: true
        }
      }
    },
    orderBy: [
      { prominenceScore: 'desc' },
      { caseDate: 'desc' }
    ],
    take: limit
  })
}

/**
 * Get public cases with proper filtering
 */
export async function getPublicCases(
  page: number = 1,
  limit: number = 20,
  includeArchived: boolean = false
) {
  const where: any = {
    visibility: {
      in: [CaseVisibility.PUBLIC, ...(includeArchived ? [CaseVisibility.ARCHIVED] : [])]
    }
  }

  if (!includeArchived) {
    where.isArchived = false
  }

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      include: {
        people: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: {
            statements: true,
            sources: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { prominenceScore: 'desc' },
        { caseDate: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.case.count({ where })
  ])

  return {
    cases,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Check if a case should be visible to public
 */
export function isCasePublic(caseData: { visibility: CaseVisibility }) {
  return caseData.visibility === CaseVisibility.PUBLIC ||
         caseData.visibility === CaseVisibility.ARCHIVED
}

/**
 * Check if a case is locked
 */
export function isCaseLocked(caseData: { visibility: CaseVisibility }) {
  return caseData.visibility === CaseVisibility.LOCKED
}
