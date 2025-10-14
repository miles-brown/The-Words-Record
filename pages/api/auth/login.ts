import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if account is active
    if (!user.isActive) {
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        actorType: AuditActorType.USER,
        actorId: user.id,
        details: { reason: 'Account disabled', username }
      })
      return res.status(403).json({ error: 'Account is disabled' })
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        actorType: AuditActorType.USER,
        actorId: user.id,
        details: { reason: 'Account locked', username, lockedUntil: user.lockedUntil }
      })
      return res.status(403).json({
        error: 'Account is locked',
        lockedUntil: user.lockedUntil
      })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      // Increment login attempts
      const newLoginAttempts = user.loginAttempts + 1
      const updateData: any = {
        loginAttempts: newLoginAttempts
      }

      // Lock account after 5 failed attempts
      if (newLoginAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })

      await logAuditEvent({
        action: 'LOGIN_FAILED',
        actorType: AuditActorType.USER,
        actorId: user.id,
        details: {
          reason: 'Invalid password',
          username,
          loginAttempts: newLoginAttempts,
          locked: newLoginAttempts >= 5
        }
      })

      return res.status(401).json({
        error: 'Invalid credentials',
        attemptsRemaining: Math.max(0, 5 - newLoginAttempts)
      })
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // For now, we'll skip MFA implementation and return error
      // In production, you'd want to implement proper MFA flow
      return res.status(200).json({
        requiresMfa: true,
        userId: user.id
      })
    }

    // Create session
    const session = await createSession(user.id, {
      ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    })

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email || undefined,
      role: user.role
    }, {
      sessionId: session.sessionId
    })

    // Update user last login info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        lastLoginIp: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        lastLoginUserAgent: req.headers['user-agent'],
        loginAttempts: 0, // Reset failed attempts
        lockedUntil: null  // Clear any lock
      }
    })

    // Log successful login
    await logAuditEvent({
      action: AuditAction.LOGIN,
      actorType: AuditActorType.USER,
      actorId: user.id,
      details: {
        username: user.username,
        sessionId: session.sessionId
      }
    })

    // Set auth cookie
    setAuthCookie(res, token)

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
