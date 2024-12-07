import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { User } from '@/types';

import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - clear', () => {
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

  describe('Basic Clear Operations', () => {
    it('should successfully clear all users from the database', async () => {
      // First verify we have users in the database
      const initialUsers = await userRepository.findMany();
      expect(initialUsers.length).toBeGreaterThan(0);

      // Clear the database
      await userRepository.clear();

      // Verify all users are deleted
      const remainingUsers = await userRepository.findMany();
      expect(remainingUsers).toHaveLength(0);
    });

    it('should not throw error when clearing an empty table', async () => {
      // First clear the database
      await userRepository.clear();

      // Try clearing again
      await expect(userRepository.clear()).resolves.not.toThrow();

      // Verify still empty
      const users = await userRepository.findMany();
      expect(users).toHaveLength(0);
    });
  });

  describe('Clear with Active Transactions', () => {
    it('should clear data within a transaction and commit successfully', async () => {
      const transaction = await userRepository.beginTransaction();

      try {
        // Clear within transaction
        await userRepository.clear();

        // Verify data still exists before commit
        const usersBeforeCommit = await prisma.user.findMany();
        expect(usersBeforeCommit.length).toBeGreaterThan(0);

        // Commit transaction
        await userRepository.commitTransaction(transaction);

        // Verify data is cleared after commit
        const usersAfterCommit = await prisma.user.findMany();
        expect(usersAfterCommit).toHaveLength(0);
      } catch (error) {
        await userRepository.rollbackTransaction(transaction);
        throw error;
      }
    });

    it('should rollback clear operation when transaction is rolled back', async () => {
      const transaction = await userRepository.beginTransaction();

      try {
        // Get initial count
        const initialUsers = await userRepository.findMany();
        const initialCount = initialUsers.length;
        expect(initialCount).toBeGreaterThan(0);

        // Clear within transaction
        await userRepository.clear();

        // Rollback transaction
        await userRepository.rollbackTransaction(transaction);

        // Verify data is restored after rollback
        const usersAfterRollback = await userRepository.findMany();
        expect(usersAfterRollback).toHaveLength(initialCount);
      } catch (error) {
        await userRepository.rollbackTransaction(transaction);
        throw error;
      }
    });
  });

  describe('Clear with Related Data', () => {
    it('should clear all user data including related records', async () => {
      // First verify we have users with related data
      const usersWithProfiles = await userRepository.findMany({
        relations: { profile: true },
      });
      expect(usersWithProfiles.some((user) => user.profile)).toBeTruthy();

      // Clear the database
      await userRepository.clear();

      // Verify all users and related data are deleted
      const remainingUsers = await userRepository.findMany({
        relations: { profile: true },
      });
      expect(remainingUsers).toHaveLength(0);
    });
  });
});
