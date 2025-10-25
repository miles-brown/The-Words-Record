import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setAdminPassword() {
  try {
    const newPassword = 'admin123'

    console.log('🔐 Setting admin password...\n')

    // Hash the password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update admin user
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockedUntil: null,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true
      }
    })

    console.log('✅ Admin password updated successfully!\n')
    console.log('User details:')
    console.log(`  Username: ${updatedUser.username}`)
    console.log(`  Email: ${updatedUser.email}`)
    console.log(`  Active: ${updatedUser.isActive ? '✅ Yes' : '❌ No'}`)
    console.log(`  Locked: ${updatedUser.lockedUntil ? '🔒 Yes' : '🔓 No'}`)
    console.log(`  Login Attempts: ${updatedUser.loginAttempts}`)
    console.log('\n🎉 You can now log in with your new password!\n')

  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('❌ Error: Admin user not found!')
      console.log('   Run: npm run create-admin')
    } else {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

setAdminPassword()
