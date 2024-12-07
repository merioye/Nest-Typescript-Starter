import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import { FindOperator } from '../../../enums';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - findOne', () => {
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

  describe('Basic Queries', () => {
    it('should find a user by id', async () => {
      const user = await userRepository.findOne({
        where: { id: 1 },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('john@example.com');
    });

    it('should find a user by email', async () => {
      const user = await userRepository.findOne({
        where: { email: 'jane@example.com' },
      });
      expect(user).toBeDefined();
      expect(user?.firstName).toBe('Jane');
    });

    it('should return null when no user matches criteria', async () => {
      const user = await userRepository.findOne({
        where: { email: 'nonexistent@example.com' },
      });
      expect(user).toBeNull();
    });
  });

  describe('Complex Where Conditions', () => {
    it('should find user using AND operator', async () => {
      const user = await userRepository.findOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.AND]: [{ firstName: 'John' }, { age: 30 }],
          },
        },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('john@example.com');
    });

    it('should find user using OR operator', async () => {
      const user = await userRepository.findOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              { email: 'john@example.com' },
              { email: 'jane@example.com' },
            ],
          },
        },
      });
      expect(user).toBeDefined();
      expect(['john@example.com', 'jane@example.com']).toContain(user?.email);
    });

    it('should find user using GT operator', async () => {
      const user = await userRepository.findOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.GT]: { age: 29 },
          },
        },
      });
      expect(user).toBeDefined();
      expect(user?.age).toBe(30);
    });

    it('should find user using LIKE operator', async () => {
      const user = await userRepository.findOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.LIKE]: { email: '%jane%' },
          },
        },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('jane@example.com');
    });
  });

  describe('Select Fields', () => {
    it('should select specific fields', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        select: ['email', 'firstName', 'lastName'],
      });
      expect(user).toBeDefined();
      expect(Object.keys(user!)).toHaveLength(3);
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('Include Relations', () => {
    it('should include profile relation', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        relations: { profile: true },
      });
      expect(user).toBeDefined();
      expect(user?.profile).toBeDefined();
      expect(user?.profile?.bio).toBe('Software developer and book enthusiast');
    });

    it('should include nested profile and address relations', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        relations: {
          profile: {
            address: true,
          },
        },
      });
      expect(user).toBeDefined();
      expect(user?.profile?.address).toBeDefined();
      expect(user?.profile?.address?.city).toBe('New York');
    });

    it('should include posts relation with specific fields', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        relations: { posts: ['title', 'content'] },
      });
      expect(user).toBeDefined();
      expect(Array.isArray(user?.posts)).toBe(true);
      expect(user?.posts[0]).toHaveProperty('title');
      expect(user?.posts[0]).toHaveProperty('content');
      expect(user?.posts[0]).not.toHaveProperty('published');
    });
  });

  describe('Ordering', () => {
    it('should respect order option', async () => {
      const user = await userRepository.findOne({
        order: { age: 'desc' },
      });
      expect(user).toBeDefined();
      expect(user?.age).toBe(40); // Should get the older user first
    });
  });

  describe('Soft Delete', () => {
    beforeEach(async () => {
      // Soft delete John Doe
      await prisma.user.update({
        where: { email: 'john@example.com' },
        data: { isDeleted: true },
      });
    });

    it('should not find soft deleted users by default', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
      });
      expect(user).toBeNull();
    });

    it('should find soft deleted users when withDeleted is true', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        withDeleted: true,
      });
      expect(user).toBeDefined();
      expect(user?.isDeleted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty where clause', async () => {
      const user = await userRepository.findOne({});
      expect(user).toBeDefined();
    });

    it('should handle null values in where clause', async () => {
      const user = await userRepository.findOne({
        where: { lastName: null },
      });
      expect(user).toBeNull();
    });

    it('should handle complex nested conditions', async () => {
      const user = await userRepository.findOne({
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
                  [FindOperator.LIKE]: { email: '%@example.com' },
                },
              },
            ],
          },
        },
      });
      expect(user).toBeDefined();
    });

    it('should handle JSON field queries in relations', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        relations: { profile: true },
      });
      expect(user?.profile?.socialLinks).toBeDefined();
      expect(typeof user?.profile?.socialLinks).toBe('object');
    });
  });

  describe('Comprehensive Operator Tests', () => {
    describe('Numeric Field Operators', () => {
      // Age field tests
      it('should find users with age less than 30', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.LT]: { age: 30 },
            },
          },
        });
        expect(user?.age).toBeLessThan(30);
      });

      it('should find users with age greater than 25 and less than 35', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                { [Op_Symbol]: { [FindOperator.GT]: { age: 25 } } },
                { [Op_Symbol]: { [FindOperator.LT]: { age: 35 } } },
              ],
            },
          },
        });
        expect(user?.age).toBeGreaterThan(25);
        expect(user?.age).toBeLessThan(35);
      });

      it('should find users with age between 20 and 40', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.BETWEEN]: { age: [20, 40] },
            },
          },
        });
        expect(user?.age).toBeGreaterThanOrEqual(20);
        expect(user?.age).toBeLessThanOrEqual(40);
      });

      // Complex numeric combinations
      it('should find users with complex age conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.OR]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.BETWEEN]: { age: [25, 30] },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.GT]: { age: 35 },
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
      });
    });

    describe('String Field Operators', () => {
      // Email tests
      it('should find user with email ending with @example.com', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.ENDSWITH]: { email: '@example.com' },
            },
          },
        });
        expect(user?.email).toMatch(/@example\.com$/);
      });

      it('should find user with case-insensitive email match', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.ILIKE]: { email: '%JOHN%' },
            },
          },
        });
        expect(user?.email.toLowerCase()).toContain('john');
      });

      // Username tests with multiple operators
      it('should find user with complex username conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.STARTSWITH]: { username: 'john' },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.NOT_ENDSWITH]: { username: 'smith' },
                  },
                },
              ],
            },
          },
        });
        expect(user?.username).toMatch(/^john/);
        expect(user?.username).not.toMatch(/smith$/);
      });

      // Pattern matching combinations
      it('should find user with multiple pattern conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.OR]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.LIKE]: { email: '%jane%' },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.SUBSTRING]: { username: '_doe' },
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
      });
    });

    describe('Boolean Field Operators', () => {
      it('should find active users with complex conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                { isActive: true },
                {
                  [Op_Symbol]: {
                    [FindOperator.NE]: { isDeleted: true },
                  },
                },
              ],
            },
          },
        });
        expect(user?.isActive).toBe(true);
        expect(user?.isDeleted).toBe(false);
      });
    });

    describe('Date Field Operators', () => {
      it('should find users created within date range', async () => {
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2024-12-31');
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.BETWEEN]: { createdAt: [startDate, endDate] },
            },
          },
        });
        expect(user?.createdAt.getTime()).toBeGreaterThanOrEqual(
          startDate.getTime()
        );
        expect(user?.createdAt.getTime()).toBeLessThanOrEqual(
          endDate.getTime()
        );
      });

      it('should find users with complex date conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.GT]: { createdAt: new Date('2023-01-01') },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.LT]: { updatedAt: new Date() },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.ISNULL]: { lastLoginAt: true },
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
      });
    });

    describe('Enum Field Operators', () => {
      it('should find users with specific roles', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.IN]: { role: [Role.ADMIN, Role.MODERATOR] },
            },
          },
        });
        expect([Role.ADMIN, Role.MODERATOR]).toContain(user?.role);
      });

      it('should find users with complex role conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.NE]: { role: Role.USER },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.IN]: { role: [Role.ADMIN, Role.MODERATOR] },
                  },
                },
              ],
            },
          },
        });
        expect(user?.role).not.toBe(Role.USER);
      });
    });

    describe('Array Field Operators', () => {
      it('should find users with specific array conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.SIZE]: { posts: 1 },
            },
          },
          relations: { posts: true },
        });
        expect(user?.posts).toHaveLength(1);
      });

      it('should find users with complex array conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.SIZE]: { posts: 1 },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.SIZE]: { comments: 0 },
                  },
                },
              ],
            },
          },
          relations: { posts: true, comments: true },
        });
        expect(user?.posts).toHaveLength(1);
        expect(user?.comments).toHaveLength(0);
      });
    });
  });

  describe('Advanced Operator Combinations', () => {
    describe('Multiple Field Type Combinations', () => {
      it('should combine string, number, and date operators', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.BETWEEN]: { age: [25, 35] },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.OR]: [
                      {
                        [Op_Symbol]: {
                          [FindOperator.LIKE]: { email: '%john%' },
                        },
                      },
                      {
                        [Op_Symbol]: {
                          [FindOperator.ENDSWITH]: { username: '_doe' },
                        },
                      },
                    ],
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.GT]: { createdAt: new Date('2023-01-01') },
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
      });

      it('should combine array size with string pattern matching', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.SIZE]: { posts: 1 },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.MATCH]: { email: /^[a-z]+@example\.com$/ },
                  },
                },
              ],
            },
          },
          relations: { posts: true },
        });
        expect(user?.posts).toHaveLength(1);
        expect(user?.email).toMatch(/^[a-z]+@example\.com$/);
      });
    });

    describe('Nested Relation Queries', () => {
      it('should query deeply nested relations with conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  profile: {
                    [Op_Symbol]: {
                      [FindOperator.AND]: [
                        {
                          address: {
                            [Op_Symbol]: {
                              [FindOperator.LIKE]: { city: '%York%' },
                            },
                          },
                        },
                        {
                          [Op_Symbol]: {
                            [FindOperator.NOT_NULL]: { website: true },
                          },
                        },
                      ],
                    },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.GT]: { age: 25 },
                  },
                },
              ],
            },
          },
          relations: {
            profile: {
              address: true,
            },
            posts: true,
          },
        });
        expect(user?.profile?.address?.city).toContain('York');
        expect(user?.profile?.website).toBeDefined();
      });

      it('should query relations with array conditions and nested selects', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  posts: {
                    [Op_Symbol]: {
                      [FindOperator.SIZE]: { comments: 1 },
                    },
                  },
                },
              ],
            },
          },
          relations: {
            posts: {
              comments: ['content', 'createdAt'],
            },
          },
        });
        expect(user?.posts[0]?.comments?.length).toBeGreaterThan(0);
      });
    });

    describe('Complex Pattern Matching', () => {
      it('should combine multiple string pattern operators', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.OR]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.AND]: [
                      {
                        [Op_Symbol]: {
                          [FindOperator.STARTSWITH]: { email: 'john' },
                        },
                      },
                      {
                        [Op_Symbol]: {
                          [FindOperator.ENDSWITH]: { email: '.com' },
                        },
                      },
                    ],
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.AND]: [
                      {
                        [Op_Symbol]: {
                          [FindOperator.SUBSTRING]: { username: 'doe' },
                        },
                      },
                      {
                        [Op_Symbol]: {
                          [FindOperator.NOT_ENDSWITH]: { username: 'smith' },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
        expect(
          user?.email.startsWith('john') || user?.username.includes('doe')
        ).toBeTruthy();
      });
    });

    describe('Advanced Array Operations', () => {
      it('should test array contains with primitive string array', async () => {
        const user = await userRepository.findOne({
          where: {
            interests: {
              [Op_Symbol]: {
                [FindOperator.ARRAY_CONTAINS]: 'coding',
              },
            },
          },
        });
        expect(user?.interests).toBeDefined();
        expect(user?.interests).toContain('coding');
      });

      it('should combine size operator with primitive array contains', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.SIZE]: { interests: 2 },
                  },
                },
                {
                  interests: {
                    [Op_Symbol]: {
                      [FindOperator.ARRAY_CONTAINS]: 'coding',
                    },
                  },
                },
              ],
            },
          },
        });
        expect(user?.interests).toHaveLength(2);
        expect(user?.interests).toContain('coding');
      });
    });

    describe('Date and Time Operations', () => {
      it('should combine multiple date conditions with ranges', async () => {
        const now = new Date();
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.BETWEEN]: {
                      createdAt: [
                        new Date(now.getFullYear() - 1, 0, 1),
                        new Date(now.getFullYear(), 11, 31),
                      ],
                    },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.OR]: [
                      {
                        [Op_Symbol]: {
                          [FindOperator.ISNULL]: { lastLoginAt: true },
                        },
                      },
                      {
                        [Op_Symbol]: {
                          [FindOperator.GT]: {
                            lastLoginAt: new Date(now.getFullYear(), 0, 1),
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
      });
    });

    describe('Complex JSON Field Operations', () => {
      it('should query nested JSON fields with pattern matching', async () => {
        const user = await userRepository.findOne({
          where: {
            profile: {
              socialLinks: {
                [Op_Symbol]: {
                  [FindOperator.AND]: [
                    {
                      [Op_Symbol]: {
                        [FindOperator.LIKE]: { twitter: '@%' },
                      },
                    },
                    {
                      [Op_Symbol]: {
                        [FindOperator.NOT_NULL]: { linkedin: true },
                      },
                    },
                  ],
                },
              },
            },
          },
          relations: { profile: true },
        });
        expect(user?.profile?.socialLinks?.twitter).toMatch(/^@/);
        expect(user?.profile?.socialLinks?.linkedin).toBeDefined();
      });
    });

    describe('Boundary Conditions', () => {
      it('should handle maximum nesting depth', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.OR]: [
                      {
                        [Op_Symbol]: {
                          [FindOperator.AND]: [
                            {
                              [Op_Symbol]: {
                                [FindOperator.BETWEEN]: { age: [20, 40] },
                              },
                            },
                            {
                              [Op_Symbol]: {
                                [FindOperator.LIKE]: {
                                  email: '%@example.com',
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        [Op_Symbol]: {
                          [FindOperator.OR]: [
                            {
                              [Op_Symbol]: {
                                [FindOperator.GT]: {
                                  posts: {
                                    [Op_Symbol]: { [FindOperator.SIZE]: 0 },
                                  },
                                },
                              },
                            },
                            {
                              profile: {
                                address: {
                                  [Op_Symbol]: {
                                    [FindOperator.LIKE]: { city: 'New%' },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          relations: {
            profile: {
              address: true,
            },
            posts: true,
          },
        });
        expect(user).toBeDefined();
      });

      it('should handle all possible numeric comparisons in one query', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.GT]: { age: 20 },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.LT]: { age: 40 },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.NE]: { age: 25 },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.GTE]: { id: 1 },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.LTE]: { id: 100 },
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
        expect(user?.age).toBeGreaterThan(20);
        expect(user?.age).toBeLessThan(40);
        expect(user?.age).not.toBe(25);
      });
    });
  });

  describe('Complex Combinations', () => {
    it('should combine multiple operators with relations and select', async () => {
      const user = await userRepository.findOne({
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
                  [FindOperator.LIKE]: { email: '%@example.com' },
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.OR]: [
                    { isActive: true },
                    {
                      [Op_Symbol]: {
                        [FindOperator.GT]: {
                          posts: { [Op_Symbol]: { [FindOperator.SIZE]: 0 } },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        relations: {
          profile: {
            address: true,
          },
          posts: ['title', 'content'],
        },
        select: ['id', 'email', 'username', 'age'],
      });
      expect(user).toBeDefined();
      expect(Object.keys(user!)).toHaveLength(4);
    });

    it('should handle deeply nested conditions with multiple operators', async () => {
      const user = await userRepository.findOne({
        where: {
          [Op_Symbol]: {
            [FindOperator.OR]: [
              {
                [Op_Symbol]: {
                  [FindOperator.AND]: [
                    {
                      [Op_Symbol]: {
                        [FindOperator.BETWEEN]: { age: [25, 35] },
                      },
                    },
                    {
                      [Op_Symbol]: {
                        [FindOperator.LIKE]: { email: '%john%' },
                      },
                    },
                  ],
                },
              },
              {
                [Op_Symbol]: {
                  [FindOperator.AND]: [
                    {
                      [Op_Symbol]: {
                        [FindOperator.GT]: { age: 30 },
                      },
                    },
                    {
                      [Op_Symbol]: {
                        [FindOperator.ENDSWITH]: { email: '@example.com' },
                      },
                    },
                    { isActive: true },
                  ],
                },
              },
            ],
          },
        },
        relations: {
          profile: true,
          posts: true,
          comments: true,
        },
      });
      expect(user).toBeDefined();
    });
  });

  describe('Order Options', () => {
    it('should order by single field', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        order: {
          createdAt: 'desc',
        },
      });
      expect(user).toBeDefined();
    });

    it('should order by multiple fields', async () => {
      const user = await userRepository.findOne({
        where: { email: 'john@example.com' },
        order: {
          updatedAt: 'desc',
          createdAt: 'asc',
        },
      });
      expect(user).toBeDefined();
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle all null fields in where clause', async () => {
        const user = await userRepository.findOne({
          where: {
            firstName: null,
            lastName: null,
            lastLoginAt: null,
          },
        });
        expect(user).toBeNull();
      });

      it('should handle complex null conditions', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.AND]: [
                {
                  [Op_Symbol]: {
                    [FindOperator.ISNULL]: { lastLoginAt: true },
                  },
                },
                {
                  [Op_Symbol]: {
                    [FindOperator.NOT_STARTSWITH]: { email: 'test' },
                  },
                },
              ],
            },
          },
        });
        expect(user).toBeDefined();
      });

      it('should handle empty arrays in relations', async () => {
        const user = await userRepository.findOne({
          where: {
            [Op_Symbol]: {
              [FindOperator.SIZE]: { posts: 0 },
            },
          },
          relations: { posts: true },
        });
        expect(user?.posts).toHaveLength(0);
      });

      it('should handle complex JSON field queries', async () => {
        const user = await userRepository.findOne({
          where: { email: 'john@example.com' },
          relations: {
            profile: true,
          },
        });
        expect(user?.profile?.socialLinks).toBeDefined();
        expect(typeof user?.profile?.socialLinks).toBe('object');
        expect(user?.profile?.socialLinks).toHaveProperty('twitter');
      });
    });
  });
});
