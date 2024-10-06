/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ForbiddenError, NotFoundError } from '@/common/errors';
import { PrismaClient } from '@prisma/client';
import { PartialDeep } from 'type-fest';
import { Op_Symbol, SoftDeleteDefaultColumnName } from '../constants';
import { FIND_OPERATOR, UPDATE_OPERATOR } from '../enums';
import { IRepository, ITransaction } from '../interfaces';
import { PrismaTransaction } from '../transactions';
import {
  AggregateOptions,
  DeleteOptions,
  FindManyOptions,
  FindOneOptions,
  FindWhereOptions,
  NumericColumnAggregateOptions,
  RelationsOptions,
  RestoreOptions,
  SelectOptions,
  UpdateOperators,
  UpdateOptions,
  UpsertOptions,
  WhereOperators,
} from '../types';

export class PrismaRepository<Entity> implements IRepository<Entity> {
  public constructor(
    private readonly prisma: PrismaClient,
    private readonly modelName: string
  ) {}

  private get model(): any {
    const prismaModel = this.prisma[this.modelName as any] as any;
    if (!prismaModel) {
      throw new NotFoundError(`Invalid model name: ${this.modelName}`);
    }
    return prismaModel;
  }

  public async beginTransaction(): Promise<ITransaction> {
    return await PrismaTransaction.start(this.prisma);
  }

  public async commitTransaction(transaction: ITransaction): Promise<void> {
    await transaction.commit();
  }

  public async rollbackTransaction(transaction: ITransaction): Promise<void> {
    await transaction.rollback();
  }

  public async findOne(
    options: FindOneOptions<Entity> = {}
  ): Promise<Entity | null> {
    const where = this.convertWhereToPrisma(options.where);
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
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
    options: Omit<FindManyOptions<Entity>, 'select'> = {}
  ): Promise<Entity[K][]> {
    const where = this.convertWhereToPrisma(options.where);
    const include = this.convertRelationsToPrisma(options.relations);
    const orderBy = this.convertOrderToPrisma(options.order);
    const skip = options?.skip;
    const take = options?.limit;
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
    }

    const result = await this.model.findMany({
      where,
      include,
      orderBy,
      skip,
      take,
      select: { [field]: true },
      distinct: [field as string],
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;
    const data = {
      [softDeleteColumn]: true,
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;
    const data = {
      [softDeleteColumn]: true,
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;
    const data = {
      [softDeleteColumn]: false,
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;
    const data = {
      [softDeleteColumn]: false,
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
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
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
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

  async aggregate(options: AggregateOptions<Entity>): Promise<Entity[]> {
    const groupBy = options.groupBy || undefined;
    const where = this.convertWhereToPrisma(options.where);
    const having = this.convertWhereToPrisma(options.having);
    const order = this.convertOrderToPrisma(options.order);
    const select = this.convertSelectToPrisma(options.select);
    const include = this.convertRelationsToPrisma(options.relations);
    const skip = options?.skip;
    const take = options?.limit;
    const softDeleteColumn =
      options.softDeleteColumnName || SoftDeleteDefaultColumnName;

    if (softDeleteColumn in this.model.fields) {
      where[softDeleteColumn] = Boolean(options.withDeleted);
    }

    const prismaAggregate: any = {
      _group: groupBy,
      where,
      having,
      order,
      select,
      include,
      skip,
      take,
    };

    if (options.sum) {
      prismaAggregate._sum = Object.keys(options.sum).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    if (options.avg) {
      prismaAggregate._avg = Object.keys(options.avg).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    if (options.count) {
      prismaAggregate._count = Object.keys(options.count).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    if (options.min) {
      prismaAggregate._min = Object.keys(options.min).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    if (options.max) {
      prismaAggregate._max = Object.keys(options.max).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    const result = await this.model.groupBy(prismaAggregate);

    return result as Entity[];
  }

  // ################################# Utilities ####################################

  private convertWhereToPrisma(
    where: FindWhereOptions<Entity> | undefined
  ): any {
    if (!where) return {};

    const prismaWhere: any = {};

    for (const [key, value] of Object.entries(where)) {
      if (key === Op_Symbol) {
        Object.assign(
          prismaWhere,
          this.convertOperatorsToPrisma(value as WhereOperators<Entity>)
        );
      } else if (typeof value === 'object' && value !== null) {
        if (Op_Symbol in value) {
          prismaWhere[key] = this.convertOperatorsToPrisma(
            value as WhereOperators<Entity>
          );
        } else {
          prismaWhere[key] = this.convertWhereToPrisma(
            value as FindWhereOptions<Entity>
          );
        }
      } else {
        prismaWhere[key] = value;
      }
    }

    return prismaWhere;
  }

  private convertOperatorsToPrisma(operators: WhereOperators<Entity>): any {
    const prismaOperators: any = {};

    for (const [operator, value] of Object.entries(operators)) {
      switch (operator) {
        case FIND_OPERATOR.LT:
          prismaOperators.lt = value;
          break;
        case FIND_OPERATOR.GT:
          prismaOperators.gt = value;
          break;
        case FIND_OPERATOR.LTE:
          prismaOperators.lte = value;
          break;
        case FIND_OPERATOR.GTE:
          prismaOperators.gte = value;
          break;
        case FIND_OPERATOR.NE:
          prismaOperators.not = value;
          break;
        case FIND_OPERATOR.IN:
          prismaOperators.in = value;
          break;
        case FIND_OPERATOR.NIN:
          prismaOperators.notIn = value;
          break;
        case FIND_OPERATOR.LIKE:
          prismaOperators.contains = value;
          break;
        case FIND_OPERATOR.ILIKE:
          prismaOperators.contains = value;
          prismaOperators.mode = 'insensitive';
          break;
        case FIND_OPERATOR.BETWEEN:
          prismaOperators.gte = (value as any)[0];
          prismaOperators.lte = (value as any)[1];
          break;
        case FIND_OPERATOR.NOT_BETWEEN:
          prismaOperators.not = {
            gte: (value as any)[0],
            lte: (value as any)[1],
          };
          break;
        case FIND_OPERATOR.ISNULL:
          prismaOperators.equals = null;
          break;
        case FIND_OPERATOR.ARRAY_CONTAINS:
          prismaOperators.hasSome = value;
          break;
        case FIND_OPERATOR.SIZE:
          // Prisma doesn't have a direct equivalent, we might need to use a raw query or adjust the data model
          break;
        case FIND_OPERATOR.STARTSWITH:
          prismaOperators.startsWith = value;
          break;
        case FIND_OPERATOR.NOT_STARTSWITH:
          prismaOperators.not = { startsWith: value };
          break;
        case FIND_OPERATOR.ENDSWITH:
          prismaOperators.endsWith = value;
          break;
        case FIND_OPERATOR.NOT_ENDSWITH:
          prismaOperators.not = { endsWith: value };
          break;
        case FIND_OPERATOR.SUBSTRING:
          prismaOperators.contains = value;
          break;
        case FIND_OPERATOR.MATCH:
          // Prisma doesn't support regex directly, we might need to use a raw query
          break;
        case FIND_OPERATOR.AND:
          prismaOperators.AND = (value as any[]).map(this.convertWhereToPrisma);
          break;
        case FIND_OPERATOR.OR:
          prismaOperators.OR = (value as any[]).map(this.convertWhereToPrisma);
          break;
        case FIND_OPERATOR.ANY:
          prismaOperators.hasSome = value;
          break;
        default:
          throw new ForbiddenError(`Unsupported where operator: ${operator}`);
      }
    }

    return prismaOperators;
  }

  private convertUpdateOperatorsToPrisma(
    operators: UpdateOperators<Entity>
  ): any {
    const prismaUpdateOperators: any = {};

    for (const [operator, value] of Object.entries(operators)) {
      switch (operator) {
        case UPDATE_OPERATOR.INC:
          for (const [field, incValue] of Object.entries(value as any)) {
            prismaUpdateOperators[field] = { increment: incValue };
          }
          break;
        case UPDATE_OPERATOR.DEC:
          for (const [field, decValue] of Object.entries(value as any)) {
            prismaUpdateOperators[field] = { decrement: decValue };
          }
          break;
        case UPDATE_OPERATOR.MUL:
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
        acc[key] = true;
      } else if (Array.isArray(value)) {
        acc[key] = { select: this.convertSelectToPrisma(value) };
      } else if (typeof value === 'object') {
        acc[key] = {
          include: this.convertRelationsToPrisma(
            value as RelationsOptions<Entity>
          ),
        };
      }
      return acc;
    }, {});
  }

  private convertOrderToPrisma(
    order: Partial<{ [P in keyof Entity]?: 'asc' | 'desc' }> | undefined
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
}
