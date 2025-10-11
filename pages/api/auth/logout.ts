import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAuthCookie, extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { recordAuditEvent, extractRequestContext } from '@/lib/audit'
import { revokeSession } from '@/lib/session'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const context = extractRequestContext(req)
  const token = extractTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  if (payload?.sid) {
    await revokeSession(payload.sid)
  }

  await recordAuditEvent({
    action: 'AUTH_LOGOUT',
    actorId: payload?.sub,
    actorType: 'USER',
    status: 'SUCCESS',
    description: 'Admin console logout',
    metadata: {
      username: payload?.username
    },
    ...context
  })

  clearAuthCookie(res)

  res.status(200).json({ success: true, message: 'Logged out successfully' })
}
