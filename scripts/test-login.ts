import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!user) {
      console.log('No user found in database. Will use fallback credentials.');
      console.log('Try logging in with:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      return;
    }

    console.log('Testing password hashes...\n');

    // Test common passwords
    const testPasswords = [
      'admin',
      'admin123',
      'password',
      'Password123',
      'Admin123',
    ];

    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      console.log(`Password "${testPassword}": ${isValid ? '✓ VALID' : '✗ Invalid'}`);
      if (isValid) {
        console.log(`\n✓ SUCCESS! Use this password: ${testPassword}`);
        return;
      }
    }

    console.log('\nNone of the common passwords worked.');
    console.log('You may need to reset the password using set-admin-password.ts');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
