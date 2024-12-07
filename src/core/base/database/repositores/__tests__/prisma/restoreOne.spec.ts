import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - restoreOne', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;
  let softDeletedUser: User;

  beforeAll(() => {
    prisma = prismaClient;
    userRepository = new PrismaRepository<User>(prisma, 'user');
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedDatabase(prisma);
    // Get a test user and soft delete it for restore operations
    const user = await userRepository.findOne({
      where: { email: 'john@example.com' },
    });
    softDeletedUser = (await userRepository.softDeleteOne({
      where: { id: user?.id },
    })) as User;
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Restore Operations', () => {
    it('should successfully restore a soft deleted user by id', async () => {
      const result = await userRepository.restoreOne({
        where: { id: softDeletedUser.id },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(softDeletedUser.id);

      // Verify the user is restored (should be found in normal queries)
      const restoredUser = await userRepository.findOne({
        where: { id: softDeletedUser.id },
      });
      expect(restoredUser).toBeDefined();
      expect(restoredUser?.isDeleted).toBe(false);
    });

    it('should throw error when restoring non-existent user', async () => {
      await expect(
        userRepository.restoreOne({
          where: { id: 999999 },
        })
      ).rejects.toThrow('Entity not found or already restored');
    });

    it('should throw error when restoring an already restored user', async () => {
      // First restore
      await userRepository.restoreOne({
        where: { id: softDeletedUser.id },
      });

      // Second restore attempt
      await expect(
        userRepository.restoreOne({
          where: { id: softDeletedUser.id },
        })
      ).rejects.toThrow('Entity not found or already restored');
    });

    it('should restore user using complex where conditions', async () => {
      const result = await userRepository.restoreOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { email: softDeletedUser.email },
              { isDeleted: true },
            ],
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(softDeletedUser.id);
      expect(result?.isDeleted).toBe(false);
    });
  });

  describe('Restore with Options', () => {
    it('should restore with select options', async () => {
      const result = await userRepository.restoreOne({
        where: { id: softDeletedUser.id },
        options: {
          select: ['id', 'email', 'username'],
        },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(softDeletedUser.id);
      expect(result?.email).toBe(softDeletedUser.email);
      expect(result?.username).toBe(softDeletedUser.username);
      expect(result?.firstName).toBeUndefined();
      expect(result?.lastName).toBeUndefined();
    });

    it('should restore with relations options', async () => {
      const result = await userRepository.restoreOne({
        where: { id: softDeletedUser.id },
        options: {
          relations: {
            profile: true,
            posts: true,
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(softDeletedUser.id);
      expect(result?.profile).toBeDefined();
      expect(result?.posts).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error with invalid where conditions', async () => {
      await expect(
        userRepository.restoreOne({
          where: {
            [Op_Symbol]: {
              ['INVALID_OPERATOR' as FindOperator]: { id: softDeletedUser.id },
            },
          },
        })
      ).rejects.toThrow();
    });
  });
});
