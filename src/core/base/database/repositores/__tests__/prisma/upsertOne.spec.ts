/* eslint-disable jest/no-conditional-expect */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator, UpdateOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - upsertOne', () => {
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
    // Get a test user for upsert operations
    existingUser = (await userRepository.findOne({
      where: { email: 'john@example.com' },
    })) as User;
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Create Scenarios', () => {
    it('should create a new user when no matching record exists', async () => {
      const email = `test-${Date.now()}@example.com`;
      const result = await userRepository.upsertOne({
        where: { email },
        create: {
          email,
          username: `testuser-${Date.now()}`,
          password: 'hashedPassword123',
          firstName: 'John',
          lastName: 'Doe',
          age: 25,
          isActive: true,
          role: Role.USER,
          interests: ['coding', 'testing'],
          isDeleted: false,
        },
        update: {
          firstName: 'Updated',
          lastName: 'Name',
        },
      });

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.firstName).toBe('John'); // Should use create data
      expect(result.lastName).toBe('Doe'); // Should use create data
      expect(result.age).toBe(25);
      expect(result.interests).toEqual(['coding', 'testing']);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a new user with minimal required fields', async () => {
      const email = `test-${Date.now()}@example.com`;
      const result = await userRepository.upsertOne({
        where: { email },
        create: {
          email,
          username: `testuser-${Date.now()}`,
          password: 'hashedPassword123',
          role: Role.USER,
        },
        update: {},
      });

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.role).toBe(Role.USER);
    });
  });

  describe('Update Scenarios', () => {
    it('should update an existing user', async () => {
      const result = await userRepository.upsertOne({
        where: { id: existingUser.id },
        create: {
          email: 'shouldnotbeused@example.com',
          username: 'shouldnotbeused',
          password: 'unused',
          role: Role.USER,
        },
        update: {
          firstName: 'Updated',
          lastName: 'Name',
          age: 35,
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(existingUser.id);
      expect(result.email).toBe(existingUser.email); // Should remain unchanged
      expect(result.username).toBe(existingUser.username); // Should remain unchanged
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
      expect(result.age).toBe(35);
    });

    it('should update with update operators', async () => {
      const result = await userRepository.upsertOne({
        where: { id: existingUser.id },
        create: {
          email: 'shouldnotbeused@example.com',
          username: 'shouldnotbeused',
          password: 'unused',
          role: Role.USER,
        },
        update: {
          [Op_Symbol]: {
            [UpdateOperator.INC]: { age: 5 },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.age).toBe((existingUser.age as number) + 5);
    });
  });

  describe('Options and Edge Cases', () => {
    it('should handle select options', async () => {
      const result = await userRepository.upsertOne({
        where: { id: existingUser.id },
        create: {
          email: 'unused@example.com',
          username: 'unused',
          password: 'unused',
          role: Role.USER,
        },
        update: {
          firstName: 'Selected',
        },
        options: {
          select: ['id', 'firstName', 'email'],
        },
      });

      expect(result).toBeDefined();
      expect(Object.keys(result)).toHaveLength(3);
      expect(result.id).toBeDefined();
      expect(result.firstName).toBe('Selected');
      expect(result.email).toBeDefined();
      expect(result.lastName).toBeUndefined();
    });

    it('should handle relations options', async () => {
      const result = await userRepository.upsertOne({
        where: { id: existingUser.id },
        create: {
          email: 'unused@example.com',
          username: 'unused',
          password: 'unused',
          role: Role.USER,
        },
        update: {
          firstName: 'WithRelations',
        },
        options: {
          relations: {
            profile: true,
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.firstName).toBe('WithRelations');
      expect(result.profile).toBeDefined();
      expect(result.profile?.bio).toBeDefined();
    });

    it('should handle complex where conditions', async () => {
      const result = await userRepository.upsertOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { email: existingUser.email },
              { isActive: true },
            ],
          },
        },
        create: {
          email: 'unused@example.com',
          username: 'unused',
          password: 'unused',
          role: Role.USER,
        },
        update: {
          firstName: 'ComplexWhere',
        },
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(existingUser.id);
      expect(result.firstName).toBe('ComplexWhere');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when creating with duplicate unique fields', async () => {
      await expect(
        userRepository.upsertOne({
          where: { email: 'nonexistent@example.com' },
          create: {
            email: existingUser.email, // Using existing email
            username: `testuser-${Date.now()}`,
            password: 'hashedPassword123',
            role: Role.USER,
          },
          update: {},
        })
      ).rejects.toThrow();
    });

    it('should throw error when updating with invalid data', async () => {
      await expect(
        userRepository.upsertOne({
          where: { id: existingUser.id },
          create: {
            email: 'unused@example.com',
            username: 'unused',
            password: 'unused',
            role: Role.USER,
          },
          update: {
            role: 'INVALID_ROLE' as Role, // Invalid enum value
          },
        })
      ).rejects.toThrow();
    });
  });
});
