import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - countDistinct', () => {
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

  describe('Basic Counting', () => {
    it('should count distinct roles', async () => {
      const count = await userRepository.countDistinct('role');
      expect(count).toBe(2); // Assuming we have users with roles USER and ADMIN
    });

    it('should count distinct ages', async () => {
      const count = await userRepository.countDistinct('age');
      expect(count).toBe(2); // Assuming we have users aged 30 and 25
    });

    it('should return 0 when no records match criteria', async () => {
      const count = await userRepository.countDistinct('age', {
        where: { age: 999 },
      });
      expect(count).toBe(0);
    });
  });

  describe('With Where Conditions', () => {
    it('should count distinct roles with basic where clause', async () => {
      const count = await userRepository.countDistinct('role', {
        where: { age: 30 },
      });
      expect(count).toBe(1);
    });

    it('should count with AND operator', async () => {
      const count = await userRepository.countDistinct('role', {
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { role: Role.USER },
              { [Op_Symbol]: { [FindOperator.GT]: { age: 20 } } },
            ],
          },
        },
      });
      expect(count).toBe(1);
    });

    it('should count with OR operator', async () => {
      const count = await userRepository.countDistinct('email', {
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              { role: Role.ADMIN },
              { [Op_Symbol]: { [FindOperator.GT]: { age: 25 } } },
            ],
          },
        },
      });
      expect(count).toBe(2);
    });
  });

  describe('With Complex Conditions', () => {
    it('should count with nested conditions', async () => {
      const count = await userRepository.countDistinct('role', {
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              {
                [Op_Symbol]: {
                  [FindOperator.OR]: [
                    { role: Role.ADMIN },
                    { role: Role.USER },
                  ],
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.GT]: { age: 20 },
                },
              },
            ],
          },
        },
      });
      expect(count).toBe(2);
    });

    it('should count with LIKE operator', async () => {
      const count = await userRepository.countDistinct('email', {
        where: {
          [Op_Symbol]: {
            [FindOperator.LIKE]: { email: '%example.com' },
          },
        },
      });
      expect(count).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in the field being counted', async () => {
      // First create a user with null age
      await prisma.user.create({
        data: {
          email: 'null-age@example.com',
          firstName: 'Null',
          lastName: 'Age',
          role: Role.USER,
          age: null,
          username: 'null-age',
          password: 'hashedPassword123',
        },
      });

      const count = await userRepository.countDistinct('age');
      expect(count).toBe(3); // 2 distinct ages + null
    });

    it('should handle empty string values', async () => {
      // Create a user with empty string in a field
      await prisma.user.create({
        data: {
          email: 'empty@example.com',
          firstName: '',
          lastName: 'Empty',
          role: Role.USER,
          age: 40,
          username: 'empty',
          password: 'hashedPassword123',
        },
      });

      const count = await userRepository.countDistinct('firstName');
      expect(count).toBe(3); // John, Jane, and empty string
    });

    it('should handle case sensitivity in string fields', async () => {
      // Create users with different case
      await prisma.user.create({
        data: {
          email: 'case1@example.com',
          firstName: 'Test',
          lastName: 'Case',
          role: Role.USER,
          age: 40,
          username: 'test-case',
          password: 'hashedPassword123',
        },
      });
      await prisma.user.create({
        data: {
          email: 'case2@example.com',
          firstName: 'TEST',
          lastName: 'Case',
          role: Role.USER,
          age: 41,
          username: 'test-case',
          password: 'hashedPassword123',
        },
      });

      const count = await userRepository.countDistinct('firstName');
      expect(count).toBe(4); // John, Jane, Test, TEST
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle large number of records', async () => {
      // Create 100 users with 10 distinct ages
      const ages = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
      for (let i = 0; i < 100; i++) {
        await prisma.user.create({
          data: {
            email: `bulk${i}@example.com`,
            firstName: `Bulk${i}`,
            lastName: 'User',
            role: Role.USER,
            age: ages[i % 10],
            username: `bulk${i}`,
            password: 'hashedPassword123',
          },
        });
      }

      const count = await userRepository.countDistinct('age');
      expect(count).toBe(10);
    });

    it('should handle complex query with multiple conditions efficiently', async () => {
      const startTime = Date.now();
      const count = await userRepository.countDistinct('role', {
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              {
                [Op_Symbol]: {
                  [FindOperator.OR]: [
                    { role: Role.ADMIN },
                    { role: Role.USER },
                  ],
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.BETWEEN]: [20, 40],
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.LIKE]: '%example.com',
                },
              },
            ],
          },
        },
      });
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(count).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(1000); // Should execute in less than 1 second
    });
  });
});
