import { prisma } from '../lib/prisma';

async function verify() {
  try {
    const user = await prisma.user.findFirst();
    console.log('User query result:', user ? user.email : 'No user found');
    console.log('Connected');
  } catch (error) {
    console.error('Failed to connect to Prisma Postgres:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
