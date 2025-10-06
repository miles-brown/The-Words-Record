import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

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
        // Get an organization by slug with all related data
        const organization = await prisma.organization.findUnique({
          where: { slug },
          include: {
            incidents: {
              include: {
                tags: true,
                persons: true,
                _count: {
                  select: {
                    statements: true,
                    sources: true
                  }
                }
              },
              orderBy: {
                incidentDate: 'desc'
              }
            },
            statements: {
              include: {
                incident: true,
                person: true,
                sources: true,
                respondsTo: true,
                responses: true
              },
              orderBy: {
                statementDate: 'desc'
              }
            }
          }
        })

        if (!organization) {
          return res.status(404).json({ error: 'Organization not found' })
        }

        res.status(200).json(organization)
        break

      case 'PUT':
        // Update an organization
        const updateData = req.body
        
        // Convert date strings to Date objects if present
        if (updateData.founded) {
          updateData.founded = new Date(updateData.founded)
        }

        const updatedOrganization = await prisma.organization.update({
          where: { slug },
          data: updateData
        })

        res.status(200).json(updatedOrganization)
        break

      case 'DELETE':
        // Delete an organization
        await prisma.organization.delete({
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