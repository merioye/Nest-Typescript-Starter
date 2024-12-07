import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - maximum', () => {
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

  describe('Basic Maximum Queries', () => {
    it('should find maximum age', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
      });
      expect(maxAge).toBe(40); // Based on seed data (20 users with age 20+i, i<=20)
    });

    it('should return null when no records exist', async () => {
      await clearDatabase(prisma);
      const maxAge = await userRepository.maximum({
        columnName: 'age',
      });
      expect(maxAge).toBeNull();
    });
  });

  describe('Maximum with Where Conditions', () => {
    it('should find maximum age with simple where condition', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
        where: { role: Role.ADMIN },
      });
      expect(maxAge).toBeDefined();
      expect(typeof maxAge).toBe('number');
    });

    it('should find maximum age with complex where condition', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
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
      expect(maxAge).toBeDefined();
      expect(typeof maxAge).toBe('number');
    });

    it('should return null when no records match where condition', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.GT]: { age: 100 },
          },
        },
      });
      expect(maxAge).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in the column', async () => {
      // Create a user with null age
      await prisma.user.create({
        data: {
          email: 'null_age@example.com',
          username: 'null_age',
          password: 'password',
          firstName: 'Null',
          lastName: 'Age',
          age: null,
          role: Role.USER,
        },
      });

      const maxAge = await userRepository.maximum({
        columnName: 'age',
      });
      expect(maxAge).toBe(40); // Should ignore null values
    });

    it('should handle empty result set with where condition', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
        where: {
          email: 'nonexistent@example.com',
        },
      });
      expect(maxAge).toBeNull();
    });
  });

  describe('Complex Scenarios', () => {
    it('should find maximum age with OR conditions', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              { email: 'john@example.com' },
              { email: 'jane@example.com' },
            ],
          },
        },
      });
      expect(maxAge).toBe(30); // John's age from seed data
    });

    it('should find maximum age with nested conditions', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              {
                [Op_Symbol]: {
                  [FindOperator.GT]: { age: 25 },
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.LT]: { age: 35 },
                },
              },
              { role: Role.ADMIN },
            ],
          },
        },
      });
      expect(maxAge).toBeDefined();
      expect(typeof maxAge).toBe('number');
      expect(maxAge).toBeLessThan(35);
      expect(maxAge).toBeGreaterThan(25);
    });

    it('should find maximum age with BETWEEN operator', async () => {
      const maxAge = await userRepository.maximum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.BETWEEN]: { age: [25, 35] },
          },
        },
      });
      expect(maxAge).toBeDefined();
      expect(typeof maxAge).toBe('number');
      expect(maxAge).toBeLessThanOrEqual(35);
      expect(maxAge).toBeGreaterThanOrEqual(25);
    });
  });
});
