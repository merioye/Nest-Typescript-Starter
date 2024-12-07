/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - softDeleteMany', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;
  let existingUsers: User[];

  beforeAll(() => {
    prisma = prismaClient;
    userRepository = new PrismaRepository<User>(prisma, 'user');
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedDatabase(prisma);
    // Get test users for soft delete operations
    existingUsers = await userRepository.findMany({
      where: { isActive: true },
    });
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Soft Delete Operations', () => {
    it('should successfully soft delete multiple users by condition', async () => {
      const result = await userRepository.softDeleteMany({
        where: { isActive: true },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBe(existingUsers.length);

      // Verify users are soft deleted (should not be found in normal queries)
      const softDeletedUsers = await userRepository.findMany({
        where: { isActive: true },
      });
      expect(softDeletedUsers.length).toBe(0);

      // Verify users still exist in database with deletedAt field
      const softDeletedUsersWithDeleted = await userRepository.findMany({
        where: { isActive: true },
        withDeleted: true,
      });
      expect(softDeletedUsersWithDeleted.length).toBe(existingUsers.length);
      softDeletedUsersWithDeleted.forEach((user) => {
        expect(user.isDeleted).toBe(true);
      });
    });

    it('should return empty array when no users match delete criteria', async () => {
      const result = await userRepository.softDeleteMany({
        where: { email: 'nonexistent@example.com' },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should soft delete users using complex where conditions', async () => {
      const result = await userRepository.softDeleteMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { isActive: true },
              {
                [Op_Symbol]: {
                  [FindOperator.OR]: [
                    { email: existingUsers[0]?.email },
                    { email: existingUsers[1]?.email },
                  ],
                },
              },
            ],
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(2);

      // Verify specific users are soft deleted
      const softDeletedUsers = await userRepository.findMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              { email: existingUsers[0]?.email },
              { email: existingUsers[1]?.email },
            ],
          },
        },
      });
      expect(softDeletedUsers.length).toBe(0);
    });
  });

  describe('Soft Delete with Options', () => {
    it('should soft delete with select options', async () => {
      const result = await userRepository.softDeleteMany({
        where: { isActive: true },
        options: {
          select: ['id', 'email', 'username'],
        },
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.username).toBeDefined();
        expect(user.firstName).toBeUndefined();
        expect(user.lastName).toBeUndefined();
      });
    });

    it('should soft delete with relation options', async () => {
      const result = await userRepository.softDeleteMany({
        where: { isActive: true },
        options: {
          relations: {
            posts: true,
            comments: true,
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.posts).toBeDefined();
        expect(Array.isArray(user.posts)).toBe(true);
        expect(user.comments).toBeDefined();
        expect(Array.isArray(user.comments)).toBe(true);
      });
    });

    it('should soft delete with orderBy option', async () => {
      const result = await userRepository.softDeleteMany({
        where: { isActive: true },
        options: {
          order: { email: 'desc' },
        },
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      // Verify ordering
      const emails = result.map((user) => user.email);
      const sortedEmails = [...emails].sort((a, b) => b.localeCompare(a));
      expect(emails).toEqual(sortedEmails);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty where clause', async () => {
      const result = await userRepository.softDeleteMany({});
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle null values in where clause', async () => {
      const result = await userRepository.softDeleteMany({
        where: { email: null },
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle invalid where conditions gracefully', async () => {
      await expect(
        userRepository.softDeleteMany({
          where: { nonExistentField: 'value' } as any,
        })
      ).rejects.toThrow();
    });
  });
});
