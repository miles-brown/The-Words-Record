/**
 * Create Admin User Script (JavaScript version)
 *
 * Creates the first admin user for the system.
 * Run with: node scripts/create-admin-user.js
 *
 * Or with custom credentials:
 * ADMIN_USERNAME=yourusername ADMIN_PASSWORD=yourpassword node scripts/create-admin-user.js
 */

const { PrismaClient, UserRole } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

async function createAdminUser() {
  try {
    console.log('🔐 Admin User Creation Script\n')

    // Get credentials from environment or use defaults
    const username = process.env.ADMIN_USERNAME || 'admin'
    const email = process.env.ADMIN_EMAIL || 'admin@thewordsrecord.com'
    const password = process.env.ADMIN_PASSWORD || 'admin123'

    console.log(`Creating admin user with username: ${username}`)

    // Check if any admin users already exist
    const existingAdmins = await prisma.user.count({
      where: { role: UserRole.ADMIN }
    })

    if (existingAdmins > 0) {
      console.log(`\n⚠️  Found ${existingAdmins} existing admin user(s).`)
      console.log('Creating additional admin user...\n')
    }

    // Validate input
    if (!username || !email || !password) {
      console.error('❌ Error: Username, email, and password are required.')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters long.')
      process.exit(1)
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      console.error('❌ Error: User with this username or email already exists.')
      process.exit(1)
    }

    // Hash password
    console.log('🔒 Hashing password...')
    const passwordHash = await hashPassword(password)

    // Create user
    console.log('👤 Creating admin user...')
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
        emailVerified: true,
        mfaEnabled: false
      }
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('\n📋 User Details:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Username: ${user.username}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Created: ${user.createdAt.toISOString()}`)

    console.log('\n🔐 Login Credentials:')
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}`)
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!')
    console.log(`   You can now log in at: http://localhost:3000/admin/login\n`)

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createAdminUser()
