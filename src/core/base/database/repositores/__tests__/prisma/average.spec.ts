import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - average', () => {
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

  describe('Basic Average Operations', () => {
    it('should calculate average of all user ages', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
      });
      expect(parseInt(`${avg || 0}`)).toBe(30); // Average of seeded user ages
    });

    it('should calculate average ages with where condition', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: { age: 30 },
      });
      expect(avg).toBe(30); // Average of two users with age 30
    });

    it('should return null when no matching records', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: { age: 999 },
      });
      expect(avg).toBeNull();
    });
  });

  describe('Complex Where Conditions', () => {
    it('should calculate average with AND operator', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [{ role: Role.USER }, { age: 30 }],
          },
        },
      });
      expect(avg).toBe(30); // One user with role USER and age 30
    });

    it('should calculate average with OR operator', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [{ age: 25 }, { age: 30 }],
          },
        },
      });
      expect(parseInt(`${avg || 0}`)).toBe(28); // Average of all users with age 25 or 30
    });

    it('should calculate average with GT operator', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.GT]: { age: 25 },
          },
        },
      });
      expect(parseInt(`${avg || 0}`)).toBe(32); // Average of ages > 25
    });

    it('should calculate average with LTE operator', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.LTE]: { age: 25 },
          },
        },
      });
      expect(avg).toBe(23); // Average of ages <= 25
    });

    it('should calculate average with BETWEEN operator', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.BETWEEN]: { age: [24, 26] },
          },
        },
      });
      expect(avg).toBe(25); // Average of ages between 24 and 26 (one user with age 25)
    });

    it('should calculate average with IN operator', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.IN]: { age: [25, 30] },
          },
        },
      });
      expect(avg).toBe(28.333333333333332); // Average of ages in [25, 30]
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database', async () => {
      await clearDatabase(prisma);
      const avg = await userRepository.average({
        columnName: 'age',
      });
      expect(avg).toBeNull();
    });

    it('should handle complex nested conditions returning no results', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              {
                [Op_Symbol]: {
                  [FindOperator.GT]: { age: 30 },
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.LT]: { age: 30 },
                },
              },
            ],
          },
        },
      });
      expect(avg).toBeNull();
    });

    it('should handle multiple numeric conditions', async () => {
      const avg = await userRepository.average({
        columnName: 'age',
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              {
                [Op_Symbol]: {
                  [FindOperator.GTE]: { age: 25 },
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.LTE]: { age: 30 },
                },
              },
            ],
          },
        },
      });
      expect(avg).toBe(27.875); // Average of all users (all fall within range)
    });
  });
});
