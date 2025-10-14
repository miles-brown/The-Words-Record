import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { AuditAction, AuditActorType, UserRole } from '@prisma/client'
import formidable from 'formidable'
import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
}

async function requireAdmin(req: NextApiRequest): Promise<{ userId: string } | null> {
  const token = extractTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.sub) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true }
  })

  if (!user || !user.isActive || user.role !== UserRole.ADMIN) {
    return null
  }

  return { userId: user.id }
}

/**
 * Media Upload API
 *
 * POST /api/admin/media/upload
 *
 * Form fields:
 * - file: Image file (jpg, png, gif, webp)
 * - entityType: 'person' | 'organization' | 'general'
 * - entityId?: ID of person/organization (optional)
 *
 * Storage Options (configured via environment):
 * - LOCAL: Store in /public/uploads
 * - S3: AWS S3 bucket
 * - CLOUDINARY: Cloudinary service
 *
 * Environment Variables:
 * - MEDIA_STORAGE=local|s3|cloudinary (default: local)
 * - AWS_S3_BUCKET=your-bucket-name
 * - AWS_S3_REGION=us-east-1
 * - AWS_ACCESS_KEY_ID=your-key
 * - AWS_SECRET_ACCESS_KEY=your-secret
 * - CLOUDINARY_CLOUD_NAME=your-cloud
 * - CLOUDINARY_API_KEY=your-key
 * - CLOUDINARY_API_SECRET=your-secret
 *
 * Response:
 * {
 *   success: true
 *   url: string  // Public URL of uploaded file
 *   filename: string
 *   size: number
 *   mimeType: string
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAdmin(req)
  if (!auth) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: function ({ mimetype }) {
        // Only allow images
        return mimetype !== null && mimetype.includes('image')
      }
    })

    const [fields, files] = await form.parse(req)

    const file = files.file?.[0]
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const entityType = fields.entityType?.[0] || 'general'
    const entityId = fields.entityId?.[0]

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WEBP'
      })
    }

    // Upload to configured storage
    const storageType = process.env.MEDIA_STORAGE || 'local'
    let uploadResult: { url: string; filename: string }

    switch (storageType) {
      case 's3':
        uploadResult = await uploadToS3(file, entityType, entityId)
        break

      case 'cloudinary':
        uploadResult = await uploadToCloudinary(file, entityType, entityId)
        break

      case 'local':
      default:
        uploadResult = await uploadToLocal(file, entityType, entityId)
        break
    }

    // Log upload
    await logAuditEvent({
      action: AuditAction.CREATE,
      actorType: AuditActorType.USER,
      actorId: auth.userId,
      entityType: 'MediaUpload',
      entityId: uploadResult.filename,
      details: {
        entityType,
        entityId,
        url: uploadResult.url,
        filename: uploadResult.filename,
        size: file.size,
        mimeType: file.mimetype,
        storage: storageType
      }
    })

    // Clean up temp file
    await fs.unlink(file.filepath).catch(() => {})

    return res.status(200).json({
      success: true,
      url: uploadResult.url,
      filename: uploadResult.filename,
      size: file.size,
      mimeType: file.mimetype
    })
  } catch (error) {
    console.error('Media upload error:', error)
    return res.status(500).json({
      error: 'Failed to upload media',
      details: process.env.NODE_ENV === 'development'
        ? (error instanceof Error ? error.message : 'Unknown error')
        : undefined
    })
  }
}

/**
 * Upload to local filesystem
 */
async function uploadToLocal(
  file: formidable.File,
  entityType: string,
  entityId?: string
): Promise<{ url: string; filename: string }> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', entityType)

  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true })

  // Generate unique filename
  const ext = path.extname(file.originalFilename || '.jpg')
  const hash = createHash('md5').update(`${Date.now()}-${file.originalFilename}`).digest('hex')
  const filename = `${hash}${ext}`
  const filepath = path.join(uploadDir, filename)

  // Copy file
  await fs.copyFile(file.filepath, filepath)

  const url = `/uploads/${entityType}/${filename}`

  return { url, filename }
}

/**
 * Upload to AWS S3
 */
async function uploadToS3(
  file: formidable.File,
  entityType: string,
  entityId?: string
): Promise<{ url: string; filename: string }> {
  // Check for required environment variables
  const bucket = process.env.AWS_S3_BUCKET
  const region = process.env.AWS_S3_REGION || 'us-east-1'

  if (!bucket) {
    throw new Error('AWS_S3_BUCKET environment variable not configured')
  }

  try {
    // Dynamic import of AWS SDK (only when needed)
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })

    // Generate unique filename
    const ext = path.extname(file.originalFilename || '.jpg')
    const hash = createHash('md5').update(`${Date.now()}-${file.originalFilename}`).digest('hex')
    const filename = `${entityType}/${hash}${ext}`

    // Read file content
    const fileContent = await fs.readFile(file.filepath)

    // Upload to S3
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: fileContent,
      ContentType: file.mimetype || 'application/octet-stream',
      ACL: 'public-read'
    }))

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${filename}`

    return { url, filename }
  } catch (error) {
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Upload to Cloudinary
 */
async function uploadToCloudinary(
  file: formidable.File,
  entityType: string,
  entityId?: string
): Promise<{ url: string; filename: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables not configured')
  }

  try {
    // Dynamic import of Cloudinary SDK
    const cloudinary = await import('cloudinary')
    cloudinary.v2.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    })

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(file.filepath, {
      folder: `who-said-what/${entityType}`,
      public_id: entityId ? `${entityType}-${entityId}` : undefined,
      resource_type: 'image',
      overwrite: true
    })

    return {
      url: result.secure_url,
      filename: result.public_id
    }
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
