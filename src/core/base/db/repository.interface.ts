import { PartialDeep } from 'type-fest';
import { FIND_OPERATOR, UPDATE_OPERATOR } from './constants';

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
  updateOne(options?: UpdateOptions<Entity>): Promise<Entity | null>;

  /**
   * Update multiple entities
   * @param options - Options for updating the entities
   * @returns Promise resolving to an array of updated entities
   */
  updateMany(options?: UpdateOptions<Entity>): Promise<Entity[]>;

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
   * @returns Promise resolving to an array of restored entities
   */
  restoreMany(): Promise<Entity[]>;

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
  sum(options: NumericColumnAggregateOptions<Entity>): Promise<number | null>;

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
  increment(
    options: NumericColumnAggregateOptions<Entity> & { value: number }
  ): Promise<Entity[]>;

  /**
   * Decrement a numeric column
   * @param options - Options for the decrement operation
   * @returns Promise resolving to an array of updated entities
   */
  decrement(
    options: NumericColumnAggregateOptions<Entity> & { value: number }
  ): Promise<Entity[]>;

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
   * Execute a callback within a transaction
   * @param callback - Function to execute within the transaction
   * @returns Promise resolving with the result of the callback
   * @throws Will throw an error if the transaction fails, causing a rollback
   */
  transaction<T>(
    callback: (transactionalRepository: IRepository<Entity>) => Promise<T>
  ): Promise<T>;
}

// ############################### Common Types #################################

/**
 * Options for finding entities with complex conditions
 * This type allows for nested conditions and various operators
 */
export type FindWhereOptions<Entity> = {
  /**
   * Operators for complex queries (e.g., LT, GT, IN)
   */
  op?: WhereOperators<Entity>;
} & {
  /**
   * Properties of the entity to query
   * Can be a direct value, a set of operators, or nested conditions
   */
  [K in keyof Entity]?:
    | Entity[K]
    | WhereOperators<Pick<Entity, K>>
    | FindWhereOptions<Entity[K]>;
};

/**
 * Options for specifying relations to be loaded
 * Can be a boolean to load all fields, an array of field names,
 * or an object for nested relations
 */
export type RelationsOptions<Entity> = {
  [P in keyof Entity]?:
    | true
    | (keyof Entity[P])[]
    | RelationsOptions<Entity[P]>;
};

/**
 * Options for selecting specific fields from entities
 * Can be an array of field names or an object for nested selection
 */
export type SelectOptions<Entity> =
  | (keyof Entity)[]
  | {
      [P in keyof Entity]?: true | SelectOptions<Entity[P]>;
    };

/**
 * Common options used across various query methods
 */
export type CommonOptions<Entity> = {
  /**
   * Specifies which fields to return in the query results
   * Can be an array of field names or an object for nested selection
   */
  select?: SelectOptions<Entity>;
  /**
   * Specifies which related entities to include in the query results
   * Can be a boolean, an array of field names, or an object for nested relations
   */
  relations?: RelationsOptions<Entity>;
  /**
   * Indicates whether the operation should be executed within a transaction
   */
  transaction?: boolean;
};

// ############################### Other Types #################################

/**
 * Options for finding a single entity
 */
export type FindOneOptions<Entity> = {
  /**
   * Conditions to filter the entity
   */
  where?: FindWhereOptions<Entity>;
  /**
   * Specifies the order of the results
   * Keys are entity properties, values are 'asc' or 'desc'
   */
  order?: Partial<{
    [P in keyof Entity]?: 'asc' | 'desc';
  }>;
  /**
   * If true, includes soft-deleted entities in the search
   */
  withDeleted?: boolean;
} & CommonOptions<Entity>;

/**
 * Options for finding multiple entities
 * Extends FindOneOptions with pagination support
 */
export type FindManyOptions<Entity> = {
  /**
   * Number of entities to skip before starting to return results
   */
  skip?: number;
  /**
   * Maximum number of entities to return
   */
  limit?: number;
} & FindOneOptions<Entity>;

/**
 * Options for updating entities
 */
export type UpdateOptions<Entity> = {
  /**
   * The data to update
   * Can include update operators for complex updates
   */
  update: PartialDeep<Entity> & { op?: UpdateOperators<Entity> };
  /**
   * Conditions to determine which entities to update
   */
  where: FindWhereOptions<Entity>;
  /**
   * Additional options for the update operation
   */
  options?: CommonOptions<Entity>;
};

/**
 * Options for deleting entities
 */
export type DeleteOptions<Entity> = {
  /**
   * Conditions to determine which entities to delete
   */
  where?: FindWhereOptions<Entity>;
  /**
   * Additional options for the delete operation
   */
  options?: CommonOptions<Entity>;
};

/**
 * Options for restoring soft-deleted entities
 */
export type RestoreOptions<Entity> = {
  /**
   * Conditions to determine which entities to restore
   */
  where?: FindWhereOptions<Entity>;
  /**
   * Conditions to determine which entities to restore
   */
  options?: CommonOptions<Entity>;
};

/**
 * Options for aggregate operations on numeric columns
 */
export type NumericColumnAggregateOptions<Entity> = {
  /**
   * The name of the numeric column to perform the aggregation on
   */
  columnName: keyof {
    [K in keyof Entity as Entity[K] extends number ? K : never]: Entity[K];
  };
  /**
   * Conditions to filter the entities before aggregation
   */
  where?: FindWhereOptions<Entity>;
};

/**
 * Options for upserting (insert or update) entities
 */
export type UpsertOptions<Entity> = {
  /**
   * The data to use for updating if the entity exists
   */
  update: PartialDeep<Entity>;
  /**
   * The data to use for creating if the entity doesn't exist
   */
  create: PartialDeep<Entity>;
  /**
   * Conditions to determine whether to update or create
   */
  where: FindWhereOptions<Entity>;
};

/**
 * Options for aggregate operations
 */
export type AggregateOptions<Entity> = {
  /**
   * Fields to group the results by
   */
  groupBy?: (keyof Entity)[];
  /**
   * Conditions to filter the groups after aggregation
   */
  having?: FindWhereOptions<Entity>;
  /**
   * Conditions to filter the entities before aggregation
   */
  where?: FindWhereOptions<Entity>;
  /**
   * Specifies the order of the results
   */
  order?: Partial<{
    [P in keyof Entity]?: 'asc' | 'desc';
  }>;
  /**
   * Fields to sum
   */
  sum?: Partial<{
    [P in keyof Entity]?: true;
  }>;
  /**
   * Fields to average
   */
  avg?: Partial<{
    [P in keyof Entity]?: true;
  }>;
  /**
   * Fields to count
   */
  count?: Partial<{
    [P in keyof Entity]?: true;
  }>;
  /**
   * Numeric fields to find the minimum value of
   */
  min?: Partial<{
    [P in keyof Entity as Entity[P] extends number ? P : never]: true;
  }>;
  /**
   * Numeric fields to find the maximum value of
   */
  max?: Partial<{
    [P in keyof Entity as Entity[P] extends number ? P : never]: true;
  }>;
  /**
   * Maximum number of results to return
   */
  limit?: number;
  /**
   * Number of results to skip before returning
   */
  skip?: number;
  /**
   * Fields to select in the result
   */
  select?: SelectOptions<Entity>;
  /**
   * Relations to include in the result
   */
  relations?: RelationsOptions<Entity>;
  /**
   * Whether to include soft-deleted entities
   */
  withDeleted?: boolean;
  /**
   * Whether to run the aggregation in a transaction
   */
  transaction?: boolean;
};

// ############################### Operator Types #################################

/**
 * Operators for complex where conditions in queries
 * @template Entity - The entity type these operators apply to
 */
export interface WhereOperators<Entity> {
  [FIND_OPERATOR.LT]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number ? number : never;
  }>;
  [FIND_OPERATOR.GT]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number ? number : never;
  }>;
  [FIND_OPERATOR.LTE]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number ? number : never;
  }>;
  [FIND_OPERATOR.GTE]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number ? number : never;
  }>;
  [FIND_OPERATOR.NE]?: Partial<{ [P in keyof Entity]: Entity[P] }>;
  /** In operator (value must be in the given array) */
  [FIND_OPERATOR.IN]?: Partial<{ [P in keyof Entity]: Entity[P][] }>;
  /** Not in operator (value must not be in the given array) */
  [FIND_OPERATOR.NIN]?: Partial<{ [P in keyof Entity]: Entity[P][] }>;
  [FIND_OPERATOR.AND]?: Partial<Entity>[];
  [FIND_OPERATOR.OR]?: Partial<Entity>[];
  /** Like operator (case-sensitive string matching) */
  [FIND_OPERATOR.LIKE]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Case-insensitive like operator */
  [FIND_OPERATOR.ILIKE]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Between operator (value must be between two given values) */
  [FIND_OPERATOR.BETWEEN]?: Partial<{
    [P in keyof Entity]: [Entity[P], Entity[P]];
  }>;
  /** Not between operator (value must not be between two given values) */
  [FIND_OPERATOR.NOT_BETWEEN]?: Partial<{
    [P in keyof Entity]: [Entity[P], Entity[P]];
  }>;
  [FIND_OPERATOR.ISNULL]?: Partial<{ [P in keyof Entity]: null }>;
  /** Any operator (at least one element in array must match) */
  [FIND_OPERATOR.ANY]?: Partial<{ [P in keyof Entity]: Entity[P][] }>;
  /** Array contains operator (array must contain the given element) */
  [FIND_OPERATOR.ARRAY_CONTAINS]?: Partial<{
    [P in keyof Entity]: Entity[P] extends any[] ? Entity[P][number] : never;
  }>;
  /** Size operator (for array fields) */
  [FIND_OPERATOR.SIZE]: Partial<{
    [P in keyof Entity]: Entity[P] extends any[] ? number : never;
  }>;
  /** Starts with operator (for string fields) */
  [FIND_OPERATOR.STARTSWITH]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Not starts with operator (for string fields) */
  [FIND_OPERATOR.NOT_STARTSWITH]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Ends with operator (for string fields) */
  [FIND_OPERATOR.ENDSWITH]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Not ends with operator (for string fields) */
  [FIND_OPERATOR.NOT_ENDSWITH]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Substring operator (for string fields) */
  [FIND_OPERATOR.SUBSTRING]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Match operator (for string fields, using regex) */
  [FIND_OPERATOR.MATCH]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? RegExp | string : never;
  }>;
}

/**
 * Operators for update operations
 * @template Entity - The entity type these operators apply to
 */
export type UpdateOperators<Entity> = {
  [UPDATE_OPERATOR.INC]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number ? number : never;
  }>;
  [UPDATE_OPERATOR.DEC]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number ? number : never;
  }>;
  [UPDATE_OPERATOR.MUL]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number ? number : never;
  }>;
};
