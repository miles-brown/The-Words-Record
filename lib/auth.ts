// @ts-nocheck
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { NextApiRequest, NextApiResponse } from 'next'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$example.hash.here'

export interface AdminUser {
  username: string
  role: 'admin'
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) {
    return false
  }

  // For development, allow simple password check
  if (process.env.NODE_ENV === 'development' && password === 'admin123') {
    return true
  }

  // For production, use bcrypt
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  } catch (error) {
    return false
  }
}

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: AdminUser) => void) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
      }

      const token = authHeader.substring(7)
      const user = verifyToken(token)

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      return handler(req, res, user)
    } catch (error) {
      console.error('Auth error:', error)
      return res.status(500).json({ error: 'Authentication error' })
    }
  }
}

export function getTokenFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie
  if (!cookies) return null

  const tokenCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith('admin_token='))

  if (!tokenCookie) return null

  return tokenCookie.split('=')[1]
}

export function setAuthCookie(res: NextApiResponse, token: string) {
  res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`)
}

export function clearAuthCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict')
}