// import { ConditionalPick, Get, PartialDeep } from 'type-fest';
// import { FIND_OPERATOR } from './constants';

// export interface IRepository<Entity> {
//   findOne(options?: FindOneOptions<Entity>): Promise<Entity | null>;
//   findMany(options?: FindManyOptions<Entity>): Promise<Entity[]>;
//   findOneOrFail(options?: FindOneOptions<Entity>): Promise<Entity>;
//   findByIds(
//     ids: Get<Entity, 'id'>[],
//     options?: Omit<FindManyOptions<Entity>, 'where'>
//   ): Promise<Entity[]>;
//   findById(
//     id: Get<Entity, 'id'>,
//     options?: FindOneOptions<Entity>
//   ): Promise<Entity | null>;
//   insertOne(record: PartialDeep<Entity>): Promise<Entity>;
//   insertMany(records: PartialDeep<Entity>[]): Promise<Entity[]>;
//   updateOne(options?: UpdateOptions<Entity>): Promise<Entity | null>;
//   updateMany(options?: UpdateOptions<Entity>): Promise<Entity[]>;
//   upsert(options: UpsertOptions<Entity>): Promise<Entity>;
//   deleteOne(options?: DeleteOptions<Entity>): Promise<Entity | null>;
//   deleteMany(options?: DeleteOptions<Entity>): Promise<Entity[]>;
//   softDeleteOne(options?: DeleteOptions<Entity>): Promise<Entity | null>;
//   softDeleteMany(options?: DeleteOptions<Entity>): Promise<Entity[]>;
//   count(options?: FindManyOptions<Entity>): Promise<number>;
//   sum(options: NumericColumnAggregateOptions<Entity>): Promise<number | null>;
//   average(
//     options: NumericColumnAggregateOptions<Entity>
//   ): Promise<number | null>;
//   minimum(
//     options: NumericColumnAggregateOptions<Entity>
//   ): Promise<number | null>;
//   maximum(
//     options: NumericColumnAggregateOptions<Entity>
//   ): Promise<number | null>;
//   increment(
//     options: NumericColumnAggregateOptions<Entity> & { value: number }
//   ): Promise<Entity[]>;
//   decrement(
//     options: NumericColumnAggregateOptions<Entity> & { value: number }
//   ): Promise<Entity[]>;
//   /**
//    * @description Clears all the data from the given table/collection (truncates/drops it).
//    * @returns {Promise<void>}
//    */
//   clear(): Promise<void>;
//   aggregate(options: AggregateOptions<Entity>): Promise<Entity[]>;
//   transact<R>(callback: () => Promise<R>): ReturnType<typeof callback>;
// }

// export type FindWhereOptions<Entity> = {
//   op?: WhereOperators<Entity>;
// } & PartialDeep<Entity>;

// export interface CommonOptions<Entity> {
//   select?: keyof Entity[];
//   relations?: { [P in keyof Entity]?: keyof Entity[P][] | true };
//   transaction?: boolean;
// }

// export interface FindOneOptions<Entity> extends CommonOptions<Entity> {
//   where?: FindWhereOptions<Entity>;
//   order?: {
//     [P in keyof Entity]?: 'asc' | 'desc';
//   };
//   withDeleted?: boolean;
// }

// export interface FindManyOptions<Entity> extends FindOneOptions<Entity> {
//   skip?: number;
//   limit?: number;
// }

// export interface UpdateOptions<Entity> {
//   update: PartialDeep<Entity> & { op?: UpdateOperators<Entity> };
//   where?: FindWhereOptions<Entity>;
//   options?: CommonOptions<Entity>;
// }

// export interface DeleteOptions<Entity> {
//   where?: FindWhereOptions<Entity>;
//   options?: CommonOptions<Entity>;
// }

// export interface NumericColumnAggregateOptions<Entity> {
//   columnName: ConditionalPick<Entity, number>;
//   where?: FindWhereOptions<Entity>;
// }

// export interface UpsertOptions<Entity> {
//   update: PartialDeep<Entity>;
//   where: FindWhereOptions<Entity>;
// }

// interface AggregateOptions<Entity> {
//   by: keyof Entity[];
//   having?: FindWhereOptions<Entity>;
//   where?: FindWhereOptions<Entity>;
//   order?: {
//     [P in keyof Entity]?: 'asc' | 'desc';
//   };
//   sum?: {
//     [P in keyof Entity]?: true;
//   };
//   avg?: {
//     [P in keyof Entity]?: true;
//   };
//   count?: {
//     [P in keyof Entity]?: true;
//   };
//   limit?: number;
//   skip?: number;
//   select?: keyof Entity[];
//   relations?: { [P in keyof Entity]?: keyof Entity[P][] | true };
//   withDeleted?: boolean;
//   transaction?: boolean;
// }

// // Operators
// export interface WhereOperators<Entity> {
//   [FIND_OPERATOR.LT]?: { [P in keyof Entity]: number };
//   [FIND_OPERATOR.GT]?: { [P in keyof Entity]: number };
//   [FIND_OPERATOR.LTE]?: { [P in keyof Entity]: number };
//   [FIND_OPERATOR.GTE]?: { [P in keyof Entity]: number };
//   [FIND_OPERATOR.NE]?: { [P in keyof Entity]: Entity[P] };
//   [FIND_OPERATOR.IN]?: { [P in keyof Entity]: Entity[P][] };
//   [FIND_OPERATOR.NIN]?: { [P in keyof Entity]: Entity[P][] };
//   [FIND_OPERATOR.AND]?: { [P in keyof Entity]: Entity[P] }[];
//   [FIND_OPERATOR.OR]?: { [P in keyof Entity]: Entity[P] }[];
//   [FIND_OPERATOR.LIKE]?: string;
//   [FIND_OPERATOR.ILIKE]?: string;
//   [FIND_OPERATOR.BETWEEN]?: { [P in keyof Entity]: [Entity[P], Entity[P]] };
//   [FIND_OPERATOR.NOT_BETWEEN]?: { [P in keyof Entity]: [Entity[P], Entity[P]] };
//   [FIND_OPERATOR.ISNULL]?: { [P in keyof Entity]: null };
//   [FIND_OPERATOR.ANY]?: { [P in keyof Entity]: Entity[P][] };
//   [FIND_OPERATOR.ARRAY_CONTAINS]?: { [P in keyof Entity]: Entity[P][] };
//   [FIND_OPERATOR.SIZE]: { [P in keyof Entity]: number };
//   [FIND_OPERATOR.STARTSWITH]?: { [P in keyof Entity]: string };
//   [FIND_OPERATOR.NOT_STARTSWITH]?: { [P in keyof Entity]: string };
//   [FIND_OPERATOR.ENDSWITH]?: { [P in keyof Entity]: string };
//   [FIND_OPERATOR.NOT_ENDSWITH]?: { [P in keyof Entity]: string };
//   [FIND_OPERATOR.SUBSTRING]?: { [P in keyof Entity]: string };
//   [FIND_OPERATOR.MATCH]?: { [P in keyof Entity]: RegExp | string };
// }

// export interface UpdateOperators<Entity> {
//   inc?: { [P in keyof Entity]: number };
//   dec?: { [P in keyof Entity]: number };
//   mul?: { [P in keyof Entity]: number };
// }
