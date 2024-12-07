/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { Op_Symbol, SoftDeleteDefaultColumnName } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - restoreMany', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;
  let softDeletedUsers: User[];

  beforeAll(() => {
    prisma = prismaClient;
    userRepository = new PrismaRepository<User>(prisma, 'user');
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedDatabase(prisma);

    // Soft delete some users first for restoration tests
    await userRepository.softDeleteMany({
      where: { isActive: true },
    });

    // Get test users that were soft deleted
    softDeletedUsers = await userRepository.findMany({
      where: { isActive: true, isDeleted: true },
    });
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Restore Operations', () => {
    it('should successfully restore multiple soft-deleted users by condition', async () => {
      const result = await userRepository.restoreMany({
        where: { isActive: true },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBe(softDeletedUsers.length);

      // Verify users are restored (should be found in normal queries)
      const restoredUsers = await userRepository.findMany({
        where: { isActive: true },
      });
      expect(restoredUsers.length).toBe(softDeletedUsers.length);

      // Verify isDeleted flag is set to false
      restoredUsers.forEach((user) => {
        expect(user[SoftDeleteDefaultColumnName]).toBe(false);
      });
    });

    it('should return empty array when no users match restore criteria', async () => {
      const result = await userRepository.restoreMany({
        where: { email: 'nonexistent@example.com' },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should restore users using complex where conditions', async () => {
      const result = await userRepository.restoreMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { isActive: true },
              {
                [Op_Symbol]: {
                  [FindOperator.OR]: [
                    { email: softDeletedUsers[0]?.email },
                    { email: softDeletedUsers[1]?.email },
                  ],
                },
              },
            ],
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(2);

      // Verify specific users are restored
      const restoredUsers = await userRepository.findMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              { email: softDeletedUsers[0]?.email },
              { email: softDeletedUsers[1]?.email },
            ],
          },
        },
      });
      expect(restoredUsers.length).toBe(2);
      restoredUsers.forEach((user) => {
        expect(user[SoftDeleteDefaultColumnName]).toBe(false);
      });
    });
  });

  describe('Options Handling', () => {
    it('should restore users with select options', async () => {
      const result = await userRepository.restoreMany({
        where: { isActive: true },
        options: {
          select: ['id', 'email', 'isActive'],
        },
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(Object.keys(user)).toEqual(
          expect.arrayContaining(['id', 'email', 'isActive'])
        );
      });
    });

    it('should restore users with relation options', async () => {
      const result = await userRepository.restoreMany({
        where: { isActive: true },
        options: {
          relations: {
            posts: true,
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user).toHaveProperty('posts');
        expect(Array.isArray(user.posts)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty where clause', async () => {
      const result = await userRepository.restoreMany({});
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle restoring already active users', async () => {
      // First restore all users
      await userRepository.restoreMany({
        where: { isActive: true },
      });

      // Try to restore again
      const result = await userRepository.restoreMany({
        where: { isActive: true },
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should still return the users, but they should already be restored
      result.forEach((user) => {
        expect(user[SoftDeleteDefaultColumnName]).toBe(false);
      });
    });

    it('should handle undefined options', async () => {
      const result = await userRepository.restoreMany({
        where: { isActive: true },
        options: undefined,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid where conditions gracefully', async () => {
      await expect(
        userRepository.restoreMany({
          where: { invalidField: 'value' } as any,
        })
      ).rejects.toThrow();
    });
  });
});
