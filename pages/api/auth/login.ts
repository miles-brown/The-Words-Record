import type { NextApiRequest, NextApiResponse } from 'next'
import { UserRole } from '@prisma/client'
import { validateCredentials, generateToken, setAuthCookie } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const isValid = await validateCredentials(username, password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = { username, role: UserRole.ADMIN }
    const token = generateToken(user)

    setAuthCookie(res, token)

    res.status(200).json({
      success: true,
      user,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}
