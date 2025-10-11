import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type Permission =
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:export'
  | 'content:import'
  | 'content:approve'
  | 'content:archive'
  | 'content:bulk'
  | 'content:diff'
  | 'source:create'
  | 'source:read'
  | 'source:update'
  | 'source:delete'
  | 'source:verify'
  | 'source:archive'
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'user:manage'
  | 'user:group'
  | 'api:manage'
  | 'harvest:manage'
  | 'audit:read'
  | 'audit:timeline'
  | 'settings:manage'
  | 'db:export'
  | 'db:import'
  | 'db:backup'

export const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  ADMIN: [
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:export',
    'content:import', 'content:approve', 'content:archive', 'content:bulk', 'content:diff',
    'source:create', 'source:read', 'source:update', 'source:delete', 'source:verify', 'source:archive',
    'user:create', 'user:read', 'user:update', 'user:delete', 'user:manage', 'user:group',
    'api:manage', 'harvest:manage', 'audit:read', 'audit:timeline', 'settings:manage', 'db:export',
    'db:import', 'db:backup'
  ],
  CM: [
    'content:create', 'content:read', 'content:update', 'content:approve', 'content:archive',
    'content:bulk', 'content:diff',
    'source:create', 'source:read', 'source:update', 'source:verify', 'audit:read', 'audit:timeline'
  ],
  DE: [
    'content:create', 'content:read', 'content:update', 'content:delete',
    'source:create', 'source:read', 'source:update', 'source:delete', 'source:verify'
  ],
  QA: ['content:read', 'source:read', 'source:verify', 'audit:timeline'],
  DBO: ['content:read', 'content:export', 'content:import', 'source:read', 'db:export', 'db:import', 'db:backup', 'audit:read'],
  BOT: ['content:create', 'content:read', 'source:create', 'source:archive', 'harvest:manage'],
  CI: ['content:create', 'content:read', 'source:create', 'source:read'],
  AI_CUR: ['content:read', 'source:read'],
  AI_ED: ['content:read', 'content:update', 'source:read'],
  AI_VAL: ['content:read', 'source:read', 'source:verify'],
  AI_CITE: ['source:create', 'source:read', 'source:update', 'source:verify', 'source:archive'],
  VIEWER: ['content:read', 'source:read']
}

export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  ADMIN: ['CM', 'DE', 'QA', 'DBO', 'BOT', 'CI', 'AI_CUR', 'AI_ED', 'AI_VAL', 'AI_CITE', 'VIEWER'],
  CM: ['DE', 'QA', 'CI', 'VIEWER'],
  DE: ['CI', 'VIEWER'],
  QA: ['VIEWER'],
  DBO: ['VIEWER'],
  BOT: ['VIEWER'],
  CI: ['VIEWER'],
  AI_CUR: ['VIEWER'],
  AI_ED: ['VIEWER'],
  AI_VAL: ['VIEWER'],
  AI_CITE: ['VIEWER'],
  VIEWER: []
}

export function expandRolePermissions(role: UserRole): Permission[] {
  const inherited = ROLE_HIERARCHY[role] || []
  const base = PERMISSION_MATRIX[role] || []
  const inheritedPermissions = inherited.flatMap(child => PERMISSION_MATRIX[child] || [])
  return uniquePermissions([...base, ...inheritedPermissions])
}

export function combinePermissions(...permissionLists: Array<Permission[] | string[]>): Permission[] {
  return uniquePermissions(permissionLists.flat())
}

export function uniquePermissions(list: Array<Permission | string>): Permission[] {
  return Array.from(new Set(list)) as Permission[]
}

export function userHasPermissionFromList(permissions: Array<Permission | string>, permission: Permission): boolean {
  if (permissions.includes(permission)) return true
  return permissions.some(perm => {
    if (typeof perm !== 'string') return false
    if (!perm.endsWith('*')) return false
    const prefix = perm.replace(/\*+$/, '')
    return permission.startsWith(prefix)
  })
}

const permissionCache = new Map<string, Permission[]>()

export async function getUserEffectivePermissions(userId: string, role: UserRole): Promise<Permission[]> {
  const cacheKey = `${userId}:${role}`
  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)!
  }

  const rolePermissions = expandRolePermissions(role)
  const groups = await prisma.userGroup.findMany({
    where: { userId },
    include: {
      group: true
    }
  })

  const groupPermissions = groups.flatMap(entry => entry.group.permissions as Permission[] || [])
  const combined = combinePermissions(rolePermissions, groupPermissions)
  permissionCache.set(cacheKey, combined)
  return combined
}

export function invalidatePermissionCache(userId?: string) {
  if (!userId) {
    permissionCache.clear()
    return
  }

  for (const key of permissionCache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      permissionCache.delete(key)
    }
  }
}
