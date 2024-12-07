import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - sum', () => {
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

  describe('Basic Sum Operations', () => {
    it('should sum all user ages', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
      });
      expect(sum).toBe(85); // Total of seeded user ages (30 + 25 + 30)
    });

    it('should sum ages with where condition', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
        where: { age: 30 },
      });
      expect(sum).toBe(60); // Two users with age 30
    });

    it('should return 0 when no matching records', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
        where: { age: 999 },
      });
      expect(sum).toBe(0);
    });
  });

  describe('Complex Where Conditions', () => {
    it('should sum with AND operator', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [{ role: Role.USER }, { age: 30 }],
          },
        },
      });
      expect(sum).toBe(30); // One user with role USER and age 30
    });

    it('should sum with OR operator', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [{ age: 25 }, { age: 30 }],
          },
        },
      });
      expect(sum).toBe(85); // All users with age 25 or 30
    });

    it('should sum with GT operator', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.GT]: { age: 25 },
          },
        },
      });
      expect(sum).toBe(60); // Sum of ages > 25 (two users with age 30)
    });

    it('should sum with LTE operator', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.LTE]: { age: 25 },
          },
        },
      });
      expect(sum).toBe(25); // Sum of ages <= 25 (one user with age 25)
    });
  });

  describe('Soft Delete Handling', () => {
    beforeEach(async () => {
      // Soft delete one user
      await prisma.user.update({
        where: { email: 'john@example.com' },
        data: { isDeleted: true },
      });
    });

    it('should exclude soft deleted records by default', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
      });
      expect(sum).toBe(55); // Total excluding soft deleted user
    });

    it('should include soft deleted records when specified', async () => {
      const sum = await userRepository.sum({
        columnName: 'age',
        where: { isDeleted: true },
      });
      expect(sum).toBe(85); // Total including soft deleted user
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty table', async () => {
      await clearDatabase(prisma);
      const sum = await userRepository.sum({
        columnName: 'age',
      });
      expect(sum).toBe(0);
    });

    it('should handle null values in numeric column', async () => {
      // Create a user with null age
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

      const sum = await userRepository.sum({
        columnName: 'age',
      });
      expect(sum).toBe(85); // Should ignore null values in sum
    });
  });
});
