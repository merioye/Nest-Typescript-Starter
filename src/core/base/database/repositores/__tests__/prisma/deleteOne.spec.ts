import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - deleteOne', () => {
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
    // Get a test user for delete operations
    existingUser = (await userRepository.findOne({
      where: { email: 'john@example.com' },
    })) as User;
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Delete Operations', () => {
    it('should successfully delete a user by id', async () => {
      const result = await userRepository.deleteOne({
        where: { id: existingUser.id },
      });

      expect(result).toBeDefined();
      expect(result?.id).toBe(existingUser.id);

      // Verify the user is deleted
      const deletedUser = await userRepository.findOne({
        where: { id: existingUser.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should return null when deleting non-existent user', async () => {
      const result = await userRepository.deleteOne({
        where: { id: 999999 },
      });

      expect(result).toBeNull();
    });

    it('should delete user using complex where conditions', async () => {
      const result = await userRepository.deleteOne({
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

      // Verify the user is deleted
      const deletedUser = await userRepository.findOne({
        where: { id: existingUser.id },
      });
      expect(deletedUser).toBeNull();
    });
  });

  describe('Delete with Options', () => {
    it('should delete with select options', async () => {
      const result = await userRepository.deleteOne({
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

    it('should delete with relation options', async () => {
      const result = await userRepository.deleteOne({
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
});
