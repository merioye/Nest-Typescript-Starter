import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - findById', () => {
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
    it('should find a user by id with default options', async () => {
      const user = await userRepository.findById<'id'>(1);
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.email).toBe('john@example.com');
    });

    it('should return null for non-existent id', async () => {
      const user = await userRepository.findById<'id'>(999);
      expect(user).toBeNull();
    });

    it('should throw error for invalid id type', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(userRepository.findById('invalid' as any)).rejects.toThrow();
    });
  });

  describe('Select Options', () => {
    it('should find user with specific field selection', async () => {
      const user = await userRepository.findById<'id'>(1, {
        select: ['email', 'firstName'],
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('john@example.com');
      expect(user?.firstName).toBe('John');
      expect(user?.lastName).toBeUndefined();
    });

    it('should find user with computed fields', async () => {
      const user = await userRepository.findById<'id'>(1, {
        select: ['email', 'firstName', 'lastName'],
      });
      expect(user).toBeDefined();
      expect(user?.firstName).toBe('John');
      expect(user?.lastName).toBe('Doe');
    });
  });

  describe('Relation Options', () => {
    it('should find user with single relation', async () => {
      const user = await userRepository.findById<'id'>(1, {
        relations: { posts: true },
      });
      expect(user).toBeDefined();
      expect(Array.isArray(user?.posts)).toBe(true);
      expect(user?.posts.length).toBeGreaterThan(0);
    });

    it('should find user with nested relations', async () => {
      const user = await userRepository.findById<'id'>(1, {
        relations: {
          posts: {
            comments: true,
          },
        },
      });
      expect(user).toBeDefined();
      expect(user?.posts[0]?.comments).toBeDefined();
    });

    it('should find user with multiple relations', async () => {
      const user = await userRepository.findById<'id'>(1, {
        relations: {
          posts: true,
          profile: true,
        },
      });
      expect(user).toBeDefined();
      expect(user?.posts).toBeDefined();
      expect(user?.profile).toBeDefined();
    });
  });

  describe('Soft Delete Handling', () => {
    beforeEach(async () => {
      await prisma.user.update({
        where: { id: 1 },
        data: { isDeleted: true },
      });
    });

    it('should not find soft deleted user by default', async () => {
      const user = await userRepository.findById<'id'>(1);
      expect(user).toBeNull();
    });

    it('should find soft deleted user when withDeleted is true', async () => {
      const user = await userRepository.findById<'id'>(1, {
        withDeleted: true,
      });
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
    });
  });

  describe('Combined Options', () => {
    it('should find user with select and relations', async () => {
      const user = await userRepository.findById<'id'>(1, {
        select: ['email', 'firstName'],
        relations: {
          posts: true,
        },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('john@example.com');
      expect(user?.lastName).toBeUndefined();
      expect(Array.isArray(user?.posts)).toBe(true);
    });

    it('should find deleted user with select and relations', async () => {
      await prisma.user.update({
        where: { id: 1 },
        data: { isDeleted: true },
      });

      const user = await userRepository.findById<'id'>(1, {
        select: ['email', 'firstName'],
        relations: {
          posts: true,
        },
        withDeleted: true,
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('john@example.com');
      expect(Array.isArray(user?.posts)).toBe(true);
    });
  });
});
