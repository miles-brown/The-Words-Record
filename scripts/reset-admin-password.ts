import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    const username = process.argv[2] || 'admin'
    const newPassword = process.argv[3] || 'admin123'

    console.log(`🔄 Resetting password for user: ${username}\n`)

    const user = await prisma.user.findFirst({
      where: { username }
    })

    if (!user) {
      console.error(`❌ User "${username}" not found!`)
      process.exit(1)
    }

    const passwordHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockedUntil: null,
        isActive: true
      }
    })

    console.log('✅ Password reset successfully!')
    console.log(`   Username: ${username}`)
    console.log(`   New Password: ${newPassword}`)
    console.log(`   Login URL: http://localhost:3000/admin/login`)
    console.log('\n⚠️  Please change this password after logging in!\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
