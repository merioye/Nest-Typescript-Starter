import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository', () => {
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

  describe('PrismaRepository - findMany', () => {
    describe('Basic Queries', () => {
      it('should find users with simple where clause', async () => {
        const users = await userRepository.findMany({
          where: { isActive: true },
        });
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
      });

      it('should find users with multiple conditions', async () => {
        const users = await userRepository.findMany({
          where: {
            isActive: true,
            age: { [Op_Symbol]: { [FindOperator.GT]: 18 } },
          },
        });
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
      });
    });

    describe('Relation Loading', () => {
      it('should load simple relations', async () => {
        const users = await userRepository.findMany({
          where: { isActive: true },
          relations: {
            profile: true,
            posts: true,
          },
        });
        expect(users[0]?.profile).toBeDefined();
        expect(Array.isArray(users[0]?.posts)).toBe(true);
      });

      it('should load nested relations', async () => {
        const users = await userRepository.findMany({
          where: { isActive: true },
          relations: {
            profile: {
              address: true,
            },
            posts: {
              comments: true,
            },
          },
        });
        expect(users[0]?.profile?.address).toBeDefined();
        expect(Array.isArray(users[0]?.posts[0]?.comments)).toBe(true);
      });

      it('should load specific relation fields', async () => {
        const users = await userRepository.findMany({
          where: { isActive: true },
          relations: {
            profile: ['bio', 'avatarUrl'],
            posts: ['title', 'content'],
          },
        });
        expect(users[0]?.profile?.bio).toBeDefined();
        expect(users[0]?.posts[0]?.title).toBeDefined();
      });
    });

    describe('Complex Operators', () => {
      it('should handle AND conditions', async () => {
        const users = await userRepository.findMany({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                { isActive: true },
                {
                  [Op_Symbol]: {
                    [FindOperator.GT]: { age: 25 },
                  },
                },
              ],
            },
          },
        });
        expect(Array.isArray(users)).toBe(true);
      });

      it('should handle OR conditions', async () => {
        const users = await userRepository.findMany({
          where: {
            [Op_Symbol]: {
              [FindOperator.OR]: [
                { isActive: true },
                {
                  [Op_Symbol]: {
                    [FindOperator.GT]: { age: 30 },
                  },
                },
              ],
            },
          },
        });
        expect(Array.isArray(users)).toBe(true);
      });

      it('should handle nested relation conditions', async () => {
        const users = await userRepository.findMany({
          where: {
            profile: {
              [Op_Symbol]: {
                [FindOperator.AND]: [
                  {
                    [Op_Symbol]: {
                      [FindOperator.LIKE]: { bio: '%developer%' },
                    },
                  },
                  {
                    socialLinks: {
                      [Op_Symbol]: {
                        [FindOperator.NOT_NULL]: { twitter: true },
                      },
                    },
                  },
                ],
              },
            },
          },
        });
        expect(Array.isArray(users)).toBe(true);
      });

      it('should support both field-level and root-level operators', async () => {
        const users = await userRepository.findMany({
          where: {
            // Field-level operator
            age: { [Op_Symbol]: { [FindOperator.GT]: 18 } },
            email: 'john@example.com',
            // Root-level operator
            [Op_Symbol]: {
              [FindOperator.OR]: [{ isActive: true }],
            },
          },
        });
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
      });

      it('should support multiple field-level operators', async () => {
        const users = await userRepository.findMany({
          where: {
            age: { [Op_Symbol]: { [FindOperator.BETWEEN]: [18, 65] } },
            createdAt: {
              [Op_Symbol]: { [FindOperator.GT]: new Date('2023-01-01') },
            },
            email: { [Op_Symbol]: { [FindOperator.LIKE]: '%@example.com' } },
          },
        });
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
      });
    });

    describe('Array Operations', () => {
      it('should find users with array contains on primitive string array', async () => {
        const users = await userRepository.findMany({
          where: {
            interests: {
              [Op_Symbol]: {
                [FindOperator.ARRAY_CONTAINS]: 'coding',
              },
            },
          },
        });
        expect(Array.isArray(users)).toBe(true);
        expect(users[0]?.interests).toContain('coding');
      });
    });

    describe('Pagination and Ordering', () => {
      it('should return correct number of users with take parameter', async () => {
        const users = await userRepository.findMany({
          limit: 5,
        });
        expect(users).toHaveLength(5);
      });

      it('should skip correct number of users with skip parameter', async () => {
        const firstBatch = await userRepository.findMany({
          limit: 5,
          order: { email: 'asc' },
        });

        const secondBatch = await userRepository.findMany({
          skip: 5,
          limit: 5,
          order: { email: 'asc' },
        });

        expect(firstBatch).toHaveLength(5);
        expect(secondBatch).toHaveLength(5);
        expect(firstBatch[0]?.email).not.toBe(secondBatch[0]?.email);
      });

      it('should handle pagination with filtering', async () => {
        const adminUsers = await userRepository.findMany({
          where: { role: Role.ADMIN },
          limit: 3,
          skip: 1,
          order: { email: 'asc' },
        });

        expect(adminUsers.length).toBeLessThanOrEqual(3);
        expect(adminUsers.every((user) => user.role === Role.ADMIN)).toBe(true);
      });

      it('should handle pagination with relations', async () => {
        const usersWithPosts = await userRepository.findMany({
          limit: 5,
          skip: 2,
          relations: {
            posts: true,
          },
          order: { email: 'asc' },
        });

        expect(usersWithPosts).toHaveLength(5);
        expect(usersWithPosts[0]?.posts).toBeDefined();
      });

      it('should handle edge case with skip larger than dataset', async () => {
        const users = await userRepository.findMany({
          skip: 1000,
          limit: 5,
        });

        expect(users).toHaveLength(0);
      });

      it('should handle pagination with complex ordering', async () => {
        const users = await userRepository.findMany({
          limit: 5,
          order: {
            age: 'desc',
            email: 'asc',
          },
        });

        expect(users).toHaveLength(5);
        // Verify age ordering
        for (let i = 1; i < users.length; i++) {
          expect(users[i]?.age).toBeLessThanOrEqual(
            users[i - 1]?.age as number
          );
        }
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty result', async () => {
        const users = await userRepository.findMany({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [{ isActive: false }, { isDeleted: true }],
            },
          },
        });
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(0);
      });

      it('should handle all null fields', async () => {
        const users = await userRepository.findMany({
          where: {
            firstName: null,
            lastName: null,
            age: null,
          },
        });
        expect(Array.isArray(users)).toBe(true);
      });
    });
  });
});
