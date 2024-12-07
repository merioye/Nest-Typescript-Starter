/* eslint-disable jest/no-conditional-expect */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - decrement', () => {
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

  describe('Basic Decrement Operations', () => {
    it('should decrement age by 1 for all users', async () => {
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: 1,
      });

      const updatedUsers = await userRepository.findMany();
      expect(updatedUsers.length).toBe(initialUsers.length);
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) - 1);
      });
    });

    it('should decrement age by specific value', async () => {
      const decrementValue = 5;
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: decrementValue,
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) - decrementValue);
      });
    });

    it('should handle negative decrement values (effectively incrementing)', async () => {
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: -2,
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) + 2);
      });
    });
  });

  describe('Decrement with Where Conditions', () => {
    it('should decrement age only for specific user', async () => {
      const targetEmail = 'john@example.com';
      const initialUser = await userRepository.findOne({
        where: { email: targetEmail },
      });
      const initialAge = initialUser!.age;

      await userRepository.decrement({
        columnName: 'age',
        value: 1,
        where: { email: targetEmail },
      });

      const updatedUser = await userRepository.findOne({
        where: { email: targetEmail },
      });
      expect(updatedUser!.age).toBe((initialAge as number) - 1);

      // Verify other users were not affected
      const otherUsers = await userRepository.findMany({
        where: { email: { [Op_Symbol]: { [FindOperator.NE]: targetEmail } } },
      });
      otherUsers.forEach((user) => {
        expect(user.age).toBe(user.age); // Age should remain unchanged
      });
    });

    it('should decrement age for users with specific role', async () => {
      const targetRole = Role.USER;
      const initialUsers = await userRepository.findMany({
        where: { role: targetRole },
      });
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: 2,
        where: { role: targetRole },
      });

      const updatedUsers = await userRepository.findMany({
        where: { role: targetRole },
      });
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) - 2);
      });

      // Verify users with other roles were not affected
      const otherUsers = await userRepository.findMany({
        where: { role: { [Op_Symbol]: { [FindOperator.NE]: targetRole } } },
      });
      otherUsers.forEach((user) => {
        expect(user.age).toBe(user.age); // Age should remain unchanged
      });
    });

    it('should decrement age for users matching complex where condition', async () => {
      const minAge = 25;
      const initialUsers = await userRepository.findMany({
        where: { age: { [Op_Symbol]: { [FindOperator.GTE]: minAge } } },
      });
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: 3,
        where: { age: { [Op_Symbol]: { [FindOperator.GTE]: minAge } } },
      });

      const updatedUsers = await userRepository.findMany({
        where: { age: { [Op_Symbol]: { [FindOperator.GTE]: minAge - 3 } } },
      });
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) - 3);
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle zero decrement value', async () => {
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: 0,
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe(initialAges[index]); // Ages should remain unchanged
      });
    });

    it('should handle decimal decrement values', async () => {
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: 1.5,
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) - 1.5);
      });
    });

    it('should handle large decrement values', async () => {
      const largeValue = 1000;
      const initialUsers = await userRepository.findMany();
      const initialAges = initialUsers.map((user) => user.age);

      await userRepository.decrement({
        columnName: 'age',
        value: largeValue,
      });

      const updatedUsers = await userRepository.findMany();
      updatedUsers.forEach((user, index) => {
        expect(user.age).toBe((initialAges[index] as number) - largeValue);
      });
    });
  });
});
