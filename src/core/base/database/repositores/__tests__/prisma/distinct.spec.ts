import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - distinct', () => {
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

  it('should return distinct values for a field', async () => {
    const distinctRoles = await userRepository.distinct('role');
    expect(distinctRoles).toEqual(['ADMIN', 'USER']);
    expect(distinctRoles.length).toBe(2);
  });

  it('should return distinct values with where condition', async () => {
    const distinctAges = await userRepository.distinct('age', {
      where: { role: Role.ADMIN },
    });
    expect(distinctAges).toContain(30);
    expect(distinctAges).toContain(28);
  });

  it('should handle pagination with skip and take', async () => {
    const distinctInterests = await userRepository.distinct('interests', {
      skip: 1,
      limit: 2,
    });
    expect(distinctInterests.length).toBeLessThanOrEqual(2);
  });

  it('should handle ordering of distinct values', async () => {
    const distinctAges = await userRepository.distinct('age', {
      order: { age: 'desc' },
    });

    // Verify the array is sorted in descending order
    const sortedAges = [...distinctAges].sort(
      (a, b) => (b as number) - (a as number)
    );
    expect(distinctAges).toEqual(sortedAges);
  });

  it('should respect soft delete when fetching distinct values', async () => {
    // First soft delete a user
    await prisma.user.update({
      where: { email: 'john@example.com' },
      data: { isDeleted: true },
    });

    // Get distinct values excluding soft deleted
    const distinctEmailsWithoutDeleted = await userRepository.distinct('email');
    expect(distinctEmailsWithoutDeleted).not.toContain('john@example.com');

    // Get distinct values including soft deleted
    const distinctEmailsWithDeleted = await userRepository.distinct('email', {
      withDeleted: true,
    });
    expect(distinctEmailsWithDeleted).toContain('john@example.com');
  });

  it('should handle array fields correctly', async () => {
    const distinctInterests = await userRepository.distinct('interests');
    expect(distinctInterests).toEqual(
      expect.arrayContaining(['coding', 'reading', 'traveling', 'photography'])
    );
  });

  it('should handle empty result set', async () => {
    const distinctValues = await userRepository.distinct('email', {
      where: { email: 'nonexistent@example.com' },
    });
    expect(distinctValues).toEqual([]);
  });

  it('should combine multiple conditions in where clause', async () => {
    const distinctNames = await userRepository.distinct('firstName', {
      where: {
        age: { [Op_Symbol]: { [FindOperator.GT]: 25 } },
        role: Role.ADMIN,
      },
    });
    expect(distinctNames).toContain('John');
    expect(distinctNames).toContain('Jane');
  });

  it('should handle case sensitivity in distinct values', async () => {
    // Create test users with similar but differently cased emails
    await prisma.user.create({
      data: {
        email: 'TEST@example.com',
        username: 'test_user',
        password: 'password789',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
        role: Role.USER,
      },
    });

    const distinctEmails = await userRepository.distinct('email');
    expect(distinctEmails).toContain('TEST@example.com');
    expect(distinctEmails).toContain('test@example.com');
  });

  it('should throw error for invalid field name', async () => {
    await expect(
      userRepository.distinct('nonexistentField' as any)
    ).rejects.toThrow();
  });
});
