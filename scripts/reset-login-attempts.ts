import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetLoginAttempts() {
  try {
    const result = await prisma.user.updateMany({
      data: {
        loginAttempts: 0,
        lockedUntil: null
      }
    });

    console.log(`Successfully reset login attempts for ${result.count} user(s)`);

    // Show all users
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        loginAttempts: true,
        lockedUntil: true,
        isActive: true
      }
    });

    console.log('\nUser status:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}): attempts=${user.loginAttempts}, locked=${user.lockedUntil}, active=${user.isActive}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetLoginAttempts();
