import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { enrichCase, testConnection, type CaseEnrichmentInput } from '@/lib/claude-api'
import { enrichedCaseSearch } from '@/lib/tavily-search'

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

interface EnrichmentRequest {
  caseId?: string
  slug?: string
  force?: boolean
  webSearch?: boolean
}

/**
 * Case Enrichment API
 *
 * POST /api/admin/cases/enrich
 * Triggers AI-powered enrichment for a case using Claude API
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
    const { caseId, slug, force = false, webSearch = false }: EnrichmentRequest = req.body

    if (!caseId && !slug) {
      return res.status(400).json({
        error: 'Either caseId or slug is required'
      })
    }

    // Find the case
    const whereClause = caseId ? { id: caseId } : { slug: slug! }
    const caseRecord = await prisma.case.findUnique({
      where: whereClause,
      include: {
        originatingStatement: {
          include: {
            person: true,
            organization: true,
            sources: true,
            responses: {
              include: {
                person: true,
                organization: true
              },
              orderBy: {
                statementDate: 'asc'
              }
            },
            repercussionsCaused: {
              orderBy: {
                startDate: 'asc'
              }
            }
          }
        },
        statements: {
          include: {
            person: true,
            organization: true,
            sources: true
          },
          orderBy: {
            statementDate: 'asc'
          }
        },
        repercussions: {
          orderBy: {
            startDate: 'asc'
          }
        },
        sources: true
      }
    })

    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found' })
    }

    if (!caseRecord.isRealIncident) {
      return res.status(400).json({
        error: 'Case has not been promoted yet. Only promoted cases can be enriched.'
      })
    }

    const origStatement = caseRecord.originatingStatement
    if (!origStatement) {
      return res.status(400).json({
        error: 'No originating statement found. Cannot enrich case without a principal statement.'
      })
    }

    // Check if already enriched
    const isEnriched = caseRecord.description && caseRecord.description.length > 1000
    if (isEnriched && !force) {
      return res.status(400).json({
        error: 'Case already has comprehensive documentation. Use force=true to re-enrich.',
        currentDescriptionLength: caseRecord.description?.length || 0
      })
    }

    // Test API connection first
    const connectionOk = await testConnection()
    if (!connectionOk) {
      return res.status(500).json({
        error: 'Failed to connect to Claude API. Please check ANTHROPIC_API_KEY configuration.'
      })
    }

    // Gather all related data
    const allResponses = [
      ...(origStatement.responses || []),
      ...caseRecord.statements
        .filter(s => s.respondsToId && s.id !== origStatement.id)
        .map(s => ({
          ...s,
          person: s.person,
          organization: s.organization
        }))
    ]

    const allRepercussions = [
      ...(origStatement.repercussionsCaused || []),
      ...caseRecord.repercussions
    ]

    const allSources = [
      ...(origStatement.sources || []),
      ...caseRecord.statements.flatMap(s => s.sources || []),
      ...caseRecord.sources
    ]

    // Deduplicate sources
    const uniqueSources = Array.from(
      new Map(allSources.map(s => [s.url || s.id, s])).values()
    )

    // Detect original language
    const detectOriginalLanguage = (content: string): string => {
      const hasArabic = /[\u0600-\u06FF]/.test(content)
      const hasHebrew = /[\u0590-\u05FF]/.test(content)
      const hasCyrillic = /[\u0400-\u04FF]/.test(content)
      const hasCJK = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(content)

      if (hasArabic) return 'ar'
      if (hasHebrew) return 'he'
      if (hasCyrillic) return 'ru'
      if (hasCJK) return 'zh'
      return 'en'
    }

    // Build enrichment input
    const enrichmentInput: CaseEnrichmentInput = {
      statement: {
        id: origStatement.id,
        content: origStatement.content,
        context: origStatement.context,
        statementDate: origStatement.statementDate,
        statementTime: origStatement.statementTime,
        platform: origStatement.platform,
        venue: origStatement.venue,
        event: origStatement.event,
        medium: origStatement.medium,
        socialMediaUrl: origStatement.socialMediaUrl,
        originalLanguage: detectOriginalLanguage(origStatement.content)
      },
      person: origStatement.person ? {
        name: origStatement.person.name,
        profession: origStatement.person.professionDetail || origStatement.person.profession,
        nationality: origStatement.person.nationality,
        background: origStatement.person.background
      } : null,
      organization: origStatement.organization ? {
        name: origStatement.organization.name,
        organizationType: origStatement.organization.type
      } : null,
      responses: allResponses.map(r => ({
        content: r.content,
        statementDate: r.statementDate,
        responseType: r.responseType,
        person: r.person ? { name: r.person.name } : null,
        organization: r.organization ? { name: r.organization.name } : null
      })),
      repercussions: allRepercussions.map(r => ({
        type: r.type,
        description: r.description,
        startDate: r.startDate,
        severityScore: r.severityScore,
        impactDescription: r.impactDescription
      })),
      sources: uniqueSources.map(s => ({
        url: s.url,
        title: s.title,
        publicationName: s.publicationName,
        publishDate: s.publishDate,
        author: s.author
      })),
      caseBasicInfo: {
        title: caseRecord.title,
        slug: caseRecord.slug,
        caseDate: caseRecord.caseDate,
        locationCity: caseRecord.locationCity,
        locationCountry: caseRecord.locationCountry
      }
    }

    // Perform web search if enabled
    if (webSearch && origStatement.person) {
      try {
        const webSearchResults = await enrichedCaseSearch({
          personName: origStatement.person.name,
          statementContent: origStatement.content,
          statementDate: origStatement.statementDate,
          caseTitle: caseRecord.title,
          context: origStatement.context || undefined
        })

        enrichmentInput.webSearchResults = webSearchResults
      } catch (error) {
        console.warn('Web search failed, continuing without it:', error)
        // Continue without web search results
      }
    }

    // Call Claude API
    const enrichmentOutput = await enrichCase(enrichmentInput)

    // Update case in database
    const updatedCase = await prisma.case.update({
      where: { id: caseRecord.id },
      data: {
        summary: enrichmentOutput.summary,
        description: enrichmentOutput.description,
        triggeringEvent: enrichmentOutput.triggeringEvent,
        outcome: enrichmentOutput.outcome,
        mediaFraming: enrichmentOutput.mediaFraming,
        lastReviewedAt: new Date(),
        lastReviewedBy: auth.userId
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        description: true,
        triggeringEvent: true,
        outcome: true,
        mediaFraming: true,
        lastReviewedAt: true
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Case enriched successfully',
      case: updatedCase,
      enrichmentMetadata: {
        summaryLength: enrichmentOutput.summary.length,
        descriptionLength: enrichmentOutput.description.length,
        timelineEvents: enrichmentOutput.timeline.length,
        originalLanguage: enrichmentOutput.originalLanguage,
        responsesAnalyzed: allResponses.length,
        repercussionsAnalyzed: allRepercussions.length,
        sourcesUsed: uniqueSources.length
      }
    })
  } catch (error) {
    console.error('Failed to enrich case:', error)
    return res.status(500).json({
      error: 'Failed to enrich case',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
