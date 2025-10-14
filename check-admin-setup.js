const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('CHECKING ADMIN SYSTEM SETUP');
    console.log('═══════════════════════════════════════════════════\n');

    // Check if User table has any records
    const userCount = await prisma.user.count();
    console.log(`👥 Total users in database: ${userCount}\n`);

    if (userCount === 0) {
      console.log('⚠️  NO USERS FOUND!\n');
      console.log('You need to create an admin user first.\n');
      console.log('Options:');
      console.log('1. Create user via script (I can help with this)');
      console.log('2. Create user via API endpoint');
      console.log('3. Manually insert into database\n');
    } else {
      console.log('✓ Users exist! Listing them:\n');

      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          mfaEnabled: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      console.table(users.map(u => ({
        Username: u.username,
        Email: u.email,
        Role: u.role,
        Active: u.isActive ? 'Yes' : 'No',
        MFA: u.mfaEnabled ? 'Yes' : 'No',
        Created: u.createdAt.toISOString().split('T')[0]
      })));

      console.log('\n📝 To login, use:');
      console.log('   URL: https://thewordsrecord.com/admin/login');
      console.log('   (or http://localhost:3000/admin/login in dev)\n');
    }

    // Check for login API
    console.log('Checking for login API endpoint...');
    const fs = require('fs');
    const loginApiExists = fs.existsSync('pages/api/auth/login.ts') ||
                          fs.existsSync('pages/api/auth/login.js');

    if (loginApiExists) {
      console.log('✓ Login API endpoint exists\n');
    } else {
      console.log('⚠️  Login API endpoint is MISSING!');
      console.log('   Expected at: pages/api/auth/login.ts');
      console.log('   This needs to be created for login to work\n');
    }

    // Check API key count
    const apiKeyCount = await prisma.apiKey.count();
    console.log(`🔑 Total API keys: ${apiKeyCount}`);

    const activeApiKeys = await prisma.apiKey.count({
      where: { isActive: true }
    });
    console.log(`   Active: ${activeApiKeys}\n`);

    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
