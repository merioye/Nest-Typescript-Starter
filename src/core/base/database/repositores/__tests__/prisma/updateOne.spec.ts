/* eslint-disable jest/no-conditional-expect */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';
import { PartialDeep } from 'type-fest';

import { User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { UpdateOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - updateOne', () => {
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
    // Get a test user for update operations
    existingUser = (await userRepository.findOne({
      where: { email: 'john@example.com' },
    })) as User;
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Update Operations', () => {
    it('should successfully update a user with complete data', async () => {
      const updateData: PartialDeep<User> = {
        firstName: 'Jane',
        lastName: 'Smith',
        age: 30,
        interests: ['reading', 'writing'],
      };

      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: updateData,
      });

      expect(result).toBeDefined();
      expect(result?.firstName).toBe(updateData.firstName);
      expect(result?.lastName).toBe(updateData.lastName);
      expect(result?.age).toBe(updateData.age);
      expect(result?.interests).toEqual(updateData.interests);
      // Verify unchanged fields
      expect(result?.email).toBe(existingUser.email);
      expect(result?.username).toBe(existingUser.username);
    });

    it('should return null when updating non-existent user', async () => {
      const result = await userRepository.updateOne({
        where: { id: 999999 },
        update: { firstName: 'NonExistent' },
      });

      expect(result).toBeNull();
    });

    it('should handle partial updates', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: { firstName: 'UpdatedName' },
      });

      expect(result).toBeDefined();
      expect(result?.firstName).toBe('UpdatedName');
      expect(result?.lastName).toBe(existingUser.lastName); // Unchanged
      expect(result?.age).toBe(existingUser.age); // Unchanged
    });
  });

  describe('Update Operators', () => {
    it('should increment numeric fields', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.INC]: { age: 5 },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.age).toBe((existingUser?.age as number) + 5);
    });

    it('should decrement numeric fields', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.DEC]: { age: 3 },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.age).toBe((existingUser.age as number) - 3);
    });

    it('should multiply numeric fields', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.MUL]: { age: 2 },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.age).toBe((existingUser.age as number) * 2);
    });

    it('should combine multiple update operators', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.INC]: { age: 5 },
            [UpdateOperator.MUL]: { age: 2 },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.age).toBe(((existingUser.age as number) + 5) * 2);
    });
  });

  describe('Advanced Options', () => {
    it('should update with select options', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: { firstName: 'Selected' },
        options: {
          select: ['id', 'firstName', 'email'],
        },
      });

      expect(result).toBeDefined();
      expect(result?.firstName).toBe('Selected');
      expect(result?.email).toBeDefined();
      expect(result?.age).toBeUndefined();
      expect(result?.lastName).toBeUndefined();
    });

    it('should update with simple relation inclusion', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: { firstName: 'WithRelations' },
        options: {
          relations: {
            profile: true,
            posts: true,
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.firstName).toBe('WithRelations');
      expect(result?.profile).toBeDefined();
      expect(Array.isArray(result?.posts)).toBe(true);
    });

    it('should update with nested relation options', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: { firstName: 'WithNestedRelations' },
        options: {
          relations: {
            profile: true,
            posts: {
              comments: {
                author: true,
              },
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.firstName).toBe('WithNestedRelations');
      expect(result?.profile).toBeDefined();
      expect(Array.isArray(result?.posts)).toBe(true);
      if (result?.posts?.length) {
        expect(Array.isArray(result.posts[0]?.comments)).toBe(true);
        if (result.posts[0]?.comments?.length) {
          expect(result.posts[0].comments[0]?.author).toBeDefined();
        }
      }
    });

    it('should update with combined select and relation options', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
        update: { firstName: 'WithSelectAndRelations' },
        options: {
          select: ['id', 'firstName', 'email'],
          relations: {
            profile: {
              select: ['bio', 'avatarUrl'],
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.firstName).toBe('WithSelectAndRelations');
      expect(result?.email).toBeDefined();
      expect(result?.age).toBeUndefined();
      expect(result?.profile).toBeDefined();
      if (result?.profile) {
        expect(result.profile).toHaveProperty('bio');
        expect(result.profile).toHaveProperty('avatarUrl');
        expect(result.profile).not.toHaveProperty('createdAt');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid update operators', async () => {
      await expect(
        userRepository.updateOne({
          where: { id: existingUser.id },
          update: {
            [Op_Symbol]: {
              ['INVALID_OPERATOR' as any]: { age: 5 },
            },
          },
        })
      ).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      // Simulate a database error by using an invalid field
      await expect(
        userRepository.updateOne({
          where: { id: existingUser.id },
          update: {
            invalidField: 'value',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should return null for empty update options', async () => {
      const result = await userRepository.updateOne({} as any);
      expect(result).toBeNull();
    });

    it('should return null for missing update data', async () => {
      const result = await userRepository.updateOne({
        where: { id: existingUser.id },
      } as any);
      expect(result).toBeNull();
    });
  });
});
