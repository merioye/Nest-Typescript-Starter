import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - exists', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;

  beforeAll(() => {
    prisma = prismaClient;
    userRepository = new PrismaRepository(prisma, 'user');
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedDatabase(prisma);
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Existence Checks', () => {
    it('should return true when entity exists with simple where condition', async () => {
      const exists = await userRepository.exists({
        email: 'john@example.com',
      });
      expect(exists).toBe(true);
    });

    it('should return false when entity does not exist with simple where condition', async () => {
      const exists = await userRepository.exists({
        email: 'nonexistent@example.com',
      });
      expect(exists).toBe(false);
    });

    it('should return true when checking existence by id', async () => {
      const exists = await userRepository.exists({
        id: 1,
      });
      expect(exists).toBe(true);
    });

    it('should return false when checking existence by non-existent id', async () => {
      const exists = await userRepository.exists({
        id: 999,
      });
      expect(exists).toBe(false);
    });
  });

  describe('Complex Where Conditions', () => {
    it('should handle AND operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.AND]: [{ firstName: 'John' }, { age: 30 }],
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle OR operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.OR]: [
            { email: 'john@example.com' },
            { email: 'nonexistent@example.com' },
          ],
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle GT operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.GT]: { age: 25 },
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle LT operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.LT]: { age: 35 },
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle GTE operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.GTE]: { age: 30 },
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle LTE operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.LTE]: { age: 30 },
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle LIKE operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.LIKE]: { email: '%john%' },
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle ILIKE operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.ILIKE]: { email: '%JOHN%' },
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle IN operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.IN]: { id: [1, 2, 3] },
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle BETWEEN operator correctly', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.BETWEEN]: { age: [25, 35] },
        },
      });
      expect(exists).toBe(true);
    });
  });

  describe('Complex Combinations', () => {
    it('should handle nested AND/OR combinations', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.AND]: [
            {
              [Op_Symbol]: {
                [FindOperator.OR]: [
                  { firstName: 'John' },
                  { firstName: 'Jane' },
                ],
              },
            },
            {
              [Op_Symbol]: {
                [FindOperator.GT]: { age: 25 },
              },
            },
          ],
        },
      });
      expect(exists).toBe(true);
    });

    it('should handle multiple field conditions', async () => {
      const exists = await userRepository.exists({
        [Op_Symbol]: {
          [FindOperator.AND]: [
            {
              [Op_Symbol]: {
                [FindOperator.LIKE]: { email: '%example.com' },
              },
            },
            {
              [Op_Symbol]: {
                [FindOperator.GT]: { age: 25 },
              },
            },
            { role: Role.USER },
          ],
        },
      });
      expect(exists).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty where condition', async () => {
      const exists = await userRepository.exists({});
      expect(exists).toBe(true);
    });
  });
});
