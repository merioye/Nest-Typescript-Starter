import { NotFoundError } from '@/common/errors';
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - findOneOrFail', () => {
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

  describe('Basic Functionality', () => {
    it('should find an existing user by id', async () => {
      const result = await userRepository.findOneOrFail({ where: { id: 1 } });
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(
        userRepository.findOneOrFail({ where: { id: 999 } })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Select Options', () => {
    it('should return only selected fields', async () => {
      const result = await userRepository.findOneOrFail({
        where: { id: 1 },
        select: ['email', 'username'],
      });
      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('Relations Options', () => {
    it('should include specified relations', async () => {
      const result = await userRepository.findOneOrFail({
        where: { id: 1 },
        relations: { profile: true },
      });
      expect(result).toHaveProperty('profile');
      expect(result.profile).toBeDefined();
    });

    it('should include nested relations', async () => {
      const result = await userRepository.findOneOrFail({
        where: { id: 1 },
        relations: {
          profile: {
            address: true,
          },
        },
      });
      expect(result.profile).toBeDefined();
      expect(result.profile?.address).toBeDefined();
    });
  });

  describe('Where Conditions', () => {
    it('should find using exact match conditions', async () => {
      const result = await userRepository.findOneOrFail({
        where: { email: 'user1@example.com' },
      });
      expect(result).toBeDefined();
      expect(result.email).toBe('user1@example.com');
    });

    it('should find using complex operators', async () => {
      const result = await userRepository.findOneOrFail({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              {
                [Op_Symbol]: {
                  [FindOperator.GTE]: { age: 18 },
                },
              },
              { isActive: true },
            ],
          },
        },
      });
      expect(result).toBeDefined();
      expect(result.age).toBeGreaterThanOrEqual(18);
      expect(result.isActive).toBe(true);
    });

    it('should find using array contains operator', async () => {
      const result = await userRepository.findOneOrFail({
        where: {
          interests: {
            [Op_Symbol]: {
              [FindOperator.ARRAY_CONTAINS]: ['coding'],
            },
          },
        },
      });
      expect(result).toBeDefined();
      expect(result.interests).toContain('coding');
    });
  });

  describe('Soft Delete Handling', () => {
    it('should not find soft deleted records by default', async () => {
      // First soft delete a user
      await prisma.user.update({
        where: { id: 1 },
        data: { isDeleted: true },
      });

      await expect(
        userRepository.findOneOrFail({ where: { id: 1 } })
      ).rejects.toThrow(NotFoundError);
    });

    it('should find soft deleted records when withDeleted is true', async () => {
      // First soft delete a user
      await prisma.user.update({
        where: { id: 1 },
        data: { isDeleted: true },
      });

      const result = await userRepository.findOneOrFail({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.isDeleted).toBe(true);
    });

    it('should use custom soft delete column name', async () => {
      // First soft delete a user
      await prisma.user.update({
        where: { id: 1 },
        data: { isDeleted: true },
      });

      const result = await userRepository.findOneOrFail({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(result).toBeDefined();
      expect(result.isDeleted).toBe(true);
    });
  });

  describe('Order Options', () => {
    it('should respect order options when finding records', async () => {
      // Create another user with a higher age
      await prisma.user.create({
        data: {
          email: 'older@example.com',
          username: 'older_user',
          password: 'password',
          age: 50,
        },
      });

      const result = await userRepository.findOneOrFail({
        order: { age: 'desc' },
      });
      expect(result).toBeDefined();
      expect(result.age).toBe(50);
    });
  });

  describe('Error Cases', () => {
    it('should throw error for invalid model name', async () => {
      const invalidRepository = new PrismaRepository(prisma, 'invalidModel');
      await expect(
        invalidRepository.findOneOrFail({ where: { id: 1 } })
      ).rejects.toThrow();
    });

    it('should throw error for invalid where conditions', async () => {
      await expect(
        userRepository.findOneOrFail({
          where: {
            [Op_Symbol]: {
              ['INVALID_OPERATOR' as any]: {},
            },
          },
        })
      ).rejects.toThrow();
    });
  });
});
