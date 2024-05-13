// import { Model } from 'sequelize';
// import { PartialDeep } from 'type-fest';
// import { PropertyOf } from 'type-fest/source/get';
// import {
//   DeleteOptions,
//   FindManyOptions,
//   FindOneOptions,
//   IRepository,
//   NumericColumnAggregateOptions,
//   UpdateOptions,
//   UpsertOptions,
// } from './repository.interface';

// export class SequelizeRepository<Entity> implements IRepository<Entity> {
//   public constructor(private readonly repository: Model<Entity>) {}
//   public findOne(
//     options?: FindOneOptions<Entity> | undefined
//   ): Promise<Entity | null> {
//     throw new Error('Method not implemented.');
//   }
//   public findMany(
//     options?: FindManyOptions<Entity> | undefined
//   ): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public findOneOrFail(
//     options?: FindOneOptions<Entity> | undefined
//   ): Promise<Entity> {
//     throw new Error('Method not implemented.');
//   }
//   public findByIds(
//     ids: PropertyOf<Entity, 'id', {}>[],
//     options?: Omit<FindManyOptions<Entity>, 'where'> | undefined
//   ): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public findById(
//     id: PropertyOf<Entity, 'id', {}>,
//     options?: FindOneOptions<Entity> | undefined
//   ): Promise<Entity | null> {
//     throw new Error('Method not implemented.');
//   }
//   public insertOne(record: PartialDeep<Entity, {}>): Promise<Entity> {
//     throw new Error('Method not implemented.');
//   }
//   public insertMany(records: PartialDeep<Entity, {}>[]): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public updateOne(
//     options?: UpdateOptions<Entity> | undefined
//   ): Promise<Entity | null> {
//     throw new Error('Method not implemented.');
//   }
//   public updateMany(
//     options?: UpdateOptions<Entity> | undefined
//   ): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public upsert(options: UpsertOptions<Entity>): Promise<Entity> {
//     throw new Error('Method not implemented.');
//   }
//   public deleteOne(
//     options?: DeleteOptions<Entity> | undefined
//   ): Promise<Entity | null> {
//     throw new Error('Method not implemented.');
//   }
//   public deleteMany(
//     options?: DeleteOptions<Entity> | undefined
//   ): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public softDeleteOne(
//     options?: DeleteOptions<Entity> | undefined
//   ): Promise<Entity | null> {
//     throw new Error('Method not implemented.');
//   }
//   public softDeleteMany(
//     options?: DeleteOptions<Entity> | undefined
//   ): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public count(options?: FindManyOptions<Entity> | undefined): Promise<number> {
//     throw new Error('Method not implemented.');
//   }
//   public sum(
//     options: NumericColumnAggregateOptions<Entity>
//   ): Promise<number | null> {
//     throw new Error('Method not implemented.');
//   }
//   public average(
//     options: NumericColumnAggregateOptions<Entity>
//   ): Promise<number | null> {
//     throw new Error('Method not implemented.');
//   }
//   public minimum(
//     options: NumericColumnAggregateOptions<Entity>
//   ): Promise<number | null> {
//     throw new Error('Method not implemented.');
//   }
//   public maximum(
//     options: NumericColumnAggregateOptions<Entity>
//   ): Promise<number | null> {
//     throw new Error('Method not implemented.');
//   }
//   public increment(
//     options: NumericColumnAggregateOptions<Entity> & { value: number }
//   ): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public decrement(
//     options: NumericColumnAggregateOptions<Entity> & { value: number }
//   ): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public clear(): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
//   public aggregate(options: AggregateOptions<Entity>): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//   public transact(callback: () => Promise<unknown>): Promise<Promise<unknown>> {
//     throw new Error('Method not implemented.');
//   }
// }
