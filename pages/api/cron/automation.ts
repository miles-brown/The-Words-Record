import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Vercel Cron Job Endpoint for Automated Tasks
 *
 * This endpoint runs automated maintenance tasks on a schedule.
 * It can be triggered by:
 * 1. Vercel Cron Jobs (recommended)
 * 2. External cron services (cron-job.org, EasyCron, etc.)
 * 3. GitHub Actions scheduled workflows
 *
 * Security: Protected by CRON_SECRET environment variable
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authorization
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('❌ CRON_SECRET not configured')
    return res.status(500).json({ error: 'Cron secret not configured' })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ Unauthorized cron request')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Parse task from query parameter
  const { task = 'all' } = req.query

  console.log(`🤖 Running automated task: ${task}`)

  const results: any = {
    task,
    timestamp: new Date().toISOString(),
    success: false,
    data: {}
  }

  try {
    switch (task) {
      case 'death-check':
        results.data = await runDeathCheck()
        break

      case 'auto-promote':
        results.data = await runAutoPromotion()
        break

      case 'all':
        results.data.deathCheck = await runDeathCheck()
        results.data.autoPromotion = await runAutoPromotion()
        break

      default:
        return res.status(400).json({ error: 'Invalid task parameter' })
    }

    results.success = true
    console.log('✅ Automation completed successfully')
    return res.status(200).json(results)

  } catch (error) {
    console.error('❌ Automation error:', error)
    results.error = error instanceof Error ? error.message : String(error)
    return res.status(500).json(results)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Check for death updates for people in database
 */
async function runDeathCheck() {
  console.log('💀 Starting death check...')

  // Get people who need checking based on schedule
  const people = await prisma.person.findMany({
    where: {
      AND: [
        { isDeceased: false },
        {
          OR: [
            { birthDate: { not: null } },
            { dateOfBirth: { not: null } }
          ]
        }
      ]
    },
    orderBy: [
      { birthDate: 'asc' },
      { dateOfBirth: 'asc' }
    ],
    take: 20 // Limit to 20 per run to avoid timeout
  })

  let checked = 0
  let deceased = 0
  const now = new Date()

  for (const person of people) {
    const birthDate = person.birthDate || person.dateOfBirth
    if (!birthDate) continue

    const age = calculateAge(birthDate)
    const lastCheck = person.lastDeathCheck ? new Date(person.lastDeathCheck) : null

    // Determine if person should be checked based on age and last check
    let shouldCheck = false
    if (!lastCheck) {
      shouldCheck = true
    } else {
      const daysSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)

      if (age >= 80 && daysSinceCheck >= 14) shouldCheck = true
      else if (age >= 60 && daysSinceCheck >= 28) shouldCheck = true
      else if (age < 60 && daysSinceCheck >= 240) shouldCheck = true
    }

    if (!shouldCheck) continue

    // Update last check timestamp
    await prisma.person.update({
      where: { id: person.id },
      data: { lastDeathCheck: now }
    })

    checked++

    // Note: Actual death checking via API would happen here
    // This is a placeholder - the full implementation would use Claude API
    // to search for death information
  }

  return {
    checked,
    deceased,
    totalPeople: people.length
  }
}

/**
 * Auto-promote statements to cases based on response count
 */
async function runAutoPromotion() {
  console.log('🚀 Starting auto-promotion...')

  // Find statements with >2 responses that aren't already promoted
  const statements = await prisma.statement.findMany({
    include: {
      _count: {
        select: {
          responses: true
        }
      },
      case: {
        select: {
          id: true,
          isRealIncident: true,
          slug: true
        }
      }
    }
  })

  const qualifyingStatements = statements.filter(statement => {
    const responseCount = statement._count.responses
    const hasCase = statement.case !== null
    const isAlreadyRealCase = hasCase && statement.case?.isRealIncident === true

    return responseCount > 2 && !isAlreadyRealCase && hasCase
  })

  let promoted = 0
  const promotedCases: string[] = []

  for (const statement of qualifyingStatements) {
    if (!statement.case) continue

    try {
      const qualificationScore = calculateQualificationScore(statement._count.responses)

      await prisma.case.update({
        where: { id: statement.case.id },
        data: {
          isRealIncident: true,
          wasAutoImported: false,
          promotedAt: new Date(),
          promotedBy: 'CRON_AUTOMATION',
          promotionReason: `Automatically promoted: ${statement._count.responses} responses (threshold: >2)`,
          wasManuallyPromoted: false,
          originatingStatementId: statement.id,
          qualificationScore,
          responseCount: statement._count.responses,
          visibility: 'PUBLIC',
          status: 'DOCUMENTED'
        }
      })

      promoted++
      promotedCases.push(statement.case.slug)
      console.log(`✅ Promoted case: ${statement.case.slug}`)
    } catch (error) {
      console.error(`❌ Error promoting statement ${statement.id}:`, error)
    }
  }

  return {
    totalStatements: statements.length,
    qualified: qualifyingStatements.length,
    promoted,
    promotedCases
  }
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Calculate qualification score based on response count
 */
function calculateQualificationScore(responseCount: number): number {
  if (responseCount <= 2) return 0
  if (responseCount <= 5) return 40 + (responseCount - 3) * 10 // 40-60
  if (responseCount <= 10) return 61 + (responseCount - 6) * 4 // 61-80
  return Math.min(100, 81 + (responseCount - 11) * 2) // 81-100
}
