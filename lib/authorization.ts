import type { NextApiRequest, NextApiResponse } from 'next'
import type { Permission } from '@/lib/permissions'
import { userHasPermissionFromList, expandRolePermissions } from '@/lib/permissions'

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string
    role: string
  }
  permissions?: Permission[]
  apiKey?: {
    id: string
    permissions: string[]
  }
}

export function requestHasPermission(req: NextApiRequest, permission: Permission): boolean {
  const typedReq = req as AuthenticatedRequest

  if (typedReq.permissions && userHasPermissionFromList(typedReq.permissions, permission)) {
    return true
  }

  if (typedReq.user && !typedReq.permissions) {
    const rolePermissions = expandRolePermissions(typedReq.user.role as any)
    if (userHasPermissionFromList(rolePermissions, permission)) {
      return true
    }
  }

  if (typedReq.apiKey) {
    const apiPermissions = typedReq.apiKey.permissions || []
    if (apiPermissions.includes('*') || apiPermissions.includes(permission)) {
      return true
    }
  }

  return false
}

export function ensurePermission(res: NextApiResponse, req: NextApiRequest, permission: Permission): boolean {
  if (requestHasPermission(req, permission)) {
    return true
  }

  res.status(403).json({
    error: 'Insufficient permissions',
    required: permission
  })
  return false
}
