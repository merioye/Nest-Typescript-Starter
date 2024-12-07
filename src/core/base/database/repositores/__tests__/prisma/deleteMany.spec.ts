/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - deleteMany', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;

  beforeAll(() => {
    prisma = prismaClient;
    userRepository = new PrismaRepository<User>(prisma, 'user');
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedDatabase(prisma);
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Delete Operations', () => {
    it('should successfully delete multiple users by role', async () => {
      const result = await userRepository.deleteMany({
        where: { role: Role.ADMIN },
      });

      expect(result.length).toBeGreaterThan(0);

      // Verify the users are deleted
      const remainingAdmins = await userRepository.findMany({
        where: { role: Role.ADMIN },
      });
      expect(remainingAdmins).toHaveLength(0);
    });

    it('should return empty array when no users match the criteria', async () => {
      const result = await userRepository.deleteMany({
        where: { age: 999 },
      });

      expect(result).toHaveLength(0);
    });

    it('should delete users with age greater than specified value', async () => {
      const result = await userRepository.deleteMany({
        where: {
          age: {
            [Op_Symbol]: {
              [FindOperator.GT]: 30,
            },
          },
        },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.age).toBeGreaterThan(30);
      });

      // Verify no users exist with age > 30
      const remainingUsers = await userRepository.findMany({
        where: {
          age: {
            [Op_Symbol]: {
              [FindOperator.GT]: 30,
            },
          },
        },
      });
      expect(remainingUsers).toHaveLength(0);
    });
  });

  describe('Complex Where Conditions', () => {
    it('should delete users using AND operator', async () => {
      const result = await userRepository.deleteMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { role: Role.ADMIN },
              {
                [Op_Symbol]: {
                  [FindOperator.GT]: { age: 25 },
                },
              },
            ],
          },
        },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.role).toBe(Role.ADMIN);
        expect(user.age).toBeGreaterThan(25);
      });
    });

    it('should delete users using OR operator', async () => {
      const result = await userRepository.deleteMany({
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              { email: 'john@example.com' },
              { email: 'jane@example.com' },
            ],
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result.map((user) => user.email)).toEqual(
        expect.arrayContaining(['john@example.com', 'jane@example.com'])
      );
    });

    it('should delete users using array contains operator', async () => {
      const result = await userRepository.deleteMany({
        where: {
          interests: {
            [Op_Symbol]: {
              [FindOperator.ARRAY_CONTAINS]: ['coding'],
            },
          },
        },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.interests).toContain('coding');
      });
    });
  });

  describe('Delete with Options', () => {
    it('should delete with select options', async () => {
      const result = await userRepository.deleteMany({
        where: { role: Role.ADMIN },
        options: {
          select: ['id', 'email', 'username'],
        },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(Object.keys(user)).toEqual(['id', 'email', 'username']);
        expect(user.firstName).toBeUndefined();
        expect(user.lastName).toBeUndefined();
      });
    });

    it('should delete with relation options', async () => {
      const result = await userRepository.deleteMany({
        where: { role: Role.ADMIN },
        options: {
          relations: {
            profile: true,
          },
        },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.profile).toBeDefined();
        expect(user.profile?.bio).toBeDefined();
      });
    });

    it('should delete with nested relation options', async () => {
      const result = await userRepository.deleteMany({
        where: { role: Role.ADMIN },
        options: {
          relations: {
            profile: {
              address: true,
            },
          },
        },
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((user) => {
        expect(user.profile).toBeDefined();
        expect(user.profile?.address).toBeDefined();
        expect(user.profile?.address?.street).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty where clause', async () => {
      const allUsersBefore = await userRepository.findMany();
      const result = await userRepository.deleteMany({});

      expect(result.length).toBe(allUsersBefore.length);

      const allUsersAfter = await userRepository.findMany();
      expect(allUsersAfter).toHaveLength(0);
    });

    it('should handle undefined options', async () => {
      const result = await userRepository.deleteMany(undefined);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle invalid where conditions gracefully', async () => {
      const result = await userRepository.deleteMany({
        where: {
          nonExistentField: 'value',
        } as any,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
