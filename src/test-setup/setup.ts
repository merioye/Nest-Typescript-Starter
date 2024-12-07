import { prismaClient } from '@/database/clients/prisma';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  try {
    // Verify database connection
    await prismaClient.$connect();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Test setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  await prismaClient.$disconnect();
});
