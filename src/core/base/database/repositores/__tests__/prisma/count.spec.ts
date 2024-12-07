/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - count', () => {
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

  describe('Basic Count Operations', () => {
    it('should count all users with no options', async () => {
      const count = await userRepository.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBe(22);
    });

    it('should count users with simple where condition', async () => {
      const count = await userRepository.count({
        where: { role: Role.ADMIN },
      });
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for non-matching conditions', async () => {
      const count = await userRepository.count({
        where: { email: 'nonexistent@example.com' },
      });
      expect(count).toBe(0);
    });
  });

  describe('Complex Where Conditions', () => {
    it('should count users using AND operator', async () => {
      const count = await userRepository.count({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { role: Role.ADMIN },
              { [Op_Symbol]: { [FindOperator.GT]: { age: 25 } } },
            ],
          },
        },
      });
      expect(count).toBeGreaterThan(0);
    });

    it('should count users using OR operator', async () => {
      const count = await userRepository.count({
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              { email: 'john@example.com' },
              { email: 'jane@example.com' },
            ],
          },
        },
      });
      expect(count).toBe(2);
    });

    it('should count users using GT operator', async () => {
      const count = await userRepository.count({
        where: {
          age: {
            [Op_Symbol]: {
              [FindOperator.GT]: 29,
            },
          },
        },
      });
      expect(count).toBeGreaterThan(0);
      expect(count).toBe(12);
    });

    it('should count users using LIKE operator', async () => {
      const count = await userRepository.count({
        where: {
          email: {
            [Op_Symbol]: {
              [FindOperator.LIKE]: '%@example.com',
            },
          },
        },
      });
      expect(count).toBeGreaterThan(0);
      expect(count).toBe(22);
    });
  });

  describe('Options Combinations', () => {
    it('should count users with select and relations options', async () => {
      const count = await userRepository.count({
        where: { role: Role.ADMIN },
        select: ['email', 'firstName'],
        relations: { profile: true },
      });
      expect(count).toBeGreaterThan(0);
    });

    it('should count users with pagination options', async () => {
      const count = await userRepository.count({
        skip: 5,
        limit: 10,
      });
      expect(count).toBeGreaterThan(0);
    });

    it('should count users with order options', async () => {
      const count = await userRepository.count({
        order: { age: 'desc' },
      });
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Soft Delete Handling', () => {
    beforeEach(async () => {
      // Soft delete some users
      await userRepository.softDeleteMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.IN]: ['john@example.com', 'jane@example.com'],
          },
        },
      });
    });

    it('should not count soft-deleted users by default', async () => {
      const count = await userRepository.count({
        where: {
          email: {
            [Op_Symbol]: {
              [FindOperator.IN]: ['john@example.com', 'jane@example.com'],
            },
          },
        },
      });
      expect(count).toBe(0);
    });

    it('should count soft-deleted users when withDeleted is true', async () => {
      const count = await userRepository.count({
        where: {
          email: {
            [Op_Symbol]: {
              [FindOperator.IN]: ['john@example.com', 'jane@example.com'],
            },
          },
        },
        withDeleted: true,
      });
      expect(count).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty where clause', async () => {
      const count = await userRepository.count({
        where: {},
      });
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should handle null values in where clause', async () => {
      const count = await userRepository.count({
        where: { email: null },
      });
      expect(typeof count).toBe('number');
      expect(count).toBe(0);
    });

    it('should handle undefined options', async () => {
      const count = await userRepository.count(undefined);
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      await prisma.$disconnect();
      await expect(userRepository.count()).rejects.toThrow();
      await prisma.$connect();
    });

    it('should handle invalid where conditions gracefully', async () => {
      await expect(
        userRepository.count({
          where: { nonExistentField: 'value' } as any,
        })
      ).rejects.toThrow();
    });
  });
});
