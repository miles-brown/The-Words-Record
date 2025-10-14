import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole } from '@prisma/client'

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
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    return handleGet(req, res, auth.userId)
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  actorId: string
) {
  try {
    const {
      type = 'all',
      format = 'json',
      includeRelations = 'true',
      startDate,
      endDate
    } = req.query

    const includeRels = includeRelations === 'true'

    // Build date filter if provided
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate as string)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string)
    }

    let data: any = {}

    // Export based on type
    switch (type) {
      case 'cases':
        data.cases = await exportCases(dateFilter, includeRels)
        break
      case 'statements':
        data.statements = await exportStatements(dateFilter, includeRels)
        break
      case 'people':
        data.people = await exportPeople(includeRels)
        break
      case 'organizations':
        data.organizations = await exportOrganizations(includeRels)
        break
      case 'sources':
        data.sources = await exportSources(includeRels)
        break
      case 'all':
        data = await exportAll(dateFilter, includeRels)
        break
      default:
        return res.status(400).json({ error: 'Invalid export type' })
    }

    // Log audit event
    await logAuditEvent({
      action: AuditAction.EXPORT,
      actorType: AuditActorType.USER,
      actorId,
      entityType: 'Export',
      entityId: `export-${type}`,
      details: {
        type,
        format,
        includeRelations: includeRels,
        recordCount: getRecordCount(data)
      }
    })

    // Handle format conversion
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="export-${type}-${Date.now()}.json"`)
      return res.status(200).json(data)
    } else if (format === 'csv') {
      // For CSV, we'll return JSON with a note that CSV conversion happens client-side
      // This is simpler and avoids needing csv-stringify library
      const csvData = convertToCSV(data, type as string)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="export-${type}-${Date.now()}.csv"`)
      return res.status(200).send(csvData)
    } else if (format === 'xlsx') {
      // For XLSX, return JSON with error message since we don't have the library yet
      return res.status(501).json({
        error: 'XLSX export not yet implemented. Please use JSON or CSV format.'
      })
    } else {
      return res.status(400).json({ error: 'Invalid export format. Use json, csv, or xlsx.' })
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    return res.status(500).json({ error: 'Failed to export data' })
  }
}

async function exportCases(dateFilter: any, includeRelations: boolean) {
  const where: any = {}
  if (Object.keys(dateFilter).length > 0) {
    where.caseDate = dateFilter
  }

  return await prisma.case.findMany({
    where,
    include: includeRelations ? {
      statements: true,
      people: true,
      organizations: true,
      sources: true
    } : undefined
  })
}

async function exportStatements(dateFilter: any, includeRelations: boolean) {
  const where: any = {}
  if (Object.keys(dateFilter).length > 0) {
    where.statementDate = dateFilter
  }

  return await prisma.statement.findMany({
    where,
    include: includeRelations ? {
      person: true,
      organization: true,
      case: true,
      respondsTo: true,
      responses: true,
      sources: true
    } : undefined
  })
}

async function exportPeople(includeRelations: boolean) {
  return await prisma.person.findMany({
    include: includeRelations ? {
      statements: true,
      cases: true,
      nationalities: true
    } : undefined
  })
}

async function exportOrganizations(includeRelations: boolean) {
  return await prisma.organization.findMany({
    include: includeRelations ? {
      statements: true,
      cases: true
    } : undefined
  })
}

async function exportSources(includeRelations: boolean) {
  return await prisma.source.findMany({
    include: includeRelations ? {
      statement: true,
      case: true
    } : undefined
  })
}

async function exportAll(dateFilter: any, includeRelations: boolean) {
  return {
    cases: await exportCases(dateFilter, includeRelations),
    statements: await exportStatements(dateFilter, includeRelations),
    people: await exportPeople(includeRelations),
    organizations: await exportOrganizations(includeRelations),
    sources: await exportSources(includeRelations)
  }
}

function getRecordCount(data: any): number {
  if (Array.isArray(data)) {
    return data.length
  }

  let count = 0
  for (const key in data) {
    if (Array.isArray(data[key])) {
      count += data[key].length
    }
  }
  return count
}

function convertToCSV(data: any, type: string): string {
  // Simple CSV conversion for basic data types
  // For complex nested data, we'll flatten it

  let records: any[] = []

  if (type === 'all') {
    // For 'all' type, we can't really do CSV well - return error guidance
    return 'Error: Cannot export all data types to CSV. Please select a specific data type.'
  }

  // Get the array of records
  const dataArray = data[type] || data

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return 'No data to export'
  }

  // Get all unique keys from all records (for cases where fields might vary)
  const allKeys = new Set<string>()
  for (const record of dataArray) {
    Object.keys(record).forEach(key => {
      // Skip complex nested objects/arrays for CSV
      if (typeof record[key] !== 'object' || record[key] === null || record[key] instanceof Date) {
        allKeys.add(key)
      }
    })
  }

  const headers = Array.from(allKeys)

  // Build CSV
  let csv = headers.map(escapeCSVValue).join(',') + '\n'

  for (const record of dataArray) {
    const row = headers.map(header => {
      let value = record[header]

      // Handle dates
      if (value instanceof Date) {
        value = value.toISOString()
      }

      // Handle null/undefined
      if (value === null || value === undefined) {
        value = ''
      }

      // Handle objects/arrays (stringify them)
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }

      return escapeCSVValue(String(value))
    })

    csv += row.join(',') + '\n'
  }

  return csv
}

function escapeCSVValue(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}
