import { PartialDeep } from 'type-fest';
import { ITransaction } from '.';
import {
  AggregateOptions,
  DeleteOptions,
  FindManyOptions,
  FindOneOptions,
  FindWhereOptions,
  IncDecOptions,
  NumericColumnAggregateOptions,
  RestoreOptions,
  UpdateOptions,
  UpsertOptions,
} from '../types';

/**
 * Generic Repository Interface
 * @template Entity - The entity type this repository manages
 */
export interface IRepository<Entity> {
  /**
   * Find a single entity matching the given options
   * @param options - Options for finding the entity
   * @returns Promise resolving to the found entity or null if not found
   */
  findOne(options?: FindOneOptions<Entity>): Promise<Entity | null>;

  /**
   * Find multiple entities matching the given options
   * @param options - Options for finding the entities
   * @returns Promise resolving to an array of found entities
   */
  findMany(options?: FindManyOptions<Entity>): Promise<Entity[]>;

  /**
   * Find a single entity matching the given options, throwing an error if not found
   * @param options - Options for finding the entity
   * @returns Promise resolving to the found entity
   * @throws Error if entity is not found
   */
  findOneOrFail(options?: FindOneOptions<Entity>): Promise<Entity>;

  /**
   * Find entities by their IDs
   * @param ids - Array of entity IDs to find
   * @param options - Additional options for finding the entities
   * @returns Promise resolving to an array of found entities
   */
  findByIds<K extends keyof Entity>(
    ids: Entity[K][],
    options?: Omit<FindManyOptions<Entity>, 'where'>
  ): Promise<Entity[]>;

  /**
   * Find a single entity by its ID
   * @param id - ID of the entity to find
   * @param options - Additional options for finding the entity
   * @returns Promise resolving to the found entity or null if not found
   */
  findById<K extends keyof Entity>(
    id: Entity[K],
    options?: FindOneOptions<Entity>
  ): Promise<Entity | null>;

  /**
   * Find distinct values for a specific field
   * @param field - The field to find distinct values for
   * @param options - Additional options for the query
   * @returns Promise resolving to an array of distinct values
   */
  distinct<K extends keyof Entity>(
    field: K,
    options?: Omit<FindManyOptions<Entity>, 'select'>
  ): Promise<Entity[K][]>;

  /**
   * Insert a single entity
   * @param record - The entity to insert
   * @returns Promise resolving to the inserted entity
   */
  insertOne(record: PartialDeep<Entity>): Promise<Entity>;

  /**
   * Insert multiple entities
   * @param records - The entities to insert
   * @returns Promise resolving to an array of inserted entities
   */
  insertMany(records: PartialDeep<Entity>[]): Promise<Entity[]>;

  /**
   * Update a single entity
   * @param options - Options for updating the entity
   * @return Promise resolving to the updated entity or null if not found
   */
  updateOne(options: UpdateOptions<Entity>): Promise<Entity | null>;

  /**
   * Update multiple entities
   * @param options - Options for updating the entities
   * @returns Promise resolving to an array of updated entities
   */
  updateMany(options: UpdateOptions<Entity>): Promise<Entity[]>;

  /**
   * Upsert (insert or update) a single entity
   * @param options - Options for upserting the entity
   * @returns Promise resolving to the upserted entity
   */
  upsertOne(options: UpsertOptions<Entity>): Promise<Entity>;

  /**
   * Delete a single entity
   * @param options - Options for deleting the entity
   * @returns Promise resolving to the deleted entity or null if not found
   */
  deleteOne(options?: DeleteOptions<Entity>): Promise<Entity | null>;

  /**
   * Delete multiple entities
   * @param options - Options for deleting the entities
   * @returns Promise resolving to an array of deleted entities
   */
  deleteMany(options?: DeleteOptions<Entity>): Promise<Entity[]>;

  /**
   * Soft delete a single entity
   * @param options - Options for soft deleting the entity
   * @returns Promise resolving to the soft deleted entity or null if not found
   */
  softDeleteOne(options?: DeleteOptions<Entity>): Promise<Entity | null>;

  /**
   * Soft delete multiple entities
   * @param options - Options for soft deleting the entities
   * @returns Promise resolving to an array of soft deleted entities
   */
  softDeleteMany(options?: DeleteOptions<Entity>): Promise<Entity[]>;

  /**
   * Restore a single soft deleted entity
   * @param options - Options for restoring the entity
   * @returns Promise resolving to the restored entity
   */
  restoreOne(options: RestoreOptions<Entity>): Promise<Entity>;

  /**
   * Restore multiple soft deleted entities
   * @param options - Options for restoring the entities
   * @returns Promise resolving to an array of restored entities
   */
  restoreMany(options: RestoreOptions<Entity>): Promise<Entity[]>;

  /**
   * Check if entities exist based on the given conditions
   * @param where - Conditions to check for existence
   * @returns Promise resolving to a boolean indicating existence
   */
  exists(where: FindWhereOptions<Entity>): Promise<boolean>;

  /**
   * Count entities matching the given options
   * @param options - Options for counting the entities
   * @returns Promise resolving to the count of matching entities
   */
  count(options?: FindManyOptions<Entity>): Promise<number>;

  /**
   * Calculate the sum of a numeric column
   * @param options - Options for the sum calculation
   * @returns Promise resolving to the sum or null if no matching entities
   */
  sum(options: NumericColumnAggregateOptions<Entity>): Promise<number>;

  /**
   * Calculate the average of a numeric column
   * @param options - Options for the average calculation
   * @returns Promise resolving to the average or null if no matching entities
   */
  average(
    options: NumericColumnAggregateOptions<Entity>
  ): Promise<number | null>;

  /**
   * Find the minimum value of a numeric column
   * @param options - Options for finding the minimum value
   * @returns Promise resolving to the minimum value or null if no matching entities
   */
  minimum(
    options: NumericColumnAggregateOptions<Entity>
  ): Promise<number | null>;

  /**
   * Find the maximum value of a numeric column
   * @param options - Options for finding the maximum value
   * @returns Promise resolving to the maximum value or null if no matching entities
   */
  maximum(
    options: NumericColumnAggregateOptions<Entity>
  ): Promise<number | null>;

  /**
   * Increment a numeric column
   * @param options - Options for the increment operation
   * @returns Promise resolving to an array of updated entities
   */
  increment(options: IncDecOptions<Entity>): Promise<Entity[]>;

  /**
   * Decrement a numeric column
   * @param options - Options for the decrement operation
   * @returns Promise resolving to an array of updated entities
   */
  decrement(options: IncDecOptions<Entity>): Promise<Entity[]>;

  /**
   * @description Clears all the data from the table/collection (truncates/drops it).
   * @returns {Promise<void>}
   */
  clear(): Promise<void>;

  /**
   * Count distinct values for a specific field
   * @param field - The field to count distinct values for
   * @param options - Additional options for the query
   * @returns Promise resolving to the count of distinct values
   */
  countDistinct<K extends keyof Entity>(
    field: K,
    options?: FindManyOptions<Entity>
  ): Promise<number>;

  /**
   * Perform aggregation operations
   * @param options - Options for the aggregation
   * @returns Promise resolving to the aggregation results
   */
  aggregate(options: AggregateOptions<Entity>): Promise<Entity[]>;

  /**
   * Starts a new database transaction
   * @returns Promise resolving to the transaction
   */
  beginTransaction(): Promise<ITransaction>;
  /**
   * Commits a database transaction
   * @param transaction - The transaction to commit
   */

  commitTransaction(transaction: ITransaction): Promise<void>;
  /**
   * Rollbacks a database transaction
   * @param transaction - The transaction to rollback
   */

  rollbackTransaction(transaction: ITransaction): Promise<void>;
}
