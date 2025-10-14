const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    const newPassword = 'admin123'
    const passwordHash = await bcrypt.hash(newPassword, 10)

    const admin = await prisma.user.update({
      where: { username: 'admin' },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockedUntil: null,
        isActive: true
      }
    })

    console.log('✅ Password reset successfully!')
    console.log('\n🔑 Admin Login Credentials:')
    console.log('  Username: admin')
    console.log('  Password: admin123')
    console.log('  Email: ' + admin.email)
    console.log('\n⚠️  IMPORTANT: Change this password immediately after logging in!')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
