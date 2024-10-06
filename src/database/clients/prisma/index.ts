import { PrismaClient } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const db = new PrismaClient();
