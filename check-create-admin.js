const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    // Check for existing admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    })

    console.log('\n📋 Existing Admin Users:')
    if (adminUsers.length === 0) {
      console.log('  ❌ No admin users found!')
      console.log('\n🔧 Creating default admin user...')

      const passwordHash = await bcrypt.hash('admin123', 10)

      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@thewordsrecord.com',
          passwordHash,
          role: 'ADMIN',
          isActive: true,
          firstName: 'Admin',
          lastName: 'User'
        }
      })

      console.log('  ✅ Admin user created!')
      console.log('\n🔑 Login Credentials:')
      console.log('  Username: admin')
      console.log('  Password: admin123')
      console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!')
    } else {
      console.log(`  ✅ Found ${adminUsers.length} admin user(s):`)
      adminUsers.forEach(user => {
        console.log(`     - ${user.username} (${user.email}) - Active: ${user.isActive}`)
      })
      console.log('\n⚠️  If you forgot your password, you need to reset it in the database.')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateAdmin()
