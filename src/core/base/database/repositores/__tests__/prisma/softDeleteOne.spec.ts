import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - softDeleteOne', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;
  let existingUser: User;

  beforeAll(() => {
    prisma = prismaClient;
    userRepository = new PrismaRepository<User>(prisma, 'user');
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedDatabase(prisma);
    // Get a test user for soft delete operations
    existingUser = (await userRepository.findOne({
      where: { email: 'john@example.com' },
    })) as User;
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Soft Delete Operations', () => {
    it('should successfully soft delete a user by id', async () => {
      const result = await userRepository.softDeleteOne({
        where: { id: existingUser.id },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(existingUser.id);

      // Verify the user is soft deleted (should not be found in normal queries)
      const softDeletedUser = await userRepository.findOne({
        where: { id: existingUser.id },
      });
      expect(softDeletedUser).toBeNull();

      // Verify the user still exists in database with deletedAt field
      const softDeletedUserWithDeleted = await userRepository.findOne({
        where: { id: existingUser.id },
        withDeleted: true,
      });
      expect(softDeletedUserWithDeleted).toBeDefined();
      expect(softDeletedUserWithDeleted?.isDeleted).toBe(true);
    });

    it('should return null when soft deleting non-existent user', async () => {
      const result = await userRepository.softDeleteOne({
        where: { id: 999999 },
      });

      expect(result).toBeNull();
    });

    it('should soft delete user using complex where conditions', async () => {
      const result = await userRepository.softDeleteOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { email: existingUser.email },
              { isActive: true },
            ],
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(existingUser.id);

      // Verify the user is soft deleted
      const softDeletedUser = await userRepository.findOne({
        where: { id: existingUser.id },
      });
      expect(softDeletedUser).toBeNull();
    });
  });

  describe('Soft Delete with Options', () => {
    it('should soft delete with select options', async () => {
      const result = await userRepository.softDeleteOne({
        where: { id: existingUser.id },
        options: {
          select: ['id', 'email', 'username'],
        },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(existingUser.id);
      expect(result?.email).toBe(existingUser.email);
      expect(result?.username).toBe(existingUser.username);
      expect(result?.firstName).toBeUndefined();
      expect(result?.lastName).toBeUndefined();
    });

    it('should soft delete with relation options', async () => {
      const result = await userRepository.softDeleteOne({
        where: { id: existingUser.id },
        options: {
          relations: {
            posts: true,
            comments: true,
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(existingUser.id);
      expect(result?.posts).toBeDefined();
      expect(result?.comments).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle soft delete with empty where clause', async () => {
      await expect(
        userRepository.softDeleteOne({
          where: {},
        })
      ).rejects.toThrow();
    });

    it('should handle soft delete with invalid where conditions', async () => {
      const result = await userRepository.softDeleteOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { email: 'nonexistent@example.com' },
              { isActive: true },
            ],
          },
        },
      });

      expect(result).toBeNull();
    });

    it('should not allow soft delete of already deleted user', async () => {
      // First soft delete
      await userRepository.softDeleteOne({
        where: { id: existingUser.id },
      });

      // Try to soft delete again
      const result = await userRepository.softDeleteOne({
        where: { id: existingUser.id },
      });

      expect(result).toBeNull();
    });
  });
});
