// import { Prisma, PrismaClient } from '@prisma/client';
// import { PartialDeep } from 'type-fest';
// import { FIND_OPERATOR, UPDATE_OPERATOR } from './constants';
// import {
//   DeleteOptions,
//   FindManyOptions,
//   FindOneOptions,
//   FindWhereOptions,
//   IRepository,
//   NumericColumnAggregateOptions,
//   RelationsOptions,
//   SelectOptions,
//   UpdateOperators,
//   UpdateOptions,
//   UpsertOptions,
//   WhereOperators,
// } from './repository.interface';
// import { ForbiddenError, NotFoundError } from '@/common/errors';

// export class PrismaRepository<Entity> implements IRepository<Entity> {
//   public constructor(
//     private readonly prisma: PrismaClient,
//     private readonly modelName: string
//   ) {}

//   private get model(): any {
//     const prismaModel = this.prisma[this.modelName] as any;
//     if (!prismaModel) {
//       throw new NotFoundError(`Invalid model name: ${this.modelName}`);
//     }
//     return prismaModel;
//   }

//   public async findOne(options?: FindOneOptions<Entity>): Promise<Entity | null> {
//     const where = options?.where ? this.convertWhereToPrisma(options.where) : {};
//     const select = options?.select ? this.convertSelectToPrisma(options.select) : undefined;
//     const include = options?.relations ? this.convertRelationsToPrisma(options.relations) : undefined;
//     const orderBy = options?.order ? this.convertOrderToPrisma(options.order) : undefined;

//     if (options?.withDeleted) {
//       where.isDeleted = true;
//     }else {
//       where.isDeleted = false;
//     }

//     const result = await this.model.findFirst({
//       where,
//       select,
//       include,
//       orderBy
//     });
//     return result as Entity | null;
//   }

//   public async findMany(options?: FindManyOptions<Entity>): Promise<Entity[]> {
//     const where = options?.where ? this.convertWhereToPrisma(options.where) : {};
//     const select = options?.select ? this.convertSelectToPrisma(options.select) : undefined;
//     const include = options?.relations ? this.convertRelationsToPrisma(options.relations) : undefined;
//     const orderBy = options?.order ? this.convertOrderToPrisma(options.order) : undefined;
//     const skip = options?.skip;
//     const take = options?.limit;

//     if (options?.withDeleted) {
//       where.isDeleted = true;
//     }else {
//       where.isDeleted = false;
//     }

//     const result = await this.model.findMany({
//       where,
//       select,
//       include,
//       orderBy,
//       skip,
//       take
//     });
//     return result as Entity[];
//   }

//   public async findOneOrFail(options?: FindOneOptions<Entity>): Promise<Entity> {
//     const where = options?.where ? this.convertWhereToPrisma(options.where) : {};
//     const select = options?.select ? this.convertSelectToPrisma(options.select) : undefined;
//     const include = options?.relations ? this.convertRelationsToPrisma(options.relations) : undefined;
//     const orderBy = options?.order ? this.convertOrderToPrisma(options.order) : undefined;

//     if (options?.withDeleted) {
//       where.isDeleted = true;
//     }else {
//       where.isDeleted = false;
//     }

//     const result = await this.model.findFirst({
//       where,
//       select,
//       include,
//       orderBy
//     });

//     if(result){
//       return result;
//     }else {
//       throw new NotFoundError();
//     }
//   }

//   public async findByIds<K extends keyof Entity>(ids: Entity[K][], options?: Omit<FindManyOptions<Entity>, 'where'> | undefined): Promise<Entity[]> {
//     const where: any = { id: { in: ids } };
//     const select = options?.select ? this.convertSelectToPrisma(options.select) : undefined;
//     const include = options?.relations ? this.convertRelationsToPrisma(options.relations) : undefined;
//     const orderBy = options?.order ? this.convertOrderToPrisma(options.order) : undefined;
//     const skip = options?.skip;
//     const take = options?.limit;

//     if (options?.withDeleted) {
//       where.isDeleted = true;
//     }else {
//       where.isDeleted = false;
//     }

//     const result = await this.model.findMany({
//       where,
//       select,
//       include,
//       orderBy,
//       skip,
//       take
//     });
//     return result as Entity[];
//   }

//   public async findById<K extends keyof Entity>(id: Entity[K], options?: Omit<FindOneOptions<Entity>, 'where'> | undefined): Promise<Entity | null> {
//     const where: any = {id};
//     const select = options?.select ? this.convertSelectToPrisma(options.select) : undefined;
//     const include = options?.relations ? this.convertRelationsToPrisma(options.relations) : undefined;
//     const orderBy = options?.order ? this.convertOrderToPrisma(options.order) : undefined;

//     if (options?.withDeleted) {
//       where.isDeleted = true;
//     }else {
//       where.isDeleted = false;
//     }

//     const result = await this.model.findFirst({
//       where,
//       select,
//       include,
//       orderBy
//     });
//     return result as Entity | null;
//   }

//   public async distinct<K extends keyof Entity>(field: K, options?: Omit<FindManyOptions<Entity>, 'select'> | undefined): Promise<Entity[K][]> {
//     const where = options?.where ? this.convertWhereToPrisma(options.where) : {};
//     const include = options?.relations ? this.convertRelationsToPrisma(options.relations) : undefined;
//     const orderBy = options?.order ? this.convertOrderToPrisma(options.order) : undefined;
//     const skip = options?.skip;
//     const take = options?.limit;

//     if (options?.withDeleted) {
//       where.isDeleted = true;
//     }else {
//       where.isDeleted = false;
//     }

//     const result = await this.model.findMany({
//       where,
//       include,
//       orderBy,
//       skip,
//       take,
//       select: { [field]: true },
//       distinct: [field as string],
//     });
//     return result.map((item: any) => item[field as string]);
//   }

//   public async insertOne(record: PartialDeep<Entity, {}>): Promise<Entity> {
//     const createInput = this.convertToPrismaCreateInput(record);

//     try {
//       const result = await this.model.create({
//         data: createInput,
//       });

//       return result as Entity;
//     } catch (error) {
//       throw new Error(`Failed to insert entity: ${error}`);
//     }
//   }

//   public async insertMany(records: PartialDeep<Entity, {}>[]): Promise<Entity[]> {
//     const prismaRecords = records.map(record => this.convertToPrismaCreateInput(record));

//     const result = await this.model.createMany({
//       data: prismaRecords,
//       skipDuplicates: false, // You can make this configurable if needed
//     });

//     // Fetch and return the inserted records
//     // Note: Prisma's createMany doesn't return the created objects, so we need to fetch them separately
//     const createdRecords = await this.model.findMany({
//       where: {
//         id: {
//           in: result.ids as any[],
//         },
//       },
//     });

//     return createdRecords as Entity[];
//   }

//   public async updateOne(options?: UpdateOptions<Entity> | undefined): Promise<Entity | null> {
//     if(!options || !options.update){
//       return null;
//     }

//     const { update, where: whereOptions, options: extraOptions } = options;

//     const data = this.convertUpdateData(update);
//     const where = this.convertWhereToPrisma(whereOptions);
//     const select = extraOptions?.select ? this.convertSelectToPrisma(extraOptions.select) : undefined;
//     const include = extraOptions?.relations ? this.convertRelationsToPrisma(extraOptions.relations) : undefined;

//     try {
//       const result = await this.model.update({
//         where: where,
//         data,
//         select,
//         include,
//       });

//       return result as Entity;
//     } catch (error: any) {
//       if (error?.code === 'P2025') {
//         // Prisma error code for "Record to update not found"
//         return null;
//       }
//       throw error;
//     }
//   }

//   private convertWhereToPrisma(where: FindWhereOptions<Entity>): any {
//     const prismaWhere: any = {};

//     for (const [key, value] of Object.entries(where)) {
//       if (key === 'op') {
//         Object.assign(prismaWhere, this.convertOperatorsToPrisma(value as WhereOperators<Entity>));
//       } else if (typeof value === 'object' && value !== null) {
//         if ('op' in value) {
//           prismaWhere[key] = this.convertOperatorsToPrisma(value as WhereOperators<Entity>);
//         } else {
//           prismaWhere[key] = this.convertWhereToPrisma(value as FindWhereOptions<Entity>);
//         }
//       } else {
//         prismaWhere[key] = value;
//       }

//     }

//     return prismaWhere;
//   }

//   private convertOperatorsToPrisma(operators: WhereOperators<Entity>): any {
//     const prismaOperators: any = {};

//     for (const [operator, value] of Object.entries(operators)) {
//       switch (operator) {
//         case FIND_OPERATOR.LT:
//           prismaOperators.lt = value;
//           break;
//         case FIND_OPERATOR.GT:
//           prismaOperators.gt = value;
//           break;
//         case FIND_OPERATOR.LTE:
//           prismaOperators.lte = value;
//           break;
//         case FIND_OPERATOR.GTE:
//           prismaOperators.gte = value;
//           break;
//         case FIND_OPERATOR.NE:
//           prismaOperators.not = value;
//           break;
//         case FIND_OPERATOR.IN:
//           prismaOperators.in = value;
//           break;
//         case FIND_OPERATOR.NIN:
//           prismaOperators.notIn = value;
//           break;
//         case FIND_OPERATOR.LIKE:
//           prismaOperators.contains = value;
//           break;
//         case FIND_OPERATOR.ILIKE:
//           prismaOperators.contains = value;
//           prismaOperators.mode = 'insensitive';
//           break;
//         case FIND_OPERATOR.BETWEEN:
//           prismaOperators.gte = (value as any)[0];
//           prismaOperators.lte = (value as any)[1];
//           break;
//         case FIND_OPERATOR.NOT_BETWEEN:
//           prismaOperators.not = { gte: (value as any)[0], lte: (value as any)[1] };
//           break;
//         case FIND_OPERATOR.ISNULL:
//           prismaOperators.equals = null;
//           break;
//         case FIND_OPERATOR.ARRAY_CONTAINS:
//           prismaOperators.hasSome = value;
//           break;
//         case FIND_OPERATOR.SIZE:
//           // Prisma doesn't have a direct equivalent, we might need to use a raw query or adjust the data model
//           break;
//         case FIND_OPERATOR.STARTSWITH:
//           prismaOperators.startsWith = value;
//           break;
//         case FIND_OPERATOR.NOT_STARTSWITH:
//           prismaOperators.not = { startsWith: value };
//           break;
//         case FIND_OPERATOR.ENDSWITH:
//           prismaOperators.endsWith = value;
//           break;
//         case FIND_OPERATOR.NOT_ENDSWITH:
//           prismaOperators.not = { endsWith: value };
//           break;
//         case FIND_OPERATOR.SUBSTRING:
//           prismaOperators.contains = value;
//           break;
//         case FIND_OPERATOR.MATCH:
//           // Prisma doesn't support regex directly, we might need to use a raw query
//           break;
//         case FIND_OPERATOR.AND:
//           prismaOperators.AND = (value as any[]).map(this.convertWhereToPrisma);
//           break;
//         case FIND_OPERATOR.OR:
//           prismaOperators.OR = (value as any[]).map(this.convertWhereToPrisma);
//           break;
//         case FIND_OPERATOR.ANY:
//           prismaOperators.hasSome = value;
//           break;
//         default:
//           throw new ForbiddenError(`Unsupported where operator: ${operator}`)
//       }
//     }

//     return prismaOperators;
//   }

//   private convertUpdateOperatorsToPrisma(operators: UpdateOperators<Entity>): any {
//     const prismaUpdateOperators: any = {};

//     for (const [operator, value] of Object.entries(operators)) {
//       switch(operator){
//         case UPDATE_OPERATOR.INC:
//           for (const [field, incValue] of Object.entries(value)) {
//             prismaUpdateOperators[field] = { increment: incValue };
//           }
//           break;
//         case UPDATE_OPERATOR.DEC:
//           for (const [field, decValue] of Object.entries(value)) {
//             prismaUpdateOperators[field] = { decrement: decValue };
//           }
//           break;
//         case UPDATE_OPERATOR.MUL:
//           for (const [field, mulValue] of Object.entries(value)) {
//             prismaUpdateOperators[field] = { multiply: mulValue };
//           }
//           break;
//         default:
//           throw new ForbiddenError(`Unsupported update operator: ${operator}`)
//       }
//     }

//     return prismaUpdateOperators;
//   }

//   private convertSelectToPrisma(select: SelectOptions<Entity>): any {
//     if (Array.isArray(select)) {
//       return select.reduce((acc: any, key) => {
//         acc[key as string] = true;
//         return acc;
//       }, {});
//     } else {
//       return Object.entries(select).reduce((acc: any, [key, value]) => {
//         if (typeof value === 'object') {
//           acc[key] = this.convertSelectToPrisma(value as SelectOptions<Entity>);
//         } else {
//           acc[key] = value;
//         }
//         return acc;
//       }, {});
//     }
//   }

//   private convertRelationsToPrisma(relations: RelationsOptions<Entity>): any {
//     return Object.entries(relations).reduce((acc: any, [key, value]) => {
//       if (value === true) {
//         acc[key] = true;
//       } else if (Array.isArray(value)) {
//         acc[key] = { select: this.convertSelectToPrisma(value) };
//       } else if (typeof value === 'object') {
//         acc[key] = {include: this.convertRelationsToPrisma(value as RelationsOptions<Entity>)};
//       }
//       return acc;
//     }, {});
//   }

//   private convertOrderToPrisma(order: Partial<{ [P in keyof Entity]?: 'asc' | 'desc' }>): any {
//     return Object.entries(order).reduce((acc: any, [key, value]) => {
//       acc[key] = value;
//       return acc;
//     }, {});
//   }

//   private convertToPrismaCreateInput(record: PartialDeep<Entity>): any {
//     const convertedRecord: any = {};

//     for (const [key, value] of Object.entries(record as any)) {
//       if (value !== undefined) {
//         if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
//           // Handle nested objects
//           convertedRecord[key] = this.convertToPrismaCreateInput(value as PartialDeep<Entity>);
//         } else if (Array.isArray(value)) {
//           // Handle arrays
//           convertedRecord[key] = value.map(item =>
//             typeof item === 'object' && item !== null
//               ? this.convertToPrismaCreateInput(item as PartialDeep<Entity>)
//               : item
//           );
//         } else {
//           // Handle primitive values
//           convertedRecord[key] = value;
//         }
//       }
//     }

//     return convertedRecord;
//   }

//   private convertUpdateData(update: PartialDeep<Entity> & { op?: UpdateOperators<Entity> }): any {
//     const prismaUpdate: any = {};

//     for (const [key, value] of Object.entries(update)) {
//       if (key === 'op') {
//         Object.assign(prismaUpdate, this.convertUpdateOperatorsToPrisma(value as UpdateOperators<Entity>));
//       } else {
//         prismaUpdate[key] = value;
//       }
//     }

//     return prismaUpdate;
//   }
// }
//   // public findOne(options?: FindOneOptions<Entity>): Promise<Entity | null> {
//   //   const prismaOptions: any = this.buildFindOptions(options);
//   //   return this.prisma[this.modelName].findFirst(prismaOptions);
//   // }
//   // public findMany(
//   //   options?: FindManyOptions<Entity> | undefined
//   // ): Promise<Entity[]> {
//   //   const prismaOptions: any = this.buildFindOptions(options);
//   //   if (options?.skip) prismaOptions.skip = options.skip;
//   //   if (options?.limit) prismaOptions.take = options.limit;
//   //   return this.prisma[this.modelName].findMany(prismaOptions);
//   // }
//   // public async findOneOrFail(
//   //   options?: FindOneOptions<Entity> | undefined
//   // ): Promise<Entity> {
//   //   const result = await this.findOne(options);
//   //   if (!result) throw new Error('Entity not found');
//   //   return result;
//   // }
//   // public findByIds(
//   //   ids: Get<Entity, 'id'>[],
//   //   options?: Omit<FindManyOptions<Entity>, 'where'> | undefined
//   // ): Promise<Entity[]> {
//   //   const prismaOptions: any = this.buildFindOptions(options);
//   //   prismaOptions.where = { id: { in: ids } };
//   //   return this.prisma[this.modelName].findMany(prismaOptions);
//   // }
//   // public findById(
//   //   id: Get<Entity, 'id'>,
//   //   options?: FindOneOptions<Entity> | undefined
//   // ): Promise<Entity | null> {
//   //   const prismaOptions: any = this.buildFindOptions(options);
//   //   prismaOptions.where = { ...prismaOptions.where, id };
//   //   return this.prisma[this.modelName].findUnique(prismaOptions);
//   // }
//   // public insertOne(record: PartialDeep<Entity, {}>): Promise<Entity> {
//   //   return this.prisma[this.modelName].create({ data: record as any });
//   // }
//   // public insertMany(records: PartialDeep<Entity, {}>[]): Promise<Entity[]> {
//   //   return this.prisma[this.modelName].createMany({ data: records as any[] });
//   // }
//   // public updateOne(
//   //   options?: UpdateOptions<Entity> | undefined
//   // ): Promise<Entity | null> {
//   //   if (!options?.where) throw new Error('Where clause is required for updateOne');
//   //   const prismaOptions: any = {
//   //     where: this.convertWhereOptions(options.where),
//   //     data: this.convertUpdateData(options.update),
//   //   };
//   //   if (options?.options?.select) prismaOptions.select = this.convertSelect(options.options.select);
//   //   return this.prisma[this.modelName].update(prismaOptions);
//   // }
//   // public updateMany(
//   //   options?: UpdateOptions<Entity> | undefined
//   // ): Promise<Entity[]> {
//   //   const prismaOptions: any = {
//   //     where: options?.where ? this.convertWhereOptions(options.where) : undefined,
//   //     data: this.convertUpdateData(options!.update),
//   //   };
//   //   await this.prisma[this.modelName].updateMany(prismaOptions);
//   //   return this.findMany({ where: options?.where });
//   // }
//   // public upsert(options: UpsertOptions<Entity>): Promise<Entity> {
//   //   const prismaOptions: any = {
//   //     where: this.convertWhereOptions(options.where),
//   //     update: options.update as any,
//   //     create: options.update as any,
//   //   };
//   //   return this.prisma[this.modelName].upsert(prismaOptions);
//   // }
//   // public deleteOne(
//   //   options?: DeleteOptions<Entity> | undefined
//   // ): Promise<Entity | null> {
//   //   if (!options?.where) throw new Error('Where clause is required for deleteOne');
//   //   const prismaOptions: any = {
//   //     where: this.convertWhereOptions(options.where),
//   //   };
//   //   return this.prisma[this.modelName].delete(prismaOptions);
//   // }
//   // public deleteMany(
//   //   options?: DeleteOptions<Entity> | undefined
//   // ): Promise<Entity[]> {
//   //   const prismaOptions: any = {
//   //     where: options?.where ? this.convertWhereOptions(options.where) : undefined,
//   //   };
//   //   const deletedEntities = await this.findMany(options);
//   //   await this.prisma[this.modelName].deleteMany(prismaOptions);
//   //   return deletedEntities;
//   // }
//   // public softDeleteOne(
//   //   options?: DeleteOptions<Entity> | undefined
//   // ): Promise<Entity | null> {
//   //   if (!options?.where) throw new Error('Where clause is required for softDeleteOne');
//   //   const prismaOptions: any = {
//   //     where: this.convertWhereOptions(options.where),
//   //     data: { deletedAt: new Date() },
//   //   };
//   //   return this.prisma[this.modelName].update(prismaOptions);
//   // }
//   // public softDeleteMany(
//   //   options?: DeleteOptions<Entity> | undefined
//   // ): Promise<Entity[]> {
//   //   const prismaOptions: any = {
//   //     where: options?.where ? this.convertWhereOptions(options.where) : undefined,
//   //     data: { deletedAt: new Date() },
//   //   };
//   //   await this.prisma[this.modelName].updateMany(prismaOptions);
//   //   return this.findMany({ where: options?.where });
//   // }
//   // public count(options?: FindManyOptions<Entity> | undefined): Promise<number> {
//   //   const prismaOptions: any = this.buildFindOptions(options);
//   //   return this.prisma[this.modelName].count(prismaOptions);
//   // }
//   // public sum(
//   //   options: NumericColumnAggregateOptions<Entity>
//   // ): Promise<number | null> {
//   //   const prismaOptions: any = {
//   //     where: options.where ? this.convertWhereOptions(options.where) : undefined,
//   //     _sum: { [options.columnName]: true },
//   //   };
//   //   const result = await this.prisma[this.modelName].aggregate(prismaOptions);
//   //   return result._sum[options.columnName] || null;
//   // }
//   // public average(
//   //   options: NumericColumnAggregateOptions<Entity>
//   // ): Promise<number | null> {
//   //   const prismaOptions: any = {
//   //     where: options.where ? this.convertWhereOptions(options.where) : undefined,
//   //     _avg: { [options.columnName]: true },
//   //   };
//   //   const result = await this.prisma[this.modelName].aggregate(prismaOptions);
//   //   return result._avg[options.columnName] || null;
//   // }
//   // public minimum(
//   //   options: NumericColumnAggregateOptions<Entity>
//   // ): Promise<number | null> {
//   //   const prismaOptions: any = {
//   //     where: options.where ? this.convertWhereOptions(options.where) : undefined,
//   //     _min: { [options.columnName]: true },
//   //   };
//   //   const result = await this.prisma[this.modelName].aggregate(prismaOptions);
//   //   return result._min[options.columnName] || null;
//   // }
//   // public maximum(
//   //   options: NumericColumnAggregateOptions<Entity>
//   // ): Promise<number | null> {
//   //   const prismaOptions: any = {
//   //     where: options.where ? this.convertWhereOptions(options.where) : undefined,
//   //     _max: { [options.columnName]: true },
//   //   };
//   //   const result = await this.prisma[this.modelName].aggregate(prismaOptions);
//   //   return result._max[options.columnName] || null;
//   // }
//   // public increment(
//   //   options: NumericColumnAggregateOptions<Entity> & { value: number }
//   // ): Promise<Entity[]> {
//   //   const prismaOptions: any = {
//   //     where: options.where ? this.convertWhereOptions(options.where) : undefined,
//   //     data: { [options.columnName]: { increment: options.value } },
//   //   };
//   //   await this.prisma[this.modelName].updateMany(prismaOptions);
//   //   return this.findMany({ where: options.where });
//   // }
//   // public decrement(
//   //   options: NumericColumnAggregateOptions<Entity> & { value: number }
//   // ): Promise<Entity[]> {
//   //   const prismaOptions: any = {
//   //     where: options.where ? this.convertWhereOptions(options.where) : undefined,
//   //     data: { [options.columnName]: { decrement: options.value } },
//   //   };
//   //   await this.prisma[this.modelName].updateMany(prismaOptions);
//   //   return this.findMany({ where: options.where });
//   // }
//   // public clear(): Promise<void> {
//   //   await this.prisma[this.modelName].deleteMany({});
//   // }
//   // public aggregate(options: AggregateOptions<Entity>): Promise<Entity[]> {
//   //   const prismaOptions: any = {
//   //     where: options.where ? this.convertWhereOptions(options.where) : undefined,
//   //     orderBy: options.order,
//   //     take: options.limit,
//   //     skip: options.skip,
//   //     select: this.convertSelect(options.select),
//   //     _count: options.count,
//   //     _sum: options.sum,
//   //     _avg: options.avg,
//   //   };

//   //   if (options.by) {
//   //     prismaOptions.by = options.by;
//   //   }

//   //   if (options.having) {
//   //     prismaOptions.having = this.convertWhereOptions(options.having);
//   //   }

//   //   return this.prisma[this.modelName].groupBy(prismaOptions);
//   // }
//   // public transact(callback: () => Promise<unknown>): Promise<Promise<unknown>> {
//   //   return this.prisma.$transaction(callback);
//   // }

//   // private buildFindOptions(
//   //   options?: FindOneOptions<Entity> | FindManyOptions<Entity>
//   // ): any {
//   //   const prismaOptions: any = {};

//   //   if (options?.where) {
//   //     prismaOptions.where = this.convertWhereOptions(options.where);
//   //   }

//   //   if (options?.order) {
//   //     prismaOptions.orderBy = options.order;
//   //   }

//   //   if (options?.select) {
//   //     prismaOptions.select = this.convertSelect(options.select);
//   //   }

//   //   if (options?.relations) {
//   //     prismaOptions.include = this.convertRelations(options.relations);
//   //   }

//   //   if (options?.withDeleted) {
//   //     prismaOptions.where = {
//   //       ...prismaOptions.where,
//   //       deletedAt: { not: null },
//   //     };
//   //   }

//   //   return prismaOptions;
//   // }

//   // private convertWhereOptions(where: FindWhereOptions<Entity>): any {
//   //   const prismaWhere: any = {};

//   //   for (const [key, value] of Object.entries(where)) {
//   //     if (key === 'op') {
//   //       for (const [opKey, opValue] of Object.entries(value as any)) {
//   //         const value = opValue as any;
//   //         switch (opKey) {
//   //           case FIND_OPERATOR.LT:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { lt: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.GT:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { gt: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.LTE:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { lte: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.GTE:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { gte: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.NE:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { not: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.IN:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { in: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.NIN:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { notIn: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.LIKE:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { contains: val },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.ILIKE:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { contains: val, mode: 'insensitive' },
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.BETWEEN:
//   //             prismaWhere.AND = Object.entries(value).map(
//   //               ([field, [min, max]]) => ({ [field]: { gte: min, lte: max } })
//   //             );
//   //             break;
//   //           case FIND_OPERATOR.NOT_BETWEEN:
//   //             prismaWhere.AND = Object.entries(value).map(
//   //               ([field, [min, max]]) => ({
//   //                 [field]: { not: { gte: min, lte: max } },
//   //               })
//   //             );
//   //             break;
//   //           case FIND_OPERATOR.ISNULL:
//   //             prismaWhere.AND = Object.entries(value).map(([field]) => ({
//   //               [field]: null,
//   //             }));
//   //             break;
//   //           case FIND_OPERATOR.ARRAY_CONTAINS:
//   //             prismaWhere.AND = Object.entries(value).map(([field, val]) => ({
//   //               [field]: { hasEvery: val },
//   //             }));
//   //             break;
//   //           // Add more operators as needed
//   //         }
//   //       }
//   //     } else {
//   //       prismaWhere[key] = value;
//   //     }
//   //   }
//   // }

//   // private convertRelations(relations: any): any {
//   //   const include: any = {};

//   //   for (const [key, value] of Object.entries(relations)) {
//   //     if (value === true) {
//   //       include[key] = true;
//   //     } else if (Array.isArray(value)) {
//   //       include[key] = { select: this.convertSelect(value) };
//   //     }
//   //   }

//   //   return include;
//   // }

//   // private convertUpdateData(update: PartialDeep<Entity> & { op?: UpdateOperators<Entity> }): any {
//   //   const data: any = { ...update };
//   //   delete data.op;

//   //   if (update.op) {
//   //     if (update.op.inc) {
//   //       for (const [key, value] of Object.entries(update.op.inc)) {
//   //         data[key] = { increment: value };
//   //       }
//   //     }
//   //     if (update.op.dec) {
//   //       for (const [key, value] of Object.entries(update.op.dec)) {
//   //         data[key] = { decrement: value };
//   //       }
//   //     }
//   //     if (update.op.mul) {
//   //       for (const [key, value] of Object.entries(update.op.mul)) {
//   //         data[key] = { multiply: value };
//   //       }
//   //     }
//   //   }

//   //   return data;
//   // }
// }
