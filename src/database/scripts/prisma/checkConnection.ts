import { PrismaClient } from '@prisma/client';

async function checkDatabaseConnection() {
  const prisma = new PrismaClient();

  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Get database version to verify query execution
    const result = (await prisma.$queryRaw`SELECT version()`) as any;
    console.log('📊 Database version:', result[0].version);

    return process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    return process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the connection check
checkDatabaseConnection();
