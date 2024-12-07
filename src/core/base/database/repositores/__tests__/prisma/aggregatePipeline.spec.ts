import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Role, User } from '@/types';

import { Op_Symbol } from '../../../constants';
import {
  AggregateFunction,
  ExpressionComparisonOperator,
  ExpressionDateFunction,
  ExpressionDatePart,
  ExpressionMathOperator,
  ExpressionStringFunction,
  ExpressionType,
  FindOperator,
} from '../../../enums';
import { createExpressionBuilder } from '../../../expression-builders';
import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase, seedDatabase } from './seed';

describe('PrismaRepository - aggregatePipeline', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;
  let expr: ReturnType<typeof createExpressionBuilder<User>>;

  beforeAll(() => {
    prisma = prismaClient;
    userRepository = new PrismaRepository(prisma, 'user');
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    await seedDatabase(prisma);
    expr = createExpressionBuilder<User>();
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Basic Aggregations', () => {
    it('should count all users', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: null,
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'totalUsers',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.totalUsers).toBe(2);
    });

    it('should calculate average age', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: null,
              functions: [
                {
                  function: AggregateFunction.AVG,
                  field: 'age',
                  alias: 'averageAge',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.averageAge).toBe(29);
    });

    it('should find min and max ages', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: null,
              functions: [
                {
                  function: AggregateFunction.MIN,
                  field: 'age',
                  alias: 'minAge',
                },
                {
                  function: AggregateFunction.MAX,
                  field: 'age',
                  alias: 'maxAge',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.minAge).toBe(28);
      expect(result[0]?.maxAge).toBe(30);
    });
  });

  describe('Grouped Aggregations', () => {
    it('should group users by role and count', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: ['role'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.role).toBe(Role.ADMIN);
      expect(result[0]?.userCount).toBe(2);
    });

    it('should group by multiple fields', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: ['role', 'age'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.age === 28)?.userCount).toBe(1);
      expect(result.find((r) => r.age === 30)?.userCount).toBe(1);
    });
  });

  describe('Pipeline Stages', () => {
    it('should filter before aggregation', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $where: {
              age: { [Op_Symbol]: { [FindOperator.GT]: 28 } },
            },
          },
          {
            $group: {
              by: null,
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.userCount).toBe(1);
    });

    it('should order results', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: ['age'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
          {
            $order: {
              age: 'desc',
            },
          },
        ],
      });
      expect(result).toHaveLength(2);
      expect(result[0]?.age).toBe(30);
      expect(result[1]?.age).toBe(28);
    });

    it('should apply pagination', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: ['age'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
          {
            $skip: 1,
          },
          {
            $limit: 1,
          },
        ],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('Computed Fields', () => {
    it('should calculate computed fields with math expressions', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $project: {
              fields: ['age'],
              computedFields: {
                ageNextYear: {
                  type: ExpressionType.MATH,
                  expression: expr.math(
                    expr.field('age'),
                    ExpressionMathOperator.ADD,
                    1
                  ),
                },
              },
            },
          },
        ],
      });
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.age === 30)?.ageNextYear).toBe(31);
      expect(result.find((r) => r.age === 28)?.ageNextYear).toBe(29);
    });

    it('should handle string concatenation', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $project: {
              fields: ['firstName', 'lastName'],
              computedFields: {
                fullName: {
                  type: ExpressionType.STRING,
                  expression: expr.string(
                    ExpressionStringFunction.CONCAT,
                    expr.field('firstName'),
                    ' ',
                    expr.field('lastName')
                  ),
                },
              },
            },
          },
        ],
      });
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.firstName === 'John')?.fullName).toBe(
        'John Doe'
      );
      expect(result.find((r) => r.firstName === 'Jane')?.fullName).toBe(
        'Jane Smith'
      );
    });
  });

  describe('Advanced Pipeline Combinations', () => {
    it('should combine multiple aggregation functions with grouping', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: ['role'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
                {
                  function: AggregateFunction.AVG,
                  field: 'age',
                  alias: 'avgAge',
                },
                {
                  function: AggregateFunction.MIN,
                  field: 'age',
                  alias: 'minAge',
                },
                {
                  function: AggregateFunction.MAX,
                  field: 'age',
                  alias: 'maxAge',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.userCount).toBe(2);
      expect(result[0]?.avgAge).toBe(29);
      expect(result[0]?.minAge).toBe(28);
      expect(result[0]?.maxAge).toBe(30);
    });

    it('should handle complex filtering with multiple conditions', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $where: {
              [Op_Symbol]: {
                [FindOperator.AND]: [
                  { role: Role.ADMIN },
                  { [Op_Symbol]: { [FindOperator.GT]: { age: 25 } } },
                  {
                    [Op_Symbol]: {
                      [FindOperator.LIKE]: { email: '%@example.com' },
                    },
                  },
                ],
              },
            },
          },
          {
            $group: {
              by: null,
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.userCount).toBe(2);
    });

    it('should perform multi-stage aggregation with computed fields', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $where: {
              age: { [Op_Symbol]: { [FindOperator.GT]: 25 } },
            },
          },
          {
            $group: {
              by: ['role'],
              functions: [
                {
                  function: AggregateFunction.AVG,
                  field: 'age',
                  alias: 'avgAge',
                },
              ],
            },
          },
          {
            $project: {
              fields: ['role', 'avgAge'],
              computedFields: {
                ageCategory: {
                  type: ExpressionType.CONDITIONAL,
                  expression: expr
                    .case()
                    .when(
                      expr.field('avgAge'),
                      ExpressionComparisonOperator.GTE,
                      30
                    )
                    .then('Senior')
                    .else('Junior'),
                },
              },
            },
          },
          {
            $order: {
              avgAge: 'desc',
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.avgAge).toBe(29);
      expect(result[0]?.ageCategory).toBe('Junior');
    });
  });

  describe('Advanced Filtering and Expressions', () => {
    it('should handle complex date expressions', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $project: {
              fields: ['createdAt'],
              computedFields: {
                yearCreated: {
                  type: ExpressionType.DATE,
                  expression: expr.date({
                    function: ExpressionDateFunction.EXTRACT,
                    part: ExpressionDatePart.YEAR,
                    field: expr.field('createdAt'),
                  }),
                },
                monthCreated: {
                  type: 'date',
                  expression: expr.date({
                    function: ExpressionDateFunction.EXTRACT,
                    part: ExpressionDatePart.MONTH,
                    field: expr.field('createdAt'),
                  }),
                },
              },
            },
          },
          {
            $group: {
              by: ['yearCreated', 'monthCreated'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.userCount).toBe(2);
    });

    it('should handle complex string operations', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $project: {
              fields: ['email'],
              computedFields: {
                domain: {
                  type: ExpressionType.STRING,
                  expression: expr.string(
                    ExpressionStringFunction.SUBSTRING,
                    expr.field('email'),
                    '@',
                    expr.string(
                      ExpressionStringFunction.LENGTH,
                      expr.field('email')
                    )
                  ),
                },
              },
            },
          },
          {
            $group: {
              by: ['domain'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.domain).toBe('example.com');
      expect(result[0]?.userCount).toBe(2);
    });

    it('should handle multiple conditional expressions', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $project: {
              fields: ['age'],
              computedFields: {
                ageGroup: {
                  type: ExpressionType.CONDITIONAL,
                  expression: expr
                    .case()
                    .when(
                      expr.field('age'),
                      ExpressionComparisonOperator.LT,
                      25
                    )
                    .then('Young')
                    .when(
                      expr.field('age'),
                      ExpressionComparisonOperator.GTE,
                      25
                    )
                    .then('Adult')
                    .else('Senior'),
                },
              },
            },
          },
          {
            $group: {
              by: ['ageGroup'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'groupCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.ageGroup === 'Adult')?.groupCount).toBe(1);
      expect(result.find((r) => r.ageGroup === 'Senior')?.groupCount).toBe(1);
    });
  });

  describe('Complex Pipeline Combinations', () => {
    it('should handle multiple stages with different operations', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $where: {
              [Op_Symbol]: {
                [FindOperator.AND]: [
                  { [Op_Symbol]: { [FindOperator.GT]: { age: 25 } } },
                ],
              },
            },
          },
          {
            $group: {
              by: ['role'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
                {
                  function: AggregateFunction.AVG,
                  field: 'age',
                  alias: 'avgAge',
                },
              ],
            },
          },
          {
            $project: {
              fields: ['role', 'userCount', 'avgAge'],
              computedFields: {
                status: {
                  type: ExpressionType.CONDITIONAL,
                  expression: expr
                    .case()
                    .when(
                      expr.field('userCount'),
                      ExpressionComparisonOperator.GT,
                      1
                    )
                    .then('Multiple')
                    .else('Single'),
                },
              },
            },
          },
          {
            $order: {
              avgAge: 'desc',
            },
          },
        ],
        relations: {
          profile: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.status).toBe('Single');
    });
  });

  describe('Error Cases and Validation', () => {
    it('should handle invalid pipeline stage order', async () => {
      await expect(
        userRepository.aggregatePipeline({
          pipeline: [
            {
              $order: {
                age: 'desc',
              },
            },
            {
              $group: {
                by: ['role'],
                functions: [
                  {
                    function: AggregateFunction.COUNT,
                    field: 'id',
                    alias: 'userCount',
                  },
                ],
              },
            },
          ],
        })
      ).rejects.toThrow();
    });

    it('should validate aggregate function configuration', async () => {
      await expect(
        userRepository.aggregatePipeline({
          pipeline: [
            {
              $group: {
                by: ['role'],
                functions: [
                  {
                    function: 'INVALID_FUNCTION' as AggregateFunction,
                    field: 'id',
                    alias: 'userCount',
                  },
                ],
              },
            },
          ],
        })
      ).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      await expect(
        userRepository.aggregatePipeline({
          pipeline: [
            {
              $group: {
                by: ['nonexistentField'],
                functions: [
                  {
                    function: AggregateFunction.COUNT,
                    field: 'id',
                    alias: 'userCount',
                  },
                ],
              },
            },
          ],
        })
      ).rejects.toThrow();
    });

    it('should validate computed field types', async () => {
      await expect(
        userRepository.aggregatePipeline({
          pipeline: [
            {
              $project: {
                fields: ['age'],
                computedFields: {
                  invalidType: {
                    expression: expr.math(
                      expr.field('age'),
                      ExpressionMathOperator.ADD,
                      1
                    ),
                    type: 'invalid' as ExpressionType,
                  },
                },
              },
            },
          ],
        })
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty result set', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $where: {
              age: { [Op_Symbol]: { [FindOperator.GT]: 100 } },
            },
          },
          {
            $group: {
              by: null,
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.userCount).toBe(0);
    });

    it('should handle null values in computed fields', async () => {
      // First set some ages to null
      await prisma.user.update({
        where: { email: 'john@example.com' },
        data: { age: null },
      });

      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $project: {
              fields: ['age'],
              computedFields: {
                ageStatus: {
                  type: ExpressionType.CONDITIONAL,
                  expression: expr
                    .case()
                    .when(
                      expr.field('age'),
                      ExpressionComparisonOperator.EQ,
                      null as unknown as string
                    )
                    .then('Unknown')
                    .else('Known'),
                },
              },
            },
          },
        ],
      });
      expect(result).toHaveLength(2);
      expect(result.some((r) => r.ageStatus === 'Unknown')).toBe(true);
      expect(result.some((r) => r.ageStatus === 'Known')).toBe(true);
    });

    it('should handle invalid computed field expressions gracefully', async () => {
      await expect(
        userRepository.aggregatePipeline({
          pipeline: [
            {
              $project: {
                fields: ['age'],
                computedFields: {
                  invalidExpression: {
                    expression: expr.math(
                      expr.field('age'),
                      'INVALID_FUNCTION' as ExpressionMathOperator.ADD,
                      1
                    ),
                    type: ExpressionType.MATH,
                  },
                },
              },
            },
          ],
        })
      ).rejects.toThrow();
    });
  });

  describe('Relations and Nested Data', () => {
    it('should aggregate with nested relations', async () => {
      const result = await userRepository.aggregatePipeline({
        pipeline: [
          {
            $group: {
              by: ['profile.address.city'],
              functions: [
                {
                  function: AggregateFunction.COUNT,
                  field: 'id',
                  alias: 'userCount',
                },
              ],
            },
          },
        ],
        relations: {
          profile: {
            address: true,
          },
        },
      });
      expect(result).toHaveLength(2);
      expect(
        result.find((r) => r['profile.address.city'] === 'New York')?.userCount
      ).toBe(1);
    });
  });
});
