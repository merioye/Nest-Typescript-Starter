/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ForbiddenError, NotFoundError } from '@/common/errors';
import { Prisma, PrismaClient } from '@prisma/client';
import { PartialDeep } from 'type-fest';

import { Op_Symbol, SoftDeleteDefaultColumnName } from '../constants';
import {
  AggregateFunction,
  ExpressionType,
  FindOperator,
  UpdateOperator,
} from '../enums';
import { PrismaExpressionBuilder } from '../expression-builders';
import { IExpressionBuilder, IRepository, ITransaction } from '../interfaces';
import { PrismaTransaction } from '../transactions';
import {
  AggregatePipelineOptions,
  AggregateResult,
  ComputedFieldConfig,
  ConditionalExpression,
  DateExpression,
  DeleteOptions,
  FindManyOptions,
  FindOneOptions,
  FindWhereOptions,
  MathExpression,
  NumericColumnAggregateOptions,
  OrderDirection,
  RelationsOptions,
  RestoreOptions,
  SelectOptions,
  StringExpression,
  UpdateOperators,
  UpdateOptions,
  UpsertOptions,
  WhereOperators,
} from '../types';

export class PrismaRepository<Entity> implements IRepository<Entity> {
  private _activeTransaction: PrismaTransaction | null = null;
  private readonly _expressionBuilder: IExpressionBuilder;
  private readonly _softDeleteColumnName: string;

  public constructor(
    private readonly prisma: PrismaClient,
    private readonly modelName: string,
    softDeleteColumnName?: string
  ) {
    this._expressionBuilder = new PrismaExpressionBuilder();
    this._softDeleteColumnName =
      softDeleteColumnName || SoftDeleteDefaultColumnName;
  }

  private get model(): any {
    const client = this._activeTransaction?.prisma || this.prisma;
    const prismaModel = client[this.modelName as any] as any;
    if (!prismaModel) {
      throw new NotFoundError(`Invalid model name: ${this.modelName}`);
    }
    return prismaModel;
  }

  public async beginTransaction(): Promise<ITransaction> {
    if (this._activeTransaction) {
      throw new Error('A transaction is already in progress');
    }
    const transaction = await PrismaTransaction.start(this.prisma);
    this._activeTransaction = transaction;
    return transaction;
  }

  public async commitTransaction(transaction: ITransaction): Promise<void> {
    if (!this._activeTransaction) {
      throw new Error('No active transaction');
    }
    if (this._activeTransaction !== transaction) {
      throw new Error('Transaction mismatch');
    }
    await transaction.commit();
    this._activeTransaction = null;
  }

  public async rollbackTransaction(transaction: ITransaction): Promise<void> {
    if (!this._activeTransaction) {
      throw new Error('No active transaction');
    }
    if (this._activeTransaction !== transaction) {
      throw new Error('Transaction mismatch');
    }
    await transaction.rollback();
    this._activeTransaction = null;
  }

  public async findOne(
    options: FindOneOptions<Entity> = {}
  ): Promise<Entity | null> {
    const where = this.convertWhereToPrisma(options.where);
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    const result = await this.model.findFirst({
      where,
      select,
      include,
      orderBy,
    });
    return result as Entity | null;
  }

  public async findMany(
    options: FindManyOptions<Entity> = {}
  ): Promise<Entity[]> {
    const where = this.convertWhereToPrisma(options.where);
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);
    const skip = options?.skip;
    const take = options?.limit;

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    const result = await this.model.findMany({
      where,
      select,
      include,
      orderBy,
      skip,
      take,
    });
    return result as Entity[];
  }

  public async findOneOrFail(
    options: FindOneOptions<Entity> = {}
  ): Promise<Entity> {
    const where = this.convertWhereToPrisma(options.where);
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    const result = await this.model.findFirst({
      where,
      select,
      include,
      orderBy,
    });

    if (result) {
      return result;
    } else {
      throw new NotFoundError();
    }
  }

  public async findByIds<K extends keyof Entity>(
    ids: Entity[K][],
    options: Omit<FindManyOptions<Entity>, 'where'> = {}
  ): Promise<Entity[]> {
    const where: any = { id: { in: ids } };
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);
    const skip = options?.skip;
    const take = options?.limit;

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    const result = await this.model.findMany({
      where,
      select,
      include,
      orderBy,
      skip,
      take,
    });
    return result as Entity[];
  }

  public async findById<K extends keyof Entity>(
    id: Entity[K],
    options: Omit<FindOneOptions<Entity>, 'where'> = {}
  ): Promise<Entity | null> {
    const where: any = { id };
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    const result = await this.model.findFirst({
      where,
      select,
      include,
      orderBy,
    });
    return result as Entity | null;
  }

  public async distinct<K extends keyof Entity>(
    field: K,
    options: FindManyOptions<Entity> = {}
  ): Promise<Entity[K][]> {
    const where = this.convertWhereToPrisma(options.where);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);
    const skip = options?.skip;
    const take = options?.limit;

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    const result = await this.model.findMany({
      distinct: field,
      where,
      include,
      orderBy,
      skip,
      take,
      select: { [field]: true },
    });
    return result.map((item: any) => item[field as string]);
  }

  public async insertOne(record: PartialDeep<Entity>): Promise<Entity> {
    const data = this.convertToPrismaCreateInput(record);

    try {
      const result = await this.model.create({
        data,
      });
      return result as Entity;
    } catch (error: any) {
      throw new Error(`Failed to insert entity: ${error?.message}`);
    }
  }

  public async insertMany(records: PartialDeep<Entity>[]): Promise<Entity[]> {
    const data = records.map((record) =>
      this.convertToPrismaCreateInput(record)
    );

    const result = await this.model.createMany({
      data,
      skipDuplicates: false, // You can make this configurable if needed
    });

    // Fetch and return the inserted records
    // Note: Prisma's createMany doesn't return the created objects, so we need to fetch them separately
    const createdRecords = await this.model.findMany({
      where: {
        id: {
          in: result.ids as any[],
        },
      },
    });

    return createdRecords as Entity[];
  }

  public async updateOne(
    options: UpdateOptions<Entity>
  ): Promise<Entity | null> {
    if (!options || !options.update) {
      return null;
    }

    const { update, where: whereOptions, options: extraOptions = {} } = options;

    const data = this.convertToPrismaUpdateData(update);
    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions.select);
    const include = this.convertRelationsToPrisma(extraOptions.relations);

    try {
      const result = await this.model.update({
        where,
        data,
        select,
        include,
      });

      return result as Entity;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        // Prisma error code for "Record to update not found"
        return null;
      }
      throw error;
    }
  }

  async updateMany(options?: UpdateOptions<Entity>): Promise<Entity[]> {
    if (!options) {
      throw new Error('Update options are required');
    }

    const { update, where: whereOptions, options: extraOptions = {} } = options;

    const data = this.convertToPrismaUpdateData(update);
    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions.select);
    const include = this.convertRelationsToPrisma(extraOptions.relations);

    await this.model.updateMany({
      where,
      data,
      select,
      include,
    });

    // Prisma's updateMany doesn't return the updated entities, so we need to fetch them
    const updatedEntities = await this.findMany({
      where: where,
      ...extraOptions,
    });

    return updatedEntities;
  }

  async upsertOne(options: UpsertOptions<Entity>): Promise<Entity> {
    const {
      update: updateOptions,
      create: createOptions,
      where: whereOptions,
      options: extraOptions = {},
    } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const create = this.convertToPrismaCreateInput(createOptions);
    const update = this.convertToPrismaUpdateData(updateOptions);
    const select = this.convertSelectToPrisma(extraOptions.select);
    const include = this.convertRelationsToPrisma(extraOptions.relations);

    const result = await this.model.upsert({
      where,
      create,
      update,
      select,
      include,
    });

    return result as Entity;
  }

  async deleteOne(options: DeleteOptions<Entity> = {}): Promise<Entity | null> {
    if (!options) {
      return null;
    }

    const { where: whereOptions, options: extraOptions = {} } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions.select);
    const include = this.convertRelationsToPrisma(extraOptions.relations);
    try {
      const deleteOperation = this.model.delete({
        where,
        select,
        include,
      });

      const deletedEntity = await deleteOperation;
      return deletedEntity as Entity;
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Prisma error code for "Record to delete does not exist."
        return null;
      }
      throw error;
    }
  }

  async deleteMany(options: DeleteOptions<Entity> = {}): Promise<Entity[]> {
    if (!options) {
      return [];
    }
    const { where: whereOptions, options: extraOptions = {} } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions.select);
    const include = this.convertRelationsToPrisma(extraOptions.relations);

    // Perform the delete operation
    const result = await this.model.deleteMany({
      where,
      select,
      include,
    });

    // If no entities were deleted, return an empty array
    if (result.count === 0) {
      return [];
    }

    // Fetch the deleted entities
    const deletedEntities = await this.model.findMany({
      where,
      select,
      include,
    });
    return deletedEntities as Entity[];
  }

  async softDeleteOne(
    options: DeleteOptions<Entity> = {}
  ): Promise<Entity | null> {
    const { where: whereOptions, options: extraOptions = {} } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions.select);
    const include = this.convertRelationsToPrisma(extraOptions.relations);
    const data = {
      [this._softDeleteColumnName]: true,
    };

    try {
      const result = await this.model.update({
        where,
        data,
        select,
        include,
      });
      return result as Entity | null;
    } catch (error: any) {
      // Handle the case where no entity was found to update
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async softDeleteMany(options: DeleteOptions<Entity> = {}): Promise<Entity[]> {
    const { where: whereOptions, options: extraOptions = {} } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions.select);
    const include = this.convertRelationsToPrisma(extraOptions.relations);
    const data = {
      [this._softDeleteColumnName]: true,
    };

    const deletedEntities = await this.model.updateMany({
      where,
      select,
      include,
      data,
    });

    // Fetch and return the soft deleted entities
    const softDeletedEntities = await this.model.findMany({
      where: {
        id: { in: deletedEntities.map((entity: any) => entity.id) },
      },
    });

    return softDeletedEntities;
  }

  async restoreOne(options: RestoreOptions<Entity>): Promise<Entity> {
    const { where: whereOptions, options: extraOptions = {} } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions?.select);
    const include = this.convertRelationsToPrisma(extraOptions?.relations);
    const data = {
      [this._softDeleteColumnName]: false,
    };

    try {
      const result = await this.model.update({
        where,
        data,
        select,
        include,
      });
      if (!result) {
        throw new Error('Entity not found or already restored');
      }
      return result;
    } catch (error: any) {
      throw new Error(`Failed to restore entity: ${error.message}`);
    }
  }

  async restoreMany(options: RestoreOptions<Entity>): Promise<Entity[]> {
    const { where: whereOptions, options: extraOptions = {} } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const select = this.convertSelectToPrisma(extraOptions?.select);
    const include = this.convertRelationsToPrisma(extraOptions?.relations);
    const data = {
      [this._softDeleteColumnName]: false,
    };

    const restoreOperation = await this.model.updateMany({
      where,
      data,
      select,
      include,
    });

    // Fetch and return the restored entities
    const restoredEntities = (await this.model.findMany({
      where: {
        id: { in: restoreOperation.ids },
      },
    })) as Entity[];

    return restoredEntities;
  }

  async exists(where: FindWhereOptions<Entity>): Promise<boolean> {
    const prismaWhere = this.convertWhereToPrisma(where);

    const result = await this.model.findFirst({
      where: prismaWhere,
      select: { id: true },
    });

    return result !== null;
  }

  async count(options: FindManyOptions<Entity> = {}): Promise<number> {
    const where = this.convertWhereToPrisma(options.where);
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);
    const skip = options?.skip;
    const take = options?.limit;

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    return await this.model.count({
      where,
      select,
      include,
      orderBy,
      skip,
      take,
    });
  }

  async sum(options: NumericColumnAggregateOptions<Entity>): Promise<number> {
    const { where: whereOptions } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const result = await this.model.aggregate({
      where,
      _sum: {
        [options.columnName]: true,
      },
    });
    return result._sum[options.columnName];
  }

  async average(
    options: NumericColumnAggregateOptions<Entity>
  ): Promise<number | null> {
    const { where: whereOptions } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const result = await this.model.aggregate({
      where,
      _avg: {
        [options.columnName]: true,
      },
    });
    return result._avg[options.columnName];
  }

  async minimum(
    options: NumericColumnAggregateOptions<Entity>
  ): Promise<number | null> {
    const { where: whereOptions } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const result = await this.model.aggregate({
      where,
      _min: {
        [options.columnName]: true,
      },
    });
    return result._min[options.columnName];
  }

  async maximum(
    options: NumericColumnAggregateOptions<Entity>
  ): Promise<number | null> {
    const { where: whereOptions } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    const result = await this.model.aggregate({
      where,
      _max: {
        [options.columnName]: true,
      },
    });
    return result._max[options.columnName];
  }

  async increment(
    options: NumericColumnAggregateOptions<Entity> & { value: number }
  ): Promise<Entity[]> {
    const { where: whereOptions } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    return await this.model.updateMany({
      where,
      data: {
        [options.columnName]: {
          increment: options.value,
        },
      },
    });
  }

  async decrement(
    options: NumericColumnAggregateOptions<Entity> & { value: number }
  ): Promise<Entity[]> {
    const { where: whereOptions } = options;

    const where = this.convertWhereToPrisma(whereOptions);
    return await this.model.updateMany({
      where,
      data: {
        [options.columnName]: {
          decrement: options.value,
        },
      },
    });
  }

  async clear(): Promise<void> {
    await this.model.deleteMany({});
  }

  async countDistinct<K extends keyof Entity>(
    field: K,
    options: FindManyOptions<Entity> = {}
  ): Promise<number> {
    const where = this.convertWhereToPrisma(options.where);
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);
    const skip = options?.skip;
    const take = options?.limit;

    if (
      this._softDeleteColumnName in this.model.fields &&
      !options.withDeleted
    ) {
      where[this._softDeleteColumnName] = false;
    }

    const result = await this.model.findMany({
      distinct: field,
      where,
      select,
      include,
      orderBy,
      skip,
      take,
    });
    return result.length;
  }

  /**
   * Perform aggregation operations using a pipeline approach
   * @param options - Options for the aggregation pipeline
   * @returns Promise resolving to an array of aggregation results
   */
  async aggregatePipeline<Result = AggregateResult<Entity>>(
    options: AggregatePipelineOptions<Entity>
  ): Promise<Result[]> {
    const { pipeline, withDeleted } = options;

    let query = this.model;
    const computedFields: Record<string, any> = {};

    for (const stage of pipeline) {
      if (stage.$where) {
        query = query.where(this.convertWhereToPrisma(stage.$where));
      }

      if (stage.$group) {
        const groupBy = stage.$group.by?.map((field: any) => {
          // If the field is in computedFields, use the raw SQL expression
          if (field in computedFields) {
            return Prisma.sql`${computedFields[field]}`;
          }
          return field.toString();
        });
        const aggregations: Record<string, any> = {};

        for (const func of stage.$group.functions) {
          const fieldName = func.field.toString();
          const alias = func.alias;

          // If the field is a computed field, use the raw SQL expression
          const fieldExpression =
            fieldName in computedFields ? computedFields[fieldName] : fieldName;

          switch (func.function) {
            case AggregateFunction.COUNT:
              aggregations[alias] = { _count: fieldExpression };
              break;
            case AggregateFunction.SUM:
              aggregations[alias] = { _sum: fieldExpression };
              break;
            case AggregateFunction.AVG:
              aggregations[alias] = { _avg: fieldExpression };
              break;
            case AggregateFunction.MIN:
              aggregations[alias] = { _min: fieldExpression };
              break;
            case AggregateFunction.MAX:
              aggregations[alias] = { _max: fieldExpression };
              break;
            case AggregateFunction.FIRST:
              aggregations[alias] = { _min: fieldExpression };
              break;
            case AggregateFunction.LAST:
              aggregations[alias] = { _max: fieldExpression };
              break;
            case AggregateFunction.ARRAY:
              aggregations[alias] = { _count: fieldExpression };
              break;
          }

          // Store the alias in computedFields for later stages
          computedFields[alias] = aggregations[alias];
        }

        query = query.groupBy(groupBy || {}).aggregate(aggregations);
      }

      if (stage.$project) {
        const { fields, computedFields: projectComputedFields } =
          stage.$project;
        const select: Record<string, any> = {};

        // Map regular fields and previously computed fields
        if (fields) {
          for (const field of fields) {
            if (typeof field === 'string') {
              // If the field is a computed field from previous stages, use the stored expression
              select[field] =
                field in computedFields ? computedFields[field] : true;
            } else {
              // Field with alias
              const [fieldName, alias] = Object.entries(field)[0] as string[];
              if (fieldName) {
                select[(alias || fieldName) as string] =
                  fieldName in computedFields
                    ? computedFields[fieldName]
                    : true;
              }
            }
          }
        }

        // Handle computed fields
        if (projectComputedFields) {
          for (const [key, config] of Object.entries(projectComputedFields)) {
            const expression = this.buildComputedFieldExpression(config);
            select[key] = expression;
            // Store the computed field for later stages
            computedFields[key] = expression;
          }
        }

        query = query.select(select);
      }

      if (stage.$order) {
        const orderBy = Object.entries(stage.$order).reduce(
          (acc, [field, direction]) => {
            // If the field is a computed field, use the raw SQL expression
            acc[field] =
              field in computedFields
                ? { sort: direction, expression: computedFields[field] }
                : direction;
            return acc;
          },
          {} as Record<string, any>
        );

        query = query.orderBy(orderBy);
      }

      if (stage.$skip) {
        query = query.skip(stage.$skip);
      }

      if (stage.$limit) {
        query = query.take(stage.$limit);
      }
    }

    if (!withDeleted) {
      query = query.where({ [this._softDeleteColumnName]: false });
    }

    return await query;
  }

  // ################################# Utilities ####################################

  private convertWhereToPrisma(
    where: FindWhereOptions<Entity> | undefined
  ): any {
    if (!where) return {};

    return Object.entries(where).reduce((acc: any, [key, value]) => {
      if (key === Op_Symbol) {
        // Handle operators
        const operators = value as WhereOperators<Entity>;
        return this.convertOperatorsToPrisma(operators);
      } else if (value === null) {
        // Handle direct null comparison
        acc[key] = null;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle nested conditions or relation queries
        if (Object.keys(value).includes(Op_Symbol)) {
          // If it has Op_Symbol, it's a nested operator condition
          acc[key] = this.convertOperatorsToPrisma(
            value as WhereOperators<Entity>
          );
        } else {
          // Otherwise, it's a nested relation query
          acc[key] = this.convertWhereToPrisma(
            value as FindWhereOptions<Entity>
          );
        }
      } else {
        // Handle direct value comparison
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  private convertOperatorsToPrisma(operators: WhereOperators<Entity>): any {
    return Object.entries(operators).reduce((acc: any, [op, value]) => {
      switch (op) {
        case FindOperator.AND:
        case FindOperator.OR:
          acc[op === FindOperator.AND ? 'AND' : 'OR'] = (value as any[]).map(
            (condition) => {
              if (Op_Symbol in condition) {
                return this.convertOperatorsToPrisma(
                  condition[Op_Symbol] as WhereOperators<Entity>
                );
              } else {
                return this.convertWhereToPrisma(condition);
              }
            }
          );
          break;

        case FindOperator.LT:
        case FindOperator.GT:
        case FindOperator.LTE:
        case FindOperator.GTE:
        case FindOperator.NE:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = { [this.mapOperatorToPrisma(op)]: fieldValue };
                return opAcc;
              },
              acc
            );
          } else {
            // Handle direct value comparison
            acc = { [this.mapOperatorToPrisma(op)]: value };
          }
          break;

        case FindOperator.IN:
        case FindOperator.NIN:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = { [this.mapOperatorToPrisma(op)]: fieldValue };
                return opAcc;
              },
              acc
            );
          } else if (Array.isArray(value)) {
            // Handle direct array value comparison
            acc = { [this.mapOperatorToPrisma(op)]: value };
          }
          break;

        case FindOperator.LIKE:
        case FindOperator.ILIKE:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = {
                  [op === FindOperator.ILIKE ? 'contains' : 'startsWith']:
                    fieldValue,
                  mode: op === FindOperator.ILIKE ? 'insensitive' : 'default',
                };
                return opAcc;
              },
              acc
            );
          } else if (typeof value === 'string') {
            // Handle direct string value comparison
            acc = {
              [op === FindOperator.ILIKE ? 'contains' : 'startsWith']: value,
              mode: op === FindOperator.ILIKE ? 'insensitive' : 'default',
            };
          }
          break;

        case FindOperator.BETWEEN:
        case FindOperator.NOT_BETWEEN:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, [min, max]]) => {
                opAcc[field] = {
                  [op === FindOperator.BETWEEN ? 'gte' : 'lt']: min,
                  [op === FindOperator.BETWEEN ? 'lte' : 'gt']: max,
                };
                return opAcc;
              },
              acc
            );
          } else if (Array.isArray(value) && value.length === 2) {
            // Handle direct array value comparison
            const [min, max] = value;
            acc = {
              [op === FindOperator.BETWEEN ? 'gte' : 'lt']: min,
              [op === FindOperator.BETWEEN ? 'lte' : 'gt']: max,
            };
          }
          break;

        case FindOperator.ISNULL:
        case FindOperator.NOT_NULL:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field]) => {
                opAcc[field] = {
                  [op === FindOperator.ISNULL ? 'equals' : 'not']: null,
                };
                return opAcc;
              },
              acc
            );
          } else if (typeof value === 'boolean') {
            // Handle direct boolean value comparison
            acc = {
              [op === FindOperator.ISNULL ? 'equals' : 'not']: null,
            };
          }
          break;

        case FindOperator.ARRAY_CONTAINS:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = { some: fieldValue };
                return opAcc;
              },
              acc
            );
          } else {
            // Handle direct value comparison
            acc = { some: value };
          }
          break;

        case FindOperator.ANY:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = {
                  some: {
                    OR: Array.isArray(fieldValue) ? fieldValue : [fieldValue],
                  },
                };
                return opAcc;
              },
              acc
            );
          }
          break;

        case FindOperator.SIZE:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, size]) => {
                opAcc[field] = { size };
                return opAcc;
              },
              acc
            );
          } else if (typeof value === 'number') {
            // Handle direct number value comparison
            acc = { size: value };
          }
          break;

        case FindOperator.STARTSWITH:
        case FindOperator.NOT_STARTSWITH:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = {
                  [op === FindOperator.STARTSWITH ? 'startsWith' : 'not']: {
                    startsWith: fieldValue,
                  },
                };
                return opAcc;
              },
              acc
            );
          } else if (typeof value === 'string') {
            // Handle direct string value comparison
            acc = {
              [op === FindOperator.STARTSWITH ? 'startsWith' : 'not']: {
                startsWith: value,
              },
            };
          }
          break;

        case FindOperator.ENDSWITH:
        case FindOperator.NOT_ENDSWITH:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = {
                  [op === FindOperator.ENDSWITH ? 'endsWith' : 'not']: {
                    endsWith: fieldValue,
                  },
                };
                return opAcc;
              },
              acc
            );
          } else if (typeof value === 'string') {
            // Handle direct string value comparison
            acc = {
              [op === FindOperator.ENDSWITH ? 'endsWith' : 'not']: {
                endsWith: value,
              },
            };
          }
          break;

        case FindOperator.SUBSTRING:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, fieldValue]) => {
                opAcc[field] = { contains: fieldValue };
                return opAcc;
              },
              acc
            );
          } else if (typeof value === 'string') {
            // Handle direct string value comparison
            acc = { contains: value };
          }
          break;

        case FindOperator.MATCH:
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle field-level operator format
            acc = Object.entries(value as object).reduce(
              (opAcc: any, [field, pattern]) => {
                opAcc[field] = { matches: pattern };
                return opAcc;
              },
              acc
            );
          } else if (value instanceof RegExp) {
            // Handle direct RegExp value comparison
            acc = { matches: value };
          }
          break;
      }
      return acc;
    }, {});
  }

  private mapOperatorToPrisma(operator: FindOperator): string {
    const operatorMap: Record<FindOperator, string> = {
      [FindOperator.LT]: 'lt',
      [FindOperator.GT]: 'gt',
      [FindOperator.LTE]: 'lte',
      [FindOperator.GTE]: 'gte',
      [FindOperator.NE]: 'not',
      [FindOperator.IN]: 'in',
      [FindOperator.NIN]: 'notIn',
      [FindOperator.AND]: 'AND',
      [FindOperator.OR]: 'OR',
      [FindOperator.LIKE]: 'contains',
      [FindOperator.ILIKE]: 'contains',
      [FindOperator.BETWEEN]: 'between',
      [FindOperator.NOT_BETWEEN]: 'notBetween',
      [FindOperator.ISNULL]: 'equals',
      [FindOperator.NOT_NULL]: 'not',
      [FindOperator.ANY]: 'some',
      [FindOperator.ARRAY_CONTAINS]: 'some',
      [FindOperator.SIZE]: 'size',
      [FindOperator.STARTSWITH]: 'startsWith',
      [FindOperator.NOT_STARTSWITH]: 'not',
      [FindOperator.ENDSWITH]: 'endsWith',
      [FindOperator.NOT_ENDSWITH]: 'not',
      [FindOperator.SUBSTRING]: 'contains',
      [FindOperator.MATCH]: 'matches',
    };
    return operatorMap[operator];
  }

  private convertSelectToPrisma(
    select: SelectOptions<Entity> | undefined
  ): any {
    if (!select) return undefined;

    if (Array.isArray(select)) {
      return select.reduce((acc: any, key) => {
        acc[key as string] = true;
        return acc;
      }, {});
    } else {
      return Object.entries(select).reduce((acc: any, [key, value]) => {
        if (typeof value === 'object') {
          acc[key] = this.convertSelectToPrisma(value as SelectOptions<Entity>);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
    }
  }

  private convertRelationsToPrisma(
    relations: RelationsOptions<Entity> | undefined
  ): any {
    if (!relations) return undefined;

    return Object.entries(relations).reduce((acc: any, [key, value]) => {
      if (value === true) {
        // Format 1: { profile: true }
        acc[key] = true;
      } else if (Array.isArray(value)) {
        // Format 2: { profile: ['id', 'createdAt'] }
        acc[key] = {
          select: value.reduce((selectAcc: any, field) => {
            selectAcc[field] = true;
            return selectAcc;
          }, {}),
        };
      } else if (typeof value === 'object') {
        // Format 3 & 4: Nested relations
        const nestedValue = value as RelationsOptions<Entity>;
        const nestedResult = this.convertRelationsToPrisma(nestedValue);

        // If the nested result has a select property, use it directly
        if (
          nestedResult &&
          Object.keys(nestedResult).some((k) => k === 'select')
        ) {
          acc[key] = nestedResult;
        } else {
          // Otherwise, wrap it in an include
          acc[key] = {
            include: nestedResult,
          };
        }
      }
      return acc;
    }, {});
  }

  private convertOrderToPrisma(
    order: Partial<{ [P in keyof Entity]?: OrderDirection }> | undefined
  ): any {
    if (!order) return undefined;

    return Object.entries(order).reduce((acc: any, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  private convertToPrismaCreateInput(record: PartialDeep<Entity>): any {
    const convertedRecord: any = {};

    for (const [key, value] of Object.entries(record as any)) {
      if (value !== undefined) {
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Handle nested objects
          convertedRecord[key] = this.convertToPrismaCreateInput(
            value as PartialDeep<Entity>
          );
        } else if (Array.isArray(value)) {
          // Handle arrays
          convertedRecord[key] = value.map((item) =>
            typeof item === 'object' && item !== null
              ? this.convertToPrismaCreateInput(item as PartialDeep<Entity>)
              : item
          );
        } else {
          // Handle primitive values
          convertedRecord[key] = value;
        }
      }
    }

    return convertedRecord;
  }

  private convertToPrismaUpdateData(
    update: PartialDeep<Entity> & { [Op_Symbol]?: UpdateOperators<Entity> }
  ): any {
    const prismaUpdate: any = {};

    for (const [key, value] of Object.entries(update)) {
      if (key === Op_Symbol) {
        Object.assign(
          prismaUpdate,
          this.convertUpdateOperatorsToPrisma(value as UpdateOperators<Entity>)
        );
      } else {
        prismaUpdate[key] = value;
      }
    }

    return prismaUpdate;
  }

  private convertUpdateOperatorsToPrisma(
    operators: UpdateOperators<Entity>
  ): any {
    const prismaUpdateOperators: any = {};

    for (const [operator, value] of Object.entries(operators)) {
      switch (operator) {
        case UpdateOperator.INC:
          for (const [field, incValue] of Object.entries(value as any)) {
            prismaUpdateOperators[field] = { increment: incValue };
          }
          break;
        case UpdateOperator.DEC:
          for (const [field, decValue] of Object.entries(value as any)) {
            prismaUpdateOperators[field] = { decrement: decValue };
          }
          break;
        case UpdateOperator.MUL:
          for (const [field, mulValue] of Object.entries(value as any)) {
            prismaUpdateOperators[field] = { multiply: mulValue };
          }
          break;
        default:
          throw new ForbiddenError(`Unsupported update operator: ${operator}`);
      }
    }

    return prismaUpdateOperators;
  }

  private buildComputedFieldExpression(config: ComputedFieldConfig): any {
    switch (config.type) {
      case ExpressionType.MATH:
        return this._expressionBuilder.buildMathExpression(
          config.expression as MathExpression
        );
      case ExpressionType.STRING:
        return this._expressionBuilder.buildStringExpression(
          config.expression as StringExpression
        );
      case ExpressionType.DATE:
        return this._expressionBuilder.buildDateExpression(
          config.expression as DateExpression
        );
      case ExpressionType.CONDITIONAL:
        return this._expressionBuilder.buildConditionalExpression(
          config.expression as ConditionalExpression
        );
      default:
        throw new Error(
          `Unsupported expression type: ${config.type as string}`
        );
    }
  }

  // private convertAggregateOrderToPrisma(
  //   order: AggregateOrderOptions<Entity> | undefined
  // ): any {
  //   if (!order) return undefined;

  //   return Object.entries(order).reduce((acc: any, [key, value]) => {
  //     // Handle different aggregate function cases
  //     if (key.startsWith('count_')) {
  //       acc._count = { [key.replace('count_', '')]: value };
  //     } else if (key.startsWith('sum_')) {
  //       acc._sum = { [key.replace('sum_', '')]: value };
  //     } else if (key.startsWith('avg_')) {
  //       acc._avg = { [key.replace('avg_', '')]: value };
  //     } else if (key.startsWith('min_')) {
  //       acc._min = { [key.replace('min_', '')]: value };
  //     } else if (key.startsWith('max_')) {
  //       acc._max = { [key.replace('max_', '')]: value };
  //     } else {
  //       // Regular field ordering
  //       acc[key] = value;
  //     }
  //     return acc;
  //   }, {});
  // }
}
