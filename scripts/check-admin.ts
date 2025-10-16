import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Checking for admin users...\n')

    // Check for existing admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
        lastLogin: true
      }
    })

    if (admins.length > 0) {
      console.log(`✅ Found ${admins.length} admin user(s):\n`)
      admins.forEach(admin => {
        console.log(`  Username: ${admin.username}`)
        console.log(`  Email: ${admin.email || 'N/A'}`)
        console.log(`  Active: ${admin.isActive ? '✅ Yes' : '❌ No'}`)
        console.log(`  Locked: ${admin.lockedUntil ? `🔒 Until ${admin.lockedUntil}` : '🔓 No'}`)
        console.log(`  Login Attempts: ${admin.loginAttempts}`)
        console.log(`  Last Login: ${admin.lastLogin || 'Never'}`)
        console.log('')
      })

      // Check if any admin is locked
      const lockedAdmins = admins.filter(a => a.lockedUntil && new Date(a.lockedUntil) > new Date())
      if (lockedAdmins.length > 0) {
        console.log('⚠️  WARNING: Some admin accounts are locked!')
        console.log('   To unlock, run: npm run unlock-admin\n')
      }

      // Check if any admin has high login attempts
      const suspiciousAdmins = admins.filter(a => a.loginAttempts >= 3 && !a.lockedUntil)
      if (suspiciousAdmins.length > 0) {
        console.log('⚠️  WARNING: Some admin accounts have failed login attempts!')
        suspiciousAdmins.forEach(admin => {
          console.log(`   ${admin.username}: ${admin.loginAttempts} attempts`)
        })
        console.log('')
      }
    } else {
      console.log('❌ No admin users found!')
      console.log('\n📝 Creating default admin user...\n')

      const passwordHash = await hashPassword('admin123')

      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          passwordHash,
          role: 'ADMIN',
          isActive: true,
          loginAttempts: 0
        }
      })

      console.log('✅ Admin user created successfully!')
      console.log(`   Username: ${newAdmin.username}`)
      console.log(`   Email: ${newAdmin.email}`)
      console.log(`   Password: admin123`)
      console.log('\n⚠️  Please change the password after first login!\n')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateAdmin()
