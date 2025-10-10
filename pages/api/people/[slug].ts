import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withNormalizedNationality } from '@/lib/mappers/person-nationality'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' })
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get a person by slug with all related data
        const person = await prisma.person.findUnique({
          where: { slug },
          include: {
            cases: {
              include: {
                tags: true,
                _count: {
                  select: {
                    statements: true,
                    sources: true
                  }
                },
                statements: {
                  where: { statementType: 'RESPONSE' },
                  select: { id: true }
                }
              },
              orderBy: {
                caseDate: 'desc'
              }
            },
            statements: {
              include: {
                case: true,
                sources: true,
                respondsTo: true,
                responses: true
              },
              orderBy: {
                statementDate: 'desc'
              }
            },
            nationalities: {
              where: { endDate: null }, // Only active nationalities
              include: { country: true },
              orderBy: [
                { isPrimary: 'desc' },
                { displayOrder: 'asc' }
              ]
            }
          }
        })

        if (!person) {
          return res.status(404).json({ error: 'Person not found' })
        }

        // Add response count to _count object for each case and normalize nationality
        const personWithResponseCounts = {
          ...person,
          cases: person.cases.map(caseItem => {
            const responseCount = caseItem.statements?.length || 0
            const { statements, ...caseWithoutStatements } = caseItem
            return {
              ...caseWithoutStatements,
              _count: {
                ...caseItem._count,
                responses: responseCount
              }
            }
          })
        }

        const normalizedPerson = withNormalizedNationality(personWithResponseCounts)

        res.status(200).json(normalizedPerson)
        break

      case 'PUT':
        // Update a person
        const updateData = req.body
        
        // Convert date strings to Date objects if present
        if (updateData.birthDate) {
          updateData.birthDate = new Date(updateData.birthDate)
        }
        if (updateData.deathDate) {
          updateData.deathDate = new Date(updateData.deathDate)
        }

        const updatedPerson = await prisma.person.update({
          where: { slug },
          data: updateData
        })

        res.status(200).json(updatedPerson)
        break

      case 'DELETE':
        // Delete a person
        await prisma.person.delete({
          where: { slug }
        })

        res.status(204).end()
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}