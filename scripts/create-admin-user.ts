/**
 * Create Admin User Script
 *
 * Creates the first admin user for the system.
 * Run with: npx ts-node scripts/create-admin-user.ts
 *
 * Or with custom credentials:
 * ADMIN_USERNAME=yourusername ADMIN_PASSWORD=yourpassword npx ts-node scripts/create-admin-user.ts
 */

import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import * as readline from 'readline'

const prisma = new PrismaClient()

interface AdminUserData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function getUserInput(): Promise<AdminUserData> {
  console.log('\n📝 Create Admin User\n')
  console.log('Please provide the following information:\n')

  const username = process.env.ADMIN_USERNAME || await promptUser('Username: ')
  const email = process.env.ADMIN_EMAIL || await promptUser('Email: ')
  const password = process.env.ADMIN_PASSWORD || await promptUser('Password: ')
  const firstName = await promptUser('First Name (optional): ')
  const lastName = await promptUser('Last Name (optional): ')

  return {
    username: username.trim(),
    email: email.trim(),
    password: password.trim(),
    firstName: firstName.trim() || undefined,
    lastName: lastName.trim() || undefined
  }
}

async function createAdminUser() {
  try {
    console.log('🔐 Admin User Creation Script\n')

    // Check if any admin users already exist
    const existingAdmins = await prisma.user.count({
      where: { role: UserRole.ADMIN }
    })

    if (existingAdmins > 0) {
      console.log(`⚠️  Found ${existingAdmins} existing admin user(s).`)
      const proceed = await promptUser('Do you want to create another admin user? (yes/no): ')
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('❌ Operation cancelled.')
        return
      }
    }

    // Get user input
    const userData = await getUserInput()

    // Validate input
    if (!userData.username || !userData.email || !userData.password) {
      console.error('❌ Error: Username, email, and password are required.')
      process.exit(1)
    }

    if (userData.password.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters long.')
      process.exit(1)
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      }
    })

    if (existingUser) {
      console.error('❌ Error: User with this username or email already exists.')
      process.exit(1)
    }

    // Hash password
    console.log('\n🔒 Hashing password...')
    const passwordHash = await hashPassword(userData.password)

    // Create user
    console.log('👤 Creating admin user...')
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash,
        role: UserRole.ADMIN,
        firstName: userData.firstName,
        lastName: userData.lastName,
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
    if (user.firstName || user.lastName) {
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`.trim())
    }
    console.log(`   Created: ${user.createdAt.toISOString()}`)

    console.log('\n🔐 Login Credentials:')
    console.log(`   Username: ${userData.username}`)
    console.log(`   Password: ${userData.password}`)
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!')
    console.log('   You can now log in at: /admin/login\n')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createAdminUser()
