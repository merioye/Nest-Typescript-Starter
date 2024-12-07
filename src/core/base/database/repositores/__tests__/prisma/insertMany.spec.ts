import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';
import { PartialDeep } from 'type-fest';

import { Role, User } from '@/types';

import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - insertMany', () => {
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

  it('should successfully insert multiple complete user entities', async () => {
    const email1 = `test-1-${Date.now()}@example.com`;
    const email2 = `test-2-${Date.now()}@example.com`;
    const users: PartialDeep<User>[] = [
      {
        email: email1,
        username: `testuser-1-${Date.now()}`,
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        isActive: true,
        role: Role.USER,
        interests: ['coding', 'testing'],
        isDeleted: false,
      },
      {
        email: email2,
        username: `testuser-2-${Date.now()}`,
        password: 'hashedPassword456',
        firstName: 'Jane',
        lastName: 'Smith',
        age: 30,
        isActive: true,
        role: Role.ADMIN,
        interests: ['management', 'design'],
        isDeleted: false,
      },
    ];

    const result = await userRepository.insertMany(users);
    const insertedUser1 = await userRepository.findOne({
      where: { email: email1 },
    });
    const insertedUser2 = await userRepository.findOne({
      where: { email: email2 },
    });

    expect(insertedUser1).toBeDefined();
    expect(insertedUser2).toBeDefined();
    expect(insertedUser1?.email).toBe(email1);
    expect(insertedUser2?.email).toBe(email2);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBeDefined();
    expect(result[1]?.id).toBeDefined();

    // Verify first user
    expect(result[0]?.email).toBe(users[0]?.email);
    expect(result[0]?.username).toBe(users[0]?.username);
    expect(result[0]?.firstName).toBe(users[0]?.firstName);
    expect(result[0]?.lastName).toBe(users[0]?.lastName);
    expect(result[0]?.age).toBe(users[0]?.age);
    expect(result[0]?.isActive).toBe(users[0]?.isActive);
    expect(result[0]?.role).toBe(users[0]?.role);
    expect(result[0]?.interests).toEqual(users[0]?.interests);
    expect(result[0]?.createdAt).toBeInstanceOf(Date);
    expect(result[0]?.updatedAt).toBeInstanceOf(Date);

    // Verify second user
    expect(result[1]?.email).toBe(users[1]?.email);
    expect(result[1]?.username).toBe(users[1]?.username);
    expect(result[1]?.firstName).toBe(users[1]?.firstName);
    expect(result[1]?.lastName).toBe(users[1]?.lastName);
    expect(result[1]?.age).toBe(users[1]?.age);
    expect(result[1]?.isActive).toBe(users[1]?.isActive);
    expect(result[1]?.role).toBe(users[1]?.role);
    expect(result[1]?.interests).toEqual(users[1]?.interests);
    expect(result[1]?.createdAt).toBeInstanceOf(Date);
    expect(result[1]?.updatedAt).toBeInstanceOf(Date);
  });

  it('should successfully insert multiple entities with only required fields', async () => {
    const email1 = `test-1-${Date.now()}@example.com`;
    const email2 = `test-2-${Date.now()}@example.com`;
    const users: PartialDeep<User>[] = [
      {
        email: email1,
        username: `testuser-1-${Date.now()}`,
        password: 'hashedPassword123',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
      {
        email: email2,
        username: `testuser-2-${Date.now()}`,
        password: 'hashedPassword456',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
    ];

    const result = await userRepository.insertMany(users);
    const insertedUser1 = await userRepository.findOne({
      where: { email: email1 },
    });
    const insertedUser2 = await userRepository.findOne({
      where: { email: email2 },
    });

    expect(insertedUser1).toBeDefined();
    expect(insertedUser2).toBeDefined();
    expect(insertedUser1?.email).toBe(email1);
    expect(insertedUser2?.email).toBe(email2);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBeDefined();
    expect(result[1]?.id).toBeDefined();

    // Verify first user
    expect(result[0]?.email).toBe(users[0]?.email);
    expect(result[0]?.username).toBe(users[0]?.username);
    expect(result[0]?.isActive).toBe(users[0]?.isActive);
    expect(result[0]?.role).toBe(users[0]?.role);
    expect(result[0]?.firstName).toBeNull();
    expect(result[0]?.lastName).toBeNull();
    expect(result[0]?.age).toBeNull();
    expect(result[0]?.interests).toEqual([]);
    expect(result[0]?.createdAt).toBeInstanceOf(Date);
    expect(result[0]?.updatedAt).toBeInstanceOf(Date);

    // Verify second user
    expect(result[1]?.email).toBe(users[1]?.email);
    expect(result[1]?.username).toBe(users[1]?.username);
    expect(result[1]?.isActive).toBe(users[1]?.isActive);
    expect(result[1]?.role).toBe(users[1]?.role);
    expect(result[1]?.firstName).toBeNull();
    expect(result[1]?.lastName).toBeNull();
    expect(result[1]?.age).toBeNull();
    expect(result[1]?.interests).toEqual([]);
    expect(result[1]?.createdAt).toBeInstanceOf(Date);
    expect(result[1]?.updatedAt).toBeInstanceOf(Date);
  });

  it('should successfully insert a single entity in array', async () => {
    const users: PartialDeep<User>[] = [
      {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        isActive: true,
        role: Role.USER,
        interests: ['coding'],
        isDeleted: false,
      },
    ];

    const result = await userRepository.insertMany(users);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBeDefined();
    expect(result[0]?.email).toBe(users[0]?.email);
    expect(result[0]?.username).toBe(users[0]?.username);
    expect(result[0]?.firstName).toBe(users[0]?.firstName);
    expect(result[0]?.lastName).toBe(users[0]?.lastName);
    expect(result[0]?.age).toBe(users[0]?.age);
    expect(result[0]?.isActive).toBe(users[0]?.isActive);
    expect(result[0]?.role).toBe(users[0]?.role);
    expect(result[0]?.interests).toEqual(users[0]?.interests);
  });

  it('should return empty array when inserting empty array', async () => {
    const result = await userRepository.insertMany([]);
    expect(result).toEqual([]);
  });

  it('should throw error when inserting duplicate emails', async () => {
    const email = `test-${Date.now()}@example.com`;
    const users: PartialDeep<User>[] = [
      {
        email,
        username: `testuser-1-${Date.now()}`,
        password: 'hashedPassword123',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
      {
        email, // Same email
        username: `testuser-2-${Date.now()}`,
        password: 'hashedPassword456',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
    ];

    await expect(userRepository.insertMany(users)).rejects.toThrow();
  });

  it('should handle transaction rollback on error', async () => {
    const email = `test-${Date.now()}@example.com`;
    const users: PartialDeep<User>[] = [
      {
        email: `unique-${Date.now()}@example.com`,
        username: `testuser-1-${Date.now()}`,
        password: 'hashedPassword123',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
      {
        email, // Will be duplicate after first transaction
        username: `testuser-2-${Date.now()}`,
        password: 'hashedPassword456',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
    ];

    // First insert a user with the same email
    await userRepository.insertOne({
      email,
      username: `testuser-original-${Date.now()}`,
      password: 'hashedPassword789',
      isActive: true,
      role: Role.USER,
      isDeleted: false,
    });

    const transaction = await userRepository.beginTransaction();

    try {
      await userRepository.insertMany(users);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }

    // Verify the first user was not inserted due to rollback
    const uniqueUser = await userRepository.findOne({
      where: { email: users[0]?.email },
    });
    expect(uniqueUser).toBeNull();
  });

  it('should throw error when inserting invalid data', async () => {
    const users: PartialDeep<User>[] = [
      {
        email: 'invalid-email', // Invalid email format
        username: `testuser-${Date.now()}`,
        password: 'hashedPassword123',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
    ];

    await expect(userRepository.insertMany(users)).rejects.toThrow();
  });

  it('should throw error when required fields are missing', async () => {
    const users: PartialDeep<User>[] = [
      {
        // Missing email
        username: `testuser-${Date.now()}`,
        password: 'hashedPassword123',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
    ];

    await expect(userRepository.insertMany(users)).rejects.toThrow();
  });

  it('should successfully handle transaction for multiple inserts', async () => {
    const email1 = `test-1-${Date.now()}@example.com`;
    const email2 = `test-2-${Date.now()}@example.com`;
    const users: PartialDeep<User>[] = [
      {
        email: email1,
        username: `testuser-1-${Date.now()}`,
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
      {
        email: email2,
        username: `testuser-2-${Date.now()}`,
        password: 'hashedPassword456',
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
        role: Role.USER,
        isDeleted: false,
      },
    ];

    const transaction = await userRepository.beginTransaction();

    try {
      const result = await userRepository.insertMany(users);
      await transaction.commit();

      // Verify both users were inserted
      const insertedUser1 = await userRepository.findOne({
        where: { email: email1 },
      });
      const insertedUser2 = await userRepository.findOne({
        where: { email: email2 },
      });

      expect(result).toHaveLength(2);
      expect(insertedUser1).toBeDefined();
      expect(insertedUser2).toBeDefined();
      expect(insertedUser1?.email).toBe(email1);
      expect(insertedUser2?.email).toBe(email2);
      expect(insertedUser1?.firstName).toBe(users[0]?.firstName);
      expect(insertedUser2?.firstName).toBe(users[1]?.firstName);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });
});
