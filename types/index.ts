// Re-export Prisma types
import type {
  Person as PrismaPerson,
  Organization as PrismaOrganization,
  Incident as PrismaIncident,
  Statement as PrismaStatement,
  Source as PrismaSource,
  Tag as PrismaTag
} from '@prisma/client'

export type Person = PrismaPerson
export type Organization = PrismaOrganization
export type Incident = PrismaIncident
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
  incidents?: IncidentWithRelations[]
  statements?: StatementWithRelations[]
  _count?: {
    incidents: number
    statements: number
  }
}

export interface IncidentWithRelations extends Incident {
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

export interface StatementWithRelations extends Statement {
  person?: Person
  organization?: Organization
  incident?: Incident
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

export interface IncidentFormData {
  title: string
  slug: string
  summary: string
  description: string
  incidentDate: string
  status?: string
  severity?: string
  location?: string
  personIds?: string[]
  organizationIds?: string[]
  tagIds?: string[]
}