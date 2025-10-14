import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole } from '@prisma/client'
import formidable from 'formidable'
import fs from 'fs/promises'
import { parse as parseCSV } from 'csv-parse/sync'

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
}

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

/**
 * Bulk Import API
 *
 * POST /api/admin/bulk/import
 *
 * Supports:
 * - Content-Type: multipart/form-data (CSV/JSON file upload)
 * - Content-Type: application/json (direct JSON import)
 *
 * Form fields (for file upload):
 * - file: CSV or JSON file
 * - entityType: 'person' | 'organization' | 'tag' | 'source'
 * - options: { skipDuplicates?: boolean, updateExisting?: boolean }
 *
 * JSON body (for direct import):
 * {
 *   entityType: 'person' | 'organization' | 'tag' | 'source'
 *   data: Array<Record<string, any>>
 *   options?: { skipDuplicates?: boolean, updateExisting?: boolean }
 * }
 *
 * Response:
 * {
 *   success: true
 *   imported: number
 *   skipped: number
 *   failed: number
 *   errors?: Array<{ row: number, error: string, data?: any }>
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const contentType = req.headers['content-type'] || ''

    let entityType: string
    let data: any[]
    let options: { skipDuplicates?: boolean; updateExisting?: boolean } = {}

    // Handle file upload
    if (contentType.includes('multipart/form-data')) {
      const form = formidable({ maxFileSize: 50 * 1024 * 1024 }) // 50MB max
      const [fields, files] = await form.parse(req)

      entityType = fields.entityType?.[0] || ''

      if (fields.options?.[0]) {
        try {
          options = JSON.parse(fields.options[0])
        } catch (e) {
          // Ignore parse errors
        }
      }

      const file = files.file?.[0]
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      // Read file content
      const fileContent = await fs.readFile(file.filepath, 'utf-8')

      // Parse based on file extension
      if (file.originalFilename?.endsWith('.csv')) {
        data = parseCSV(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        })
      } else if (file.originalFilename?.endsWith('.json')) {
        data = JSON.parse(fileContent)
        if (!Array.isArray(data)) {
          return res.status(400).json({ error: 'JSON file must contain an array' })
        }
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Use .csv or .json' })
      }

      // Clean up temp file
      await fs.unlink(file.filepath).catch(() => {})
    }
    // Handle JSON body
    else if (contentType.includes('application/json')) {
      const body = req.body
      entityType = body.entityType
      data = body.data
      options = body.options || {}

      if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Data must be an array' })
      }
    } else {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data or application/json' })
    }

    // Validate entity type
    const validTypes = ['person', 'organization', 'tag', 'source']
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({
        error: `Invalid entity type. Must be one of: ${validTypes.join(', ')}`
      })
    }

    if (data.length === 0) {
      return res.status(400).json({ error: 'No data to import' })
    }

    if (data.length > 10000) {
      return res.status(400).json({ error: 'Maximum 10,000 items per import operation' })
    }

    // Perform import
    const result = await performImport(
      entityType,
      data,
      options,
      auth.userId
    )

    // Log bulk operation
    await logAuditEvent({
      action: AuditAction.CREATE,
      actorType: AuditActorType.USER,
      actorId: auth.userId,
      entityType: 'BulkImport',
      entityId: `bulk-import-${Date.now()}`,
      details: {
        entityType,
        totalRecords: data.length,
        imported: result.imported,
        skipped: result.skipped,
        failed: result.failed,
        options
      }
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('Bulk import error:', error)
    return res.status(500).json({
      error: 'Failed to perform bulk import',
      details: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : undefined
    })
  }
}

async function performImport(
  entityType: string,
  data: any[],
  options: { skipDuplicates?: boolean; updateExisting?: boolean },
  userId: string
) {
  let imported = 0
  let skipped = 0
  let failed = 0
  const errors: Array<{ row: number; error: string; data?: any }> = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNumber = i + 1

    try {
      switch (entityType) {
        case 'person': {
          const personData = mapPersonData(row)

          // Check for duplicates
          if (options.skipDuplicates || options.updateExisting) {
            const existing = await prisma.person.findUnique({
              where: { slug: personData.slug }
            })

            if (existing) {
              if (options.skipDuplicates) {
                skipped++
                continue
              } else if (options.updateExisting) {
                await prisma.person.update({
                  where: { id: existing.id },
                  data: personData
                })
                imported++
                continue
              }
            }
          }

          await prisma.person.create({ data: personData })
          imported++
          break
        }

        case 'organization': {
          const orgData = mapOrganizationData(row)

          if (options.skipDuplicates || options.updateExisting) {
            const existing = await prisma.organization.findUnique({
              where: { slug: orgData.slug }
            })

            if (existing) {
              if (options.skipDuplicates) {
                skipped++
                continue
              } else if (options.updateExisting) {
                await prisma.organization.update({
                  where: { id: existing.id },
                  data: orgData
                })
                imported++
                continue
              }
            }
          }

          await prisma.organization.create({ data: orgData })
          imported++
          break
        }

        case 'tag': {
          const tagData = mapTagData(row)

          if (options.skipDuplicates || options.updateExisting) {
            const existing = await prisma.tag.findUnique({
              where: { slug: tagData.slug }
            })

            if (existing) {
              if (options.skipDuplicates) {
                skipped++
                continue
              } else if (options.updateExisting) {
                await prisma.tag.update({
                  where: { id: existing.id },
                  data: tagData
                })
                imported++
                continue
              }
            }
          }

          await prisma.tag.create({ data: tagData })
          imported++
          break
        }

        case 'source': {
          const sourceData = mapSourceData(row)

          // Sources don't have unique constraints, always create
          await prisma.source.create({ data: sourceData })
          imported++
          break
        }
      }

      // Log individual import
      await logAuditEvent({
        action: AuditAction.CREATE,
        actorType: AuditActorType.USER,
        actorId: userId,
        entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
        entityId: `imported-row-${rowNumber}`,
        details: {
          bulkImport: true,
          rowNumber,
          data: row
        }
      })
    } catch (error) {
      failed++
      errors.push({
        row: rowNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: row
      })
    }
  }

  return {
    success: true,
    imported,
    skipped,
    failed,
    total: data.length,
    errors: errors.length > 0 ? errors.slice(0, 100) : undefined // Limit error list to 100
  }
}

function mapPersonData(row: any) {
  return {
    slug: row.slug || generateSlug(row.name),
    name: row.name,
    bio: row.bio || null,
    imageUrl: row.imageUrl || row.image_url || null,
    profession: row.profession || 'OTHER',
    professionDetail: row.professionDetail || row.profession_detail || null,
    nationality: row.nationality || null,
    birthDate: row.birthDate ? new Date(row.birthDate) : null,
    background: row.background || null,
    racialGroup: row.racialGroup || row.racial_group || null,
    religion: row.religion || null,
    bestKnownFor: row.bestKnownFor || row.best_known_for || null
  }
}

function mapOrganizationData(row: any) {
  return {
    slug: row.slug || generateSlug(row.name),
    name: row.name,
    type: row.type || row.orgType || row.org_type || 'OTHER',
    description: row.description || null,
    website: row.website || row.websiteUrl || row.website_url || null,
    founded: row.founded || row.foundedDate ? new Date(row.founded || row.foundedDate) : null,
    headquarters: row.headquarters || row.locationCity || row.location_city || null
  }
}

function mapTagData(row: any) {
  return {
    slug: row.slug || generateSlug(row.name),
    name: row.name,
    category: row.category || 'OTHER',
    description: row.description || null,
    color: row.color || null,
    icon: row.icon || null,
    isControversial: row.isControversial === 'true' || row.isControversial === true || false
  }
}

function mapSourceData(row: any) {
  // Sources require either caseId or statementId
  if (!row.caseId && !row.statementId) {
    throw new Error('Source must have either caseId or statementId')
  }

  return {
    url: row.url,
    title: row.title || null,
    publication: row.publication || null,
    author: row.author || null,
    publishedDate: row.publishedDate ? new Date(row.publishedDate) : null,
    caseId: row.caseId || null,
    statementId: row.statementId || null,
    isArchived: row.isArchived === 'true' || row.isArchived === true || false
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}
