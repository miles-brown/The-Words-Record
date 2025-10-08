/**
 * Case History & Provenance Tracking
 *
 * Implements change history logging from Database & Content Rules Guide v1:
 * - Track all significant modifications
 * - Log timestamp, user ID, and reason
 * - Provide history tab on case pages
 */

import { PrismaClient, CaseHistoryAction } from '@prisma/client'

const prisma = new PrismaClient()

interface LogHistoryParams {
  caseId: string
  actionType: CaseHistoryAction
  actionBy: string
  reason?: string
  previousValue?: string
  newValue?: string
  metadata?: Record<string, any>
}

/**
 * Log a history entry for a case
 */
export async function logCaseHistory(params: LogHistoryParams) {
  return await prisma.caseHistory.create({
    data: {
      caseId: params.caseId,
      actionType: params.actionType,
      actionBy: params.actionBy,
      reason: params.reason,
      previousValue: params.previousValue,
      newValue: params.newValue,
      metadata: params.metadata || {},
    }
  })
}

/**
 * Get complete history for a case
 */
export async function getCaseHistory(caseId: string) {
  return await prisma.caseHistory.findMany({
    where: { caseId },
    orderBy: { actionAt: 'desc' }
  })
}

/**
 * Get recent history across all cases
 */
export async function getRecentCaseHistory(limit: number = 50) {
  return await prisma.caseHistory.findMany({
    include: {
      case: {
        select: {
          id: true,
          slug: true,
          title: true
        }
      }
    },
    orderBy: { actionAt: 'desc' },
    take: limit
  })
}

/**
 * Log case creation
 */
export async function logCaseCreation(
  caseId: string,
  createdBy: string,
  wasPromotedFromStatement: boolean = false,
  originatingStatementId?: string
) {
  return await logCaseHistory({
    caseId,
    actionType: wasPromotedFromStatement
      ? CaseHistoryAction.PROMOTED_FROM_STATEMENT
      : CaseHistoryAction.CREATED,
    actionBy: createdBy,
    reason: wasPromotedFromStatement
      ? `Promoted from statement ${originatingStatementId}`
      : 'Case created',
    metadata: originatingStatementId ? { originatingStatementId } : {}
  })
}

/**
 * Log statement linking to case
 */
export async function logStatementLinked(
  caseId: string,
  statementId: string,
  linkedBy: string,
  reason?: string
) {
  return await logCaseHistory({
    caseId,
    actionType: CaseHistoryAction.STATEMENT_LINKED,
    actionBy: linkedBy,
    reason: reason || 'Statement linked to case',
    newValue: statementId,
    metadata: { statementId }
  })
}

/**
 * Log status change
 */
export async function logStatusChange(
  caseId: string,
  previousStatus: string,
  newStatus: string,
  changedBy: string,
  reason?: string
) {
  return await logCaseHistory({
    caseId,
    actionType: CaseHistoryAction.STATUS_CHANGED,
    actionBy: changedBy,
    reason: reason || 'Status updated',
    previousValue: previousStatus,
    newValue: newStatus
  })
}

/**
 * Log visibility change
 */
export async function logVisibilityChange(
  caseId: string,
  previousVisibility: string,
  newVisibility: string,
  changedBy: string,
  reason?: string
) {
  return await logCaseHistory({
    caseId,
    actionType: CaseHistoryAction.VISIBILITY_CHANGED,
    actionBy: changedBy,
    reason: reason || 'Visibility updated',
    previousValue: previousVisibility,
    newValue: newVisibility
  })
}

/**
 * Log archive action
 */
export async function logArchive(
  caseId: string,
  archivedBy: string,
  reason: string
) {
  return await logCaseHistory({
    caseId,
    actionType: CaseHistoryAction.ARCHIVED,
    actionBy: archivedBy,
    reason
  })
}

/**
 * Log unarchive action
 */
export async function logUnarchive(
  caseId: string,
  unarchivedBy: string,
  reason?: string
) {
  return await logCaseHistory({
    caseId,
    actionType: CaseHistoryAction.UNARCHIVED,
    actionBy: unarchivedBy,
    reason: reason || 'Case unarchived'
  })
}

/**
 * Log lock action
 */
export async function logLock(
  caseId: string,
  lockedBy: string,
  reason: string
) {
  return await logCaseHistory({
    caseId,
    actionType: CaseHistoryAction.LOCKED,
    actionBy: lockedBy,
    reason
  })
}

/**
 * Log feature action
 */
export async function logFeature(
  caseId: string,
  featuredBy: string,
  reason?: string
) {
  return await logCaseHistory({
    caseId,
    actionType: CaseHistoryAction.FEATURED,
    actionBy: featuredBy,
    reason: reason || 'Case featured on homepage'
  })
}

/**
 * Log person/organization/tag changes
 */
export async function logEntityChange(
  caseId: string,
  actionType: CaseHistoryAction,
  changedBy: string,
  entityType: 'person' | 'organization' | 'tag',
  entityId: string,
  entityName: string
) {
  return await logCaseHistory({
    caseId,
    actionType,
    actionBy: changedBy,
    reason: `${entityType} ${entityName} ${actionType.includes('ADDED') ? 'added' : 'removed'}`,
    newValue: actionType.includes('ADDED') ? entityId : undefined,
    previousValue: actionType.includes('REMOVED') ? entityId : undefined,
    metadata: {
      entityType,
      entityId,
      entityName
    }
  })
}

/**
 * Format history entry for display
 */
export function formatHistoryEntry(entry: any): string {
  const date = new Date(entry.actionAt).toLocaleString()
  const action = entry.actionType.replace(/_/g, ' ').toLowerCase()

  let message = `[${date}] ${entry.actionBy} ${action}`

  if (entry.reason) {
    message += `: ${entry.reason}`
  }

  if (entry.previousValue && entry.newValue) {
    message += ` (${entry.previousValue} → ${entry.newValue})`
  }

  return message
}
