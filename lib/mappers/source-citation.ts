/**
 * Source to Citation Mapper
 * Maps Prisma Source model to Harvard citation format
 */

import type { Source } from '@prisma/client'
import { generateHarvardCitation, type CitationData } from '../harvard-citation'

export type SourceWithRelations = Source

/**
 * Convert Source model to CitationData format
 * Note: mediaOutlet.name is accessed through mediaOutlet.organization.name in the schema
 * So we just use the source.publication field which should be populated
 */
export function sourceToHarvardCitation(source: SourceWithRelations): string {
  const citationData: CitationData = {
    title: source.title,
    url: source.url || '',
    accessDate: source.accessDate,
    archiveUrl: source.archiveUrl || undefined
  }

  // Author
  if (source.author) {
    citationData.author = source.author
  } else if (source.publication) {
    citationData.authorOrg = source.publication
  }

  // Publication
  if (source.publication) {
    citationData.publication = source.publication
  }

  // Year and date
  if (source.publishDate) {
    citationData.publicationDate = new Date(source.publishDate)
    citationData.year = citationData.publicationDate.getFullYear()
  }

  // Medium/Type
  if (source.sourceType === 'NEWS_ARTICLE') {
    citationData.medium = 'web'
  } else if (source.sourceType === 'SOCIAL_MEDIA_POST') {
    citationData.medium = 'social'
  } else if (source.sourceType === 'VIDEO') {
    citationData.medium = 'video'
  } else if (source.sourceType === 'AUDIO') {
    citationData.medium = 'video'
  } else if (source.sourceType === 'BOOK') {
    citationData.medium = 'book'
  } else if (source.sourceType === 'ACADEMIC_PAPER') {
    citationData.medium = 'academic'
  } else if (source.sourceType === 'GOVERNMENT_DOCUMENT') {
    citationData.medium = 'government'
  } else {
    citationData.medium = 'web'
  }

  return generateHarvardCitation(citationData)
}

/**
 * Format short in-text citation (Author Year)
 */
export function sourceToInTextCitation(source: SourceWithRelations): string {
  let author = 'Anon.'

  if (source.author) {
    const authorParts = source.author.split(' ')
    author = authorParts[authorParts.length - 1] // Last name
  } else if (source.publication) {
    author = source.publication
  }

  const year = source.publishDate
    ? new Date(source.publishDate).getFullYear()
    : 'n.d.'

  return `(${author} ${year})`
}

/**
 * Format short display citation for UI
 */
export function sourceToShortCitation(source: SourceWithRelations): string {
  const author = source.author || source.publication || 'Anonymous'
  const publication = source.publication
  const year = source.publishDate
    ? new Date(source.publishDate).getFullYear()
    : 'n.d.'

  if (publication && publication !== author) {
    return `${author}, ${publication} (${year})`
  }
  return `${author} (${year})`
}
