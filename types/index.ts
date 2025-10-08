// Re-export Prisma types
import type {
  Person as PrismaPerson,
  Organization as PrismaOrganization,
  Case as PrismaCase,
  Statement as PrismaStatement,
  Source as PrismaSource,
  Tag as PrismaTag
} from '@prisma/client'

export type Person = PrismaPerson
export type Organization = PrismaOrganization
export type Case = PrismaCase
export type Incident = PrismaCase  // Legacy alias for backwards compatibility
export type Statement = PrismaStatement
export type Source = PrismaSource
export type Tag = PrismaTag

// API Response types
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// Extended types with relations
export interface PersonWithRelations extends Person {
  cases?: CaseWithRelations[]
  incidents?: CaseWithRelations[]  // Legacy alias
  statements?: StatementWithRelations[]
  _count?: {
    cases: number
    incidents: number
    statements: number
  }
}

export interface CaseWithRelations extends Case {
  persons?: Person[]
  organizations?: Organization[]
  tags?: Tag[]
  statements?: StatementWithRelations[]
  sources?: Source[]
  _count?: {
    statements: number
    sources: number
  }
}

export interface IncidentWithRelations extends CaseWithRelations {}  // Legacy alias

export interface StatementWithRelations extends Statement {
  person?: Person
  organization?: Organization
  case?: Case
  incident?: Case  // Legacy alias
  sources?: Source[]
  responses?: Statement[]  // Responses are now Statements with type RESPONSE
  respondsTo?: Statement   // The statement this is responding to
}

// Form/Input types
export interface PersonFormData {
  name: string
  slug: string
  bio?: string
  imageUrl?: string
  profession?: string
  nationality?: string
  birthDate?: string
  deathDate?: string
}

export interface CaseFormData {
  title: string
  slug: string
  summary: string
  description: string
  caseDate: string
  status?: string
  severity?: string
  location?: string
  personIds?: string[]
  organizationIds?: string[]
  tagIds?: string[]
}

export interface IncidentFormData extends CaseFormData {
  incidentDate: string  // Legacy alias for caseDate
}