/* eslint-disable jest/no-conditional-expect */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';
import { PartialDeep } from 'type-fest';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator, UpdateOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - updateMany', () => {
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
    // Get existing users from the database
    existingUsers = await userRepository.findMany({
      where: {
        email: {
          [Op_Symbol]: {
            [FindOperator.IN]: [
              'john@example.com',
              'jane@example.com',
              'user1@example.com',
            ],
          },
        },
      },
    });
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Update Operations', () => {
    it('should successfully update multiple users with complete data', async () => {
      const updateData: PartialDeep<User> = {
        isActive: false,
        role: Role.USER,
      };

      const result = await userRepository.updateMany({
        where: { role: Role.ADMIN },
        update: updateData,
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.isActive).toBe(false);
        expect(user.role).toBe(Role.USER);
      });
    });

    it('should return empty array when no users match the criteria', async () => {
      const result = await userRepository.updateMany({
        where: { age: 999 },
        update: { firstName: 'NonExistent' },
      });

      expect(result).toHaveLength(0);
    });

    it('should handle partial updates for multiple users', async () => {
      const result = await userRepository.updateMany({
        where: { role: Role.ADMIN },
        update: { interests: ['updated'] },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.interests).toEqual(['updated']);
      });
    });
  });

  describe('Update Operators', () => {
    it('should increment numeric fields for multiple users', async () => {
      const result = await userRepository.updateMany({
        where: { role: Role.ADMIN },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.INC]: { age: 5 },
          },
        },
      });

      result.forEach((user) => {
        const originalUser = existingUsers.find((u) => u.id === user.id);
        expect(user.age).toBe((originalUser?.age || 0) + 5);
      });
    });

    it('should decrement numeric fields for multiple users', async () => {
      const result = await userRepository.updateMany({
        where: { role: Role.ADMIN },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.DEC]: { age: 3 },
          },
        },
      });

      result.forEach((user) => {
        const originalUser = existingUsers.find((u) => u.id === user.id);
        expect(user.age).toBe((originalUser?.age || 0) - 3);
      });
    });

    it('should multiply numeric fields for multiple users', async () => {
      const result = await userRepository.updateMany({
        where: { role: Role.ADMIN },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.MUL]: { age: 2 },
          },
        },
      });

      result.forEach((user) => {
        const originalUser = existingUsers.find((u) => u.id === user.id);
        expect(user.age).toBe((originalUser?.age || 0) * 2);
      });
    });
  });

  describe('Advanced Options', () => {
    it('should update with select options', async () => {
      const result = await userRepository.updateMany({
        where: { role: Role.ADMIN },
        update: { firstName: 'Selected' },
        options: {
          select: ['id', 'firstName', 'email'],
        },
      });

      result.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('firstName', 'Selected');
        expect(user).toHaveProperty('email');
        expect(user).not.toHaveProperty('lastName');
        expect(user).not.toHaveProperty('age');
      });
    });

    it('should throw error when update options are missing', async () => {
      await expect(userRepository.updateMany()).rejects.toThrow(
        'Update options are required'
      );
    });

    it('should handle complex where conditions', async () => {
      const result = await userRepository.updateMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { [Op_Symbol]: { [FindOperator.GTE]: { age: 25 } } },
              { role: Role.ADMIN },
            ],
          },
        },
        update: { firstName: 'Complex' },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.firstName).toBe('Complex');
        expect(user.age).toBeGreaterThanOrEqual(25);
        expect(user.role).toBe(Role.ADMIN);
      });
    });

    it('should update with relations options', async () => {
      const result = await userRepository.updateMany({
        where: { role: Role.ADMIN },
        update: { firstName: 'WithRelations' },
        options: {
          relations: {
            profile: {
              address: true,
            },
          },
        },
      });

      result.forEach((user) => {
        expect(user.firstName).toBe('WithRelations');
        expect(user).toHaveProperty('profile');
        expect(user.profile).toHaveProperty('address');
      });
    });
  });
});
