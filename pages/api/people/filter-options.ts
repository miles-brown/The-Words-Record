import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all people with their affiliations
    const people = await prisma.person.findMany({
      select: {
        profession: true,
        nationality: true,
        affiliations: {
          select: {
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Extract unique professions (split comma-separated values)
    const professionsSet = new Set<string>()
    people.forEach(person => {
      if (person.profession) {
        person.profession.split(',').forEach(prof => {
          const trimmed = prof.trim()
          if (trimmed) professionsSet.add(trimmed)
        })
      }
    })

    // Extract unique nationalities (split comma-separated values for dual nationality)
    const nationalitiesSet = new Set<string>()
    people.forEach(person => {
      if (person.nationality) {
        person.nationality.split(',').forEach(nat => {
          const trimmed = nat.trim()
          if (trimmed) nationalitiesSet.add(trimmed)
        })
      }
    })

    // Extract unique organizations
    const organizationsSet = new Set<string>()
    people.forEach(person => {
      person.affiliations.forEach(affiliation => {
        organizationsSet.add(affiliation.organization.name)
      })
    })

    // Convert to sorted arrays
    const professions = Array.from(professionsSet).sort()
    const nationalities = Array.from(nationalitiesSet).sort()
    const organizations = Array.from(organizationsSet).sort()

    res.status(200).json({
      professions,
      nationalities,
      organizations
    })
  } catch (error) {
    console.error('Error fetching filter options:', error)
    res.status(500).json({ error: 'Failed to fetch filter options' })
  }
}
