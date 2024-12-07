/* eslint-disable jest/no-conditional-expect */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - increment', () => {
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

  describe('Basic Increment Operations', () => {
    it('should increment age by 1 for all users', async () => {
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.increment({
        columnName: 'age',
        value: 1,
      });

      const updatedUsers = await userRepository.findMany();
      expect(updatedUsers.length).toBe(initialUsers.length);
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) + 1);
      });
    });

    it('should increment age by specific value', async () => {
      const incrementValue = 5;
      await userRepository.increment({
        columnName: 'age',
        value: incrementValue,
      });

      const users = await userRepository.findMany();
      users.forEach((user) => {
        expect(user.age).toBeGreaterThan(20 + incrementValue - 1); // Assuming minimum initial age was 20
      });
    });

    it('should handle negative increment values', async () => {
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.increment({
        columnName: 'age',
        value: -2,
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) - 2);
      });
    });
  });

  describe('Increment with Where Conditions', () => {
    it('should increment age only for specific user', async () => {
      const targetEmail = 'john@example.com';
      const initialUser = await userRepository.findOne({
        where: { email: targetEmail },
      });
      const initialAge = initialUser!.age;

      await userRepository.increment({
        columnName: 'age',
        value: 1,
        where: { email: targetEmail },
      });

      const updatedUser = await userRepository.findOne({
        where: { email: targetEmail },
      });
      expect(updatedUser!.age).toBe((initialAge as number) + 1);

      // Verify other users were not affected
      const otherUsers = await userRepository.findMany({
        where: { email: { [Op_Symbol]: { [FindOperator.NE]: targetEmail } } },
      });
      otherUsers.forEach((user) => {
        expect(user.age).toBeLessThan((initialAge as number) + 1);
      });
    });

    it('should increment age for users matching complex conditions', async () => {
      const initialUsers = await userRepository.findMany();

      await userRepository.increment({
        columnName: 'age',
        value: 3,
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [
              { [Op_Symbol]: { [FindOperator.GT]: { age: 25 } } },
              { role: Role.USER },
            ],
          },
        },
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user) => {
        const initialUser = initialUsers.find((u) => u.id === user.id);
        if (
          initialUser?.age &&
          initialUser.age > 25 &&
          initialUser.role === Role.USER
        ) {
          expect(user.age).toBe(initialUser.age + 3);
        } else {
          expect(user.age).toBe(initialUser!.age as number);
        }
      });
    });

    it('should handle increment with no matching records', async () => {
      const initialUsers = await userRepository.findMany();

      await userRepository.increment({
        columnName: 'age',
        value: 1,
        where: { email: 'nonexistent@example.com' },
      });

      const updatedUsers = await userRepository.findMany();
      expect(updatedUsers).toEqual(initialUsers);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle zero increment value', async () => {
      const initialUsers = await userRepository.findMany();

      await userRepository.increment({
        columnName: 'age',
        value: 0,
      });

      const updatedUsers = await userRepository.findMany();
      expect(updatedUsers).toEqual(initialUsers);
    });

    it('should handle large increment values', async () => {
      const largeValue = 1000;
      await userRepository.increment({
        columnName: 'age',
        value: largeValue,
      });

      const users = await userRepository.findMany();
      users.forEach((user) => {
        expect(user.age).toBeGreaterThan(largeValue - 1);
      });
    });

    it('should handle decimal increment values', async () => {
      const initialUsers = await userRepository.findMany();
      const decimalValue = 1.5;

      await userRepository.increment({
        columnName: 'age',
        value: decimalValue,
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user, index) => {
        // For integer columns, decimal values should be rounded or truncated
        expect(user.age).toBe(
          Math.floor((initialUsers[index]?.age as number) + decimalValue)
        );
      });
    });
  });
});
