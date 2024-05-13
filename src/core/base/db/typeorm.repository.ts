// import { PartialDeep } from 'type-fest';
// import { PropertyOf } from 'type-fest/source/get';
// import {
//   And,
//   Any,
//   ArrayContains,
//   Between,
//   Equal,
//   FindOneOptions,
//   FindOptionsWhere,
//   ILike,
//   In,
//   IsNull,
//   LessThan,
//   LessThanOrEqual,
//   Like,
//   MoreThan,
//   MoreThanOrEqual,
//   Not,
//   ObjectLiteral,
//   Or,
//   Repository,
// } from 'typeorm';
// import {
//   DeleteOptions,
//   FindManyOptions,
//   WhereOperators,
//   FindWhereOptions,
//   FindOneOptions as IFindOneOptions,
//   IRepository,
//   NumericColumnAggregateOptions,
//   UpdateOptions,
//   UpsertOptions,
// } from './repository.interface';
// import { FIND_OPERATOR } from './constants';

// /**
//  * Represents a TypeORM repository that implements the IRepository interface.
//  *
//  * @template Entity - The entity type that the repository operates on.
//  */
// export class TypeORMRepository<Entity> implements IRepository<Entity> {
//   public constructor(private readonly repository: Repository<Entity extends ObjectLiteral>) {}
//   public async findOne(
//     options: IFindOneOptions<Entity> = {}
//   ): Promise<Entity | null> {
//     const findOptions: FindOneOptions<Entity> = {
//       where: this.wherify(options.where),
//       order: undefined,
//       select: options.select || undefined,
//       relations: options.relations || undefined,
//       withDeleted: options.withDeleted || false,
//       transaction: options.transaction || false,
//     };

//     if (options) {
//       findOptions.select = options.select;
//       findOptions.relations = options.relations;
//       findOptions.order = options.order;
//     }

//     const result = await this.repository.findOne(findOptions);
//     return result || null;
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

//   /**
//    * Executes a transaction in the database.
//    * The transaction is automatically rolled back if an error occurs,
//    * otherwise it is committed.
//    *
//    * @param {() => Promise<R>} callback - The function to be executed in the transaction.
//    *                                      This function represents the operations to be
//    *                                      performed within the transaction. It should
//    *                                      return a Promise that resolves to the result
//    *                                      of the transaction.
//    * @returns {Promise<R>} - A Promise that resolves to the result of the callback function.
//    *                         If an error occurs within the transaction, the transaction
//    *                         is rolled back, and the error is re-thrown.
//    *                         If the transaction is successful, it is committed, and
//    *                         the Promise returned by the callback function is returned.
//    */
//   public async transact<R>(callback: () => Promise<R>): Promise<R> {
//     const queryRunner = this.repository.queryRunner;
//     if (!queryRunner)
//       throw new Error(
//         'The `queryRunner` is not set. Make sure to set the `queryRunner` before executing a transaction.'
//       );
//     if (typeof callback !== 'function')
//       throw new Error('Callback must be a function');
//     if (queryRunner.isTransactionActive) return callback();

//     await queryRunner.startTransaction();
//     try {
//       const result = await callback();
//       await queryRunner.commitTransaction();
//       return result;
//     } catch (err) {
//       await queryRunner.rollbackTransaction();
//       throw err;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   private wherify(
//     options: FindWhereOptions<Entity> | undefined
//   ): FindOptionsWhere<Entity> {
//     if (!options) return {};

//     const { op, ...filters } = options;
//     const where: FindOptionsWhere<Entity> = { ...filters };

//     if (op) {
//       for (const [operator, value] of Object.entries(op)) {
//         const condition = this.translateWhereOperator(operator as FIND_OPERATOR, value as WhereOperators<Entity>[FIND_OPERATOR]);

//         // where[operator as keyof FindOptionsWhere<Entity>] = condition;
//       }
//     }

//     return where;
//   }

//   private translateWhereOperator(operator: FIND_OPERATOR, condition: WhereOperators<Entity>[FIND_OPERATOR]) {
//     if(!condition) return;

//     const keys = Object.keys(condition);
//     const values = Object.values(condition);
//     switch(operator){
//         case FIND_OPERATOR.LT:
//             return { [keys[0]]: LessThan(values[0]) };
//         case FIND_OPERATOR.GT:
//             return {[keys[0]]: MoreThan(values[0])};
//         case FIND_OPERATOR.LTE:
//             return {[keys[0]]: LessThanOrEqual(values[0])};
//         case FIND_OPERATOR.GTE:
//             return {[keys[0]]: MoreThanOrEqual(values[0])};
//         case FIND_OPERATOR.AND:
//             return condition;
//         case FIND_OPERATOR.OR:

//         case FIND_OPERATOR.ISNULL:
//         case FIND_OPERATOR.ARRAY_CONTAINS:
//         case FIND_OPERATOR.SIZE:
//         case FIND_OPERATOR.STARTSWITH:
//         case FIND_OPERATOR.ENDSWITH:
//         case FIND_OPERATOR.SUBSTRING:
//         case FIND_OPERATOR.MATCH:
//         case FIND_OPERATOR.ANY:
//         case FIND_OPERATOR.NE:
//         case FIND_OPERATOR.IN:
//         case FIND_OPERATOR.NIN:
//         case FIND_OPERATOR.LIKE:
//         case FIND_OPERATOR.ILIKE:
//         case FIND_OPERATOR.BETWEEN:
//         case FIND_OPERATOR.NOT_BETWEEN:
//         case FIND_OPERATOR.NOT_STARTSWITH:
//         case FIND_OPERATOR.NOT_ENDSWITH:
//         default:
//             throw new Error('Invalid operator');
//     }

//     return operators[operator] || operator;
//   }
// }
