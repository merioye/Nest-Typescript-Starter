import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';
import { PartialDeep } from 'type-fest';

import { Role, User } from '@/types';

import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - insertOne', () => {
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

  it('should successfully insert a complete user entity', async () => {
    const email = `test-${Date.now()}@example.com`;
    const inputData: PartialDeep<User> = {
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
    };

    const result = await userRepository.insertOne(inputData);

    // Verify the insertion was successful
    const insertedUser = await userRepository.findOne({
      where: { email },
    });

    expect(insertedUser).toBeDefined();
    expect(insertedUser?.email).toBe(email);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.email).toBe(inputData.email);
    expect(result.username).toBe(inputData.username);
    expect(result.firstName).toBe(inputData.firstName);
    expect(result.lastName).toBe(inputData.lastName);
    expect(result.age).toBe(inputData.age);
    expect(result.isActive).toBe(inputData.isActive);
    expect(result.role).toBe(inputData.role);
    expect(result.interests).toEqual(inputData.interests);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should successfully insert with only required fields', async () => {
    const email = `test-${Date.now()}@example.com`;
    const inputData: PartialDeep<User> = {
      email,
      username: `testuser-${Date.now()}`,
      password: 'hashedPassword123',
      isActive: true,
      role: Role.USER,
      isDeleted: false,
    };

    const result = await userRepository.insertOne(inputData);

    // Verify the insertion was successful
    const insertedUser = await userRepository.findOne({
      where: { email },
    });

    expect(insertedUser).toBeDefined();
    expect(insertedUser?.email).toBe(email);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.email).toBe(inputData.email);
    expect(result.username).toBe(inputData.username);
    expect(result.isActive).toBe(inputData.isActive);
    expect(result.role).toBe(inputData.role);
    expect(result.firstName).toBeNull();
    expect(result.lastName).toBeNull();
    expect(result.age).toBeNull();
    expect(result.interests).toEqual([]);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error when inserting duplicate email', async () => {
    const email = `test-${Date.now()}@example.com`;
    const baseData: PartialDeep<User> = {
      email,
      username: `testuser-${Date.now()}`,
      password: 'hashedPassword123',
      isActive: true,
      role: Role.USER,
      isDeleted: false,
    };

    // First insertion should succeed
    await userRepository.insertOne(baseData);

    // Second insertion with same email should fail
    await expect(
      userRepository.insertOne({
        ...baseData,
        username: `testuser-${Date.now()}-2`,
      })
    ).rejects.toThrow();
  });

  describe('Transaction handling', () => {
    it('should rollback changes on transaction failure', async () => {
      const email = `test-${Date.now()}@example.com`;
      const inputData: PartialDeep<User> = {
        email,
        username: `testuser-${Date.now()}`,
        password: 'hashedPassword123',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      };

      const transaction = await userRepository.beginTransaction();

      try {
        // First insertion in transaction
        await userRepository.insertOne(inputData);

        // Second insertion with same email should fail and trigger rollback
        await userRepository.insertOne({
          ...inputData,
          username: `testuser-${Date.now()}-2`,
        });

        await userRepository.commitTransaction(transaction);
      } catch (error) {
        await userRepository.rollbackTransaction(transaction);
      }

      // Verify the first insertion was rolled back
      const result = await userRepository.findOne({ where: { email } });
      expect(result).toBeNull();
    });

    it('should successfully commit multiple insertions in a transaction', async () => {
      const timestamp = Date.now();
      const firstUser: PartialDeep<User> = {
        email: `test-1-${timestamp}@example.com`,
        username: `testuser-1-${timestamp}`,
        password: 'hashedPassword123',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      };

      const secondUser: PartialDeep<User> = {
        email: `test-2-${timestamp}@example.com`,
        username: `testuser-2-${timestamp}`,
        password: 'hashedPassword456',
        isActive: true,
        role: Role.MODERATOR,
        isDeleted: false,
      };

      const transaction = await userRepository.beginTransaction();

      try {
        // Insert multiple users in the same transaction
        const user1 = await userRepository.insertOne(firstUser);
        const user2 = await userRepository.insertOne(secondUser);

        await userRepository.commitTransaction(transaction);

        // Verify both users were inserted
        const result1 = await userRepository.findOne({
          where: { email: firstUser.email },
        });
        const result2 = await userRepository.findOne({
          where: { email: secondUser.email },
        });

        expect(result1).toBeDefined();
        expect(result1?.id).toBe(user1.id);
        expect(result1?.email).toBe(firstUser.email);
        expect(result1?.role).toBe(Role.USER);

        expect(result2).toBeDefined();
        expect(result2?.id).toBe(user2.id);
        expect(result2?.email).toBe(secondUser.email);
        expect(result2?.role).toBe(Role.MODERATOR);
      } catch (error) {
        await userRepository.rollbackTransaction(transaction);
        throw error;
      }
    });
  });
});
