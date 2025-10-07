/**
 * Topic Classification & Cross-Linking System
 *
 * Comprehensive topic management for statements and incidents according to v3.0.1 schema
 * Internal use only - classification logic for content organization
 */

import { PrismaClient, TopicType, TopicStatus, TopicScale, TopicRelationType } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * INTERNAL CLASSIFICATION CATEGORIES
 * Note: These are backend-only organizational terms
 */
export const INTERNAL_TOPIC_CATEGORIES = {
  // Content organization categories (internal only)
  SUBJECT_AREAS: ['antisemitism', 'israel', 'palestine', 'jewish-community', 'zionism'],

  // Public-facing topic types
  TOPIC_TYPES: {
    ANTISEMITISM_INCIDENT: 'Antisemitism-related incidents',
    ISRAEL_PALESTINE_CONFLICT: 'Israel-Palestine conflict statements',
    GAZA_OPERATIONS: 'Gaza military operations',
    WEST_BANK_SETTLEMENTS: 'West Bank settlements',
    ZIONISM_DEBATE: 'Zionism debates',
    JEWISH_COMMUNITY: 'Jewish community affairs',
    PALESTINIAN_RIGHTS: 'Palestinian rights',
    BDS_MOVEMENT: 'BDS movement',
    HOLOCAUST_MEMORY: 'Holocaust remembrance',
    IHRA_DEFINITION: 'IHRA definition discussions'
  }
} as const

export interface TopicClassification {
  primaryTopic: string
  secondaryTopics: string[]
  relevanceScores: Record<string, number> // 0-10 scale
  topicType: TopicType
  scale: TopicScale
  status: TopicStatus
  relatedTopics: string[]
  confidence: number // 0-1 scale
  reasoning: string
}

export interface TopicRelationship {
  fromTopicSlug: string
  toTopicSlug: string
  relationType: TopicRelationType
  strength: number // 1-10
  description?: string
}

/**
 * Classify content into topics using Claude API
 */
export async function classifyIntoTopics(
  content: string,
  context: string,
  personName?: string,
  organizationName?: string
): Promise<TopicClassification> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY required for topic classification')
  }

  const prompt = `Analyze this statement and classify it into relevant topics.

STATEMENT: "${content}"

CONTEXT: ${context}

${personName ? `PERSON: ${personName}` : ''}
${organizationName ? `ORGANIZATION: ${organizationName}` : ''}

Classify into topics based on:
1. Main subject matter
2. Geographic scope
3. Related events/policies
4. Historical context
5. Impact level

Available topic types:
- ANTISEMITISM_INCIDENT: Incidents involving antisemitism allegations or acts
- ISRAEL_PALESTINE_CONFLICT: General conflict-related statements
- GAZA_OPERATIONS: Specific to Gaza military operations
- WEST_BANK_SETTLEMENTS: Settlement-related issues
- ZIONISM_DEBATE: Discussions about Zionism as ideology/movement
- JEWISH_COMMUNITY: Jewish community affairs and statements
- PALESTINIAN_RIGHTS: Palestinian rights and advocacy
- BDS_MOVEMENT: Boycott, Divestment, Sanctions movement
- HOLOCAUST_MEMORY: Holocaust remembrance and education
- IHRA_DEFINITION: IHRA antisemitism definition discussions
- UK_POLITICS / US_POLITICS / INTERNATIONAL_RELATIONS
- UNIVERSITY_CAMPUS: Campus-related incidents
- MEDIA_COVERAGE: Media framing and coverage
- SOCIAL_MEDIA: Social media controversies
- CANCEL_CULTURE / DEPLATFORMING
- LAWFARE / SMEAR_CAMPAIGN

Scale options: LOCAL, REGIONAL, NATIONAL, INTERNATIONAL, GLOBAL

Status options: EMERGING, ACTIVE, DEVELOPING, ESCALATING, PEAK, DECLINING, RESOLVED, DORMANT, RECURRING

Return in this EXACT format:

---CLASSIFICATION---
Primary Topic: [main topic name]
Secondary Topics: [comma-separated topic names]
Relevance Scores: [topic1:8, topic2:6, topic3:4]
Topic Type: [TopicType enum value]
Scale: [LOCAL/REGIONAL/NATIONAL/INTERNATIONAL/GLOBAL]
Status: [ACTIVE/DEVELOPING/etc]
Related Topics: [comma-separated related topic slugs]
Confidence: [0.0-1.0]
Reasoning: [Brief explanation of classification]
---END CLASSIFICATION---`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    return parseTopicClassification(data.content[0].text)
  } catch (error) {
    console.error('Topic classification failed:', error)
    // Return default classification
    return {
      primaryTopic: 'general-statement',
      secondaryTopics: [],
      relevanceScores: { 'general-statement': 5 },
      topicType: 'OTHER',
      scale: 'NATIONAL',
      status: 'ACTIVE',
      relatedTopics: [],
      confidence: 0.3,
      reasoning: 'Automatic classification failed, manual review needed'
    }
  }
}

/**
 * Parse topic classification from Claude response
 */
function parseTopicClassification(response: string): TopicClassification {
  const block = response.match(/---CLASSIFICATION---[\s\S]*?---END CLASSIFICATION---/)
  if (!block) {
    throw new Error('Invalid classification format')
  }

  const text = block[0]

  const primaryMatch = text.match(/Primary Topic:\s*(.+)/)
  const secondaryMatch = text.match(/Secondary Topics:\s*(.+)/)
  const scoresMatch = text.match(/Relevance Scores:\s*(.+)/)
  const typeMatch = text.match(/Topic Type:\s*(.+)/)
  const scaleMatch = text.match(/Scale:\s*(LOCAL|REGIONAL|NATIONAL|INTERNATIONAL|GLOBAL)/)
  const statusMatch = text.match(/Status:\s*(\w+)/)
  const relatedMatch = text.match(/Related Topics:\s*(.+)/)
  const confidenceMatch = text.match(/Confidence:\s*([\d.]+)/)
  const reasoningMatch = text.match(/Reasoning:\s*(.+)/)

  // Parse relevance scores
  const relevanceScores: Record<string, number> = {}
  if (scoresMatch) {
    const scores = scoresMatch[1].split(',')
    for (const score of scores) {
      const [topic, value] = score.split(':')
      if (topic && value) {
        relevanceScores[topic.trim()] = parseFloat(value.trim())
      }
    }
  }

  return {
    primaryTopic: primaryMatch ? primaryMatch[1].trim() : 'general-statement',
    secondaryTopics: secondaryMatch ? secondaryMatch[1].split(',').map(s => s.trim()) : [],
    relevanceScores,
    topicType: (typeMatch ? typeMatch[1].trim() : 'OTHER') as TopicType,
    scale: (scaleMatch ? scaleMatch[1] : 'NATIONAL') as TopicScale,
    status: (statusMatch ? statusMatch[1] : 'ACTIVE') as TopicStatus,
    relatedTopics: relatedMatch ? relatedMatch[1].split(',').map(s => s.trim()) : [],
    confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : ''
  }
}

/**
 * Create or update topics in database
 */
export async function ensureTopicsExist(classification: TopicClassification): Promise<string[]> {
  const topicIds: string[] = []

  // Create primary topic
  const primarySlug = slugify(classification.primaryTopic)
  const primaryTopic = await prisma.topic.upsert({
    where: { slug: primarySlug },
    update: {
      topicType: classification.topicType,
      scope: classification.scale,
      status: classification.status,
      lastActivityAt: new Date(),
      statementCount: { increment: 1 }
    },
    create: {
      slug: primarySlug,
      name: classification.primaryTopic,
      displayLabel: classification.primaryTopic,
      description: classification.reasoning,
      topicType: classification.topicType,
      scope: classification.scale,
      status: classification.status,
      searchKeywords: [classification.primaryTopic],
      isActive: true,
      priority: Math.floor(classification.confidence * 10)
    }
  })
  topicIds.push(primaryTopic.id)

  // Create secondary topics
  for (const secondaryName of classification.secondaryTopics) {
    const slug = slugify(secondaryName)
    const topic = await prisma.topic.upsert({
      where: { slug },
      update: {
        lastActivityAt: new Date(),
        statementCount: { increment: 1 }
      },
      create: {
        slug,
        name: secondaryName,
        displayLabel: secondaryName,
        description: `Related to ${classification.primaryTopic}`,
        topicType: classification.topicType,
        scope: classification.scale,
        status: 'ACTIVE',
        searchKeywords: [secondaryName],
        isActive: true,
        priority: 5
      }
    })
    topicIds.push(topic.id)
  }

  return topicIds
}

/**
 * Link incident to topics
 */
export async function linkIncidentToTopics(
  incidentId: string,
  classification: TopicClassification
): Promise<void> {
  const topicIds = await ensureTopicsExist(classification)

  // Link primary topic
  const primarySlug = slugify(classification.primaryTopic)
  const primaryTopic = await prisma.topic.findUnique({ where: { slug: primarySlug } })

  if (primaryTopic) {
    await prisma.topicIncident.upsert({
      where: {
        topicId_incidentId: {
          topicId: primaryTopic.id,
          incidentId
        }
      },
      update: {
        relevanceScore: Math.floor(classification.relevanceScores[classification.primaryTopic] || 10),
        isPrimary: true,
        relationType: 'PRIMARY'
      },
      create: {
        topicId: primaryTopic.id,
        incidentId,
        relevanceScore: Math.floor(classification.relevanceScores[classification.primaryTopic] || 10),
        isPrimary: true,
        relationType: 'PRIMARY',
        isVerified: classification.confidence > 0.8
      }
    })
  }

  // Link secondary topics
  for (const secondaryName of classification.secondaryTopics) {
    const slug = slugify(secondaryName)
    const topic = await prisma.topic.findUnique({ where: { slug } })

    if (topic) {
      await prisma.topicIncident.upsert({
        where: {
          topicId_incidentId: {
            topicId: topic.id,
            incidentId
          }
        },
        update: {
          relevanceScore: Math.floor(classification.relevanceScores[secondaryName] || 5),
          isPrimary: false,
          relationType: 'RELATED'
        },
        create: {
          topicId: topic.id,
          incidentId,
          relevanceScore: Math.floor(classification.relevanceScores[secondaryName] || 5),
          isPrimary: false,
          relationType: 'RELATED',
          isVerified: classification.confidence > 0.8
        }
      })
    }
  }
}

/**
 * Create topic relationships
 */
export async function createTopicRelationships(relationships: TopicRelationship[]): Promise<void> {
  for (const rel of relationships) {
    const fromTopic = await prisma.topic.findUnique({ where: { slug: rel.fromTopicSlug } })
    const toTopic = await prisma.topic.findUnique({ where: { slug: rel.toTopicSlug } })

    if (fromTopic && toTopic) {
      await prisma.topicRelation.upsert({
        where: {
          fromTopicId_toTopicId_relationType: {
            fromTopicId: fromTopic.id,
            toTopicId: toTopic.id,
            relationType: rel.relationType
          }
        },
        update: {
          strength: rel.strength,
          description: rel.description
        },
        create: {
          fromTopicId: fromTopic.id,
          toTopicId: toTopic.id,
          relationType: rel.relationType,
          strength: rel.strength,
          description: rel.description,
          isVerified: rel.strength >= 8
        }
      })
    }
  }
}

/**
 * Discover topic relationships using AI
 */
export async function discoverTopicRelationships(topicSlug: string): Promise<TopicRelationship[]> {
  const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } })
  if (!topic) return []

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) return []

  const prompt = `Analyze relationships for this topic: "${topic.name}"

Description: ${topic.description || 'No description'}

Identify related topics and their relationship types:
- SUBSET_OF: This topic is a subset of another
- CAUSED_BY: This topic was caused by another
- LED_TO: This topic led to another
- RELATED_TO: General relationship
- CONTRADICTS: Opposing viewpoints
- SUPPORTS: Supporting viewpoints
- PART_OF_SERIES: Part of ongoing series

Return format:
---RELATIONSHIPS---
Related Topic: [topic name]
Relationship Type: [SUBSET_OF/CAUSED_BY/LED_TO/etc]
Strength: [1-10]
Description: [brief explanation]
---END RELATIONSHIP---

Repeat for each related topic (up to 5 most relevant).`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    return parseTopicRelationships(data.content[0].text, topicSlug)
  } catch (error) {
    console.error('Failed to discover relationships:', error)
    return []
  }
}

/**
 * Parse topic relationships from response
 */
function parseTopicRelationships(response: string, fromTopicSlug: string): TopicRelationship[] {
  const relationships: TopicRelationship[] = []
  const blocks = response.match(/---RELATIONSHIPS---[\s\S]*?---END RELATIONSHIP---/g)

  if (!blocks) return []

  for (const block of blocks) {
    const topicMatch = block.match(/Related Topic:\s*(.+)/)
    const typeMatch = block.match(/Relationship Type:\s*(.+)/)
    const strengthMatch = block.match(/Strength:\s*(\d+)/)
    const descMatch = block.match(/Description:\s*(.+)/)

    if (topicMatch && typeMatch) {
      relationships.push({
        fromTopicSlug,
        toTopicSlug: slugify(topicMatch[1].trim()),
        relationType: typeMatch[1].trim() as TopicRelationType,
        strength: strengthMatch ? parseInt(strengthMatch[1]) : 5,
        description: descMatch ? descMatch[1].trim() : undefined
      })
    }
  }

  return relationships
}

/**
 * Create slug from topic name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Batch classify multiple statements
 */
export async function batchClassifyStatements(
  statements: Array<{ id: string; content: string; context?: string; personName?: string }>
): Promise<Map<string, TopicClassification>> {
  const classifications = new Map<string, TopicClassification>()

  for (const stmt of statements) {
    try {
      const classification = await classifyIntoTopics(
        stmt.content,
        stmt.context || '',
        stmt.personName
      )
      classifications.set(stmt.id, classification)

      // Rate limiting
      await sleep(2000)
    } catch (error) {
      console.error(`Failed to classify statement ${stmt.id}:`, error)
    }
  }

  return classifications
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
