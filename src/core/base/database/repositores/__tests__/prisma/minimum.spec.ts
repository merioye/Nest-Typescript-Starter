import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - minimum', () => {
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

  describe('Basic Minimum Queries', () => {
    it('should find minimum age', async () => {
      const minAge = await userRepository.minimum({
        columnName: 'age',
      });
      expect(minAge).toBe(25); // Assuming Jane is 25 in seed data
    });

    it('should return null for empty result set', async () => {
      const minAge = await userRepository.minimum({
        columnName: 'age',
        where: { age: 0 },
      });
      expect(minAge).toBeNull();
    });
  });

  describe('Minimum with Where Conditions', () => {
    it('should find minimum age with basic where condition', async () => {
      const minAge = await userRepository.minimum({
        columnName: 'age',
        where: { role: Role.USER },
      });
      expect(minAge).toBeDefined();
    });

    it('should find minimum age with complex where condition using AND', async () => {
      const minAge = await userRepository.minimum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { role: Role.USER },
              {
                [Op_Symbol]: {
                  [FindOperator.GT]: { age: 20 },
                },
              },
            ],
          },
        },
      });
      expect(minAge).toBeDefined();
    });

    it('should find minimum age with OR condition', async () => {
      const minAge = await userRepository.minimum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [{ role: Role.ADMIN }, { role: Role.USER }],
          },
        },
      });
      expect(minAge).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-existent column name', async () => {
      await expect(
        userRepository.minimum({
          // @ts-expect-error Testing invalid column
          columnName: 'nonexistentColumn',
        })
      ).rejects.toThrow();
    });

    it('should handle null values in the column', async () => {
      // First create a user with null age
      await prisma.user.create({
        data: {
          email: 'nullage@example.com',
          firstName: 'Null',
          lastName: 'Age',
          role: Role.USER,
          age: null,
          username: 'null-age',
          password: 'hashedPassword123',
        },
      });

      const minAge = await userRepository.minimum({
        columnName: 'age',
      });
      expect(minAge).toBeDefined();
      expect(minAge).not.toBeNull();
    });
  });

  describe('Complex Queries', () => {
    it('should find minimum age with multiple conditions', async () => {
      const minAge = await userRepository.minimum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { role: Role.USER },
              {
                [Op_Symbol]: {
                  [FindOperator.GT]: { age: 20 },
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.LT]: { age: 40 },
                },
              },
            ],
          },
        },
      });
      expect(minAge).toBeDefined();
      expect(typeof minAge).toBe('number');
    });

    it('should find minimum age with nested conditions', async () => {
      const minAge = await userRepository.minimum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              {
                [Op_Symbol]: {
                  [FindOperator.AND]: [
                    { role: Role.USER },
                    {
                      [Op_Symbol]: {
                        [FindOperator.GT]: { age: 25 },
                      },
                    },
                  ],
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.AND]: [
                    { role: Role.ADMIN },
                    {
                      [Op_Symbol]: {
                        [FindOperator.LT]: { age: 35 },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      expect(minAge).toBeDefined();
      expect(typeof minAge).toBe('number');
    });
  });
});
