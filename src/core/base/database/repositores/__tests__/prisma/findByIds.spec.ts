import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - findByIds', () => {
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

  describe('Basic Queries', () => {
    it('should find users by single id', async () => {
      const users = await userRepository.findByIds<'id'>([1]);
      expect(users).toHaveLength(1);
      expect(users[0]?.email).toBe('john@example.com');
    });

    it('should find users by multiple ids', async () => {
      const users = await userRepository.findByIds<'id'>([1, 2]);
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.email)).toContain('john@example.com');
      expect(users.map((u) => u.email)).toContain('jane@example.com');
    });

    it('should return empty array for non-existent ids', async () => {
      const users = await userRepository.findByIds<'id'>([999, 1000]);
      expect(users).toHaveLength(0);
    });

    it('should return empty array for empty ids array', async () => {
      const users = await userRepository.findByIds<'id'>([]);
      expect(users).toHaveLength(0);
    });
  });

  describe('Select Fields', () => {
    it('should select specific fields', async () => {
      const users = await userRepository.findByIds<'id'>([1], {
        select: ['email', 'firstName', 'lastName'],
      });
      expect(users).toHaveLength(1);
      expect(Object.keys(users[0]!)).toHaveLength(3);
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).toHaveProperty('firstName');
      expect(users[0]).toHaveProperty('lastName');
      expect(users[0]).not.toHaveProperty('password');
    });
  });

  describe('Include Relations', () => {
    it('should include profile relation', async () => {
      const users = await userRepository.findByIds<'id'>([1], {
        relations: { profile: true },
      });
      expect(users).toHaveLength(1);
      expect(users[0]?.profile).toBeDefined();
      expect(users[0]?.profile?.bio).toBe(
        'Software developer and book enthusiast'
      );
    });

    it('should include nested profile and address relations', async () => {
      const users = await userRepository.findByIds<'id'>([1], {
        relations: {
          profile: {
            address: true,
          },
        },
      });
      expect(users).toHaveLength(1);
      expect(users[0]?.profile?.address).toBeDefined();
      expect(users[0]?.profile?.address?.city).toBe('New York');
    });

    it('should include posts relation with specific fields', async () => {
      const users = await userRepository.findByIds<'id'>([1], {
        relations: { posts: ['title', 'content'] },
      });
      expect(users).toHaveLength(1);
      expect(Array.isArray(users[0]?.posts)).toBe(true);
      expect(users[0]?.posts[0]).toHaveProperty('title');
      expect(users[0]?.posts[0]).toHaveProperty('content');
      expect(users[0]?.posts[0]).not.toHaveProperty('published');
    });
  });

  describe('Ordering', () => {
    it('should respect order option with multiple ids', async () => {
      const users = await userRepository.findByIds<'id'>([1, 2], {
        order: { age: 'desc' },
      });
      expect(users).toHaveLength(2);
      expect(users[0]?.age).toBeGreaterThanOrEqual(users[1]?.age as number);
    });

    it('should order by multiple fields', async () => {
      const users = await userRepository.findByIds<'id'>([1, 2, 3], {
        order: { username: 'asc', age: 'desc' },
      });
      expect(users.length).toBeGreaterThan(0);
      const prevUser = users[0];
      for (let i = 1; i < users.length; i++) {
        const currentUser = users[i];
        if (prevUser?.role === currentUser?.role) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(prevUser?.age).toBeGreaterThanOrEqual(
            currentUser?.age as number
          );
        } else {
          const prevUsername = prevUser?.username || '';
          const currentUsername = currentUser?.username || '';
          // eslint-disable-next-line jest/no-conditional-expect
          expect(prevUsername <= currentUsername).toBe(true);
        }
      }
    });
  });

  describe('Pagination', () => {
    it('should apply skip and limit options', async () => {
      const users = await userRepository.findByIds<'id'>([1, 2, 3], {
        skip: 1,
        limit: 1,
      });
      expect(users).toHaveLength(1);
    });

    it('should handle skip larger than result set', async () => {
      const users = await userRepository.findByIds<'id'>([1, 2], {
        skip: 5,
      });
      expect(users).toHaveLength(0);
    });

    it('should handle limit larger than result set', async () => {
      const users = await userRepository.findByIds<'id'>([1], {
        limit: 10,
      });
      expect(users).toHaveLength(1);
    });
  });

  describe('Soft Delete', () => {
    beforeEach(async () => {
      // Soft delete John Doe
      await prisma.user.update({
        where: { email: 'john@example.com' },
        data: { isDeleted: true },
      });
    });

    it('should not find soft deleted users by default', async () => {
      const users = await userRepository.findByIds<'id'>([1]);
      expect(users).toHaveLength(0);
    });

    it('should find soft deleted users when withDeleted is true', async () => {
      const users = await userRepository.findByIds<'id'>([1], {
        withDeleted: true,
      });
      expect(users).toHaveLength(1);
      expect(users[0]?.isDeleted).toBe(true);
    });

    it('should find mix of deleted and non-deleted users', async () => {
      const users = await userRepository.findByIds<'id'>([1, 2], {
        withDeleted: true,
      });
      expect(users).toHaveLength(2);
      const deletedUser = users.find((u) => u.email === 'john@example.com');
      const activeUser = users.find((u) => u.email === 'jane@example.com');
      expect(deletedUser?.isDeleted).toBe(true);
      expect(activeUser?.isDeleted).toBe(false);
    });
  });

  describe('Combined Options', () => {
    it('should combine select, relations, order, and pagination', async () => {
      const users = await userRepository.findByIds<'id'>([1, 2, 3], {
        select: ['id', 'email', 'firstName'],
        relations: { profile: true },
        order: { email: 'desc' },
        skip: 1,
        limit: 1,
      });
      expect(users).toHaveLength(1);
      expect(Object.keys(users[0]!)).toHaveLength(4); // id, email, firstName, profile
      expect(users[0]?.profile).toBeDefined();
    });

    it('should combine withDeleted with other options', async () => {
      await prisma.user.update({
        where: { email: 'john@example.com' },
        data: { isDeleted: true },
      });

      const users = await userRepository.findByIds<'id'>([1, 2], {
        select: ['id', 'email', 'isDeleted'],
        order: { email: 'asc' },
        withDeleted: true,
      });
      expect(users).toHaveLength(2);
      expect(users.some((u) => u.isDeleted)).toBe(true);
      expect(users.some((u) => !u.isDeleted)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      await prisma.$disconnect();
      await expect(userRepository.findByIds([1])).rejects.toThrow();
      await prisma.$connect();
    });

    it('should handle invalid id types gracefully', async () => {
      await expect(userRepository.findByIds(['invalid'])).rejects.toThrow();
    });
  });
});
