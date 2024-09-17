/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// ############################### Common Types #################################

import { PartialDeep } from 'type-fest';
import { FIND_OPERATOR, UPDATE_OPERATOR } from '../enums';
import { ITransaction } from '../interfaces';

/**
 * Options for finding entities with complex conditions
 * This type allows for nested conditions and various operators
 */
export type FindWhereOptions<Entity> = {
  /**
   * Operators for complex queries (e.g., LT, GT, IN)
   */
  $op?: WhereOperators<Entity>;
} & {
  /**
   * Properties of the entity to query
   * Can be a direct value, a set of operators, or nested conditions
   */
  [K in keyof Entity]?:
    | Entity[K]
    | WhereOperators<Pick<Entity, K>>
    // | FindWhereOptions<Entity[K]>;
    // Only recurse if Entity[K] is an object, excluding primitives
    | (Entity[K] extends object ? FindWhereOptions<Entity[K]> : never);
};

/**
 * Options for specifying relations to be loaded
 * Can be a boolean to load all fields, an array of field names,
 * or an object for nested relations
 */
export type RelationsOptions<Entity> = {
  [P in keyof Entity]?:
    | true
    // | (keyof Entity[P])[]
    // | RelationsOptions<Entity[P]>;
    // Only allow an array of field names if Entity[P] is an object
    | (Entity[P] extends object ? (keyof Entity[P])[] : never)
    // Only allow nested relations if Entity[P] is an object
    | (Entity[P] extends object ? RelationsOptions<Entity[P]> : never);
};

/**
 * Options for selecting specific fields from entities
 * Can be an array of field names or an object for nested selection
 */
export type SelectOptions<Entity> =
  | (keyof Entity)[]
  // | {
  //     [P in keyof Entity]?: true | SelectOptions<Entity[P]>;
  //   };
  | {
      [P in keyof Entity]?:
        | true
        | (Entity[P] extends object ? SelectOptions<Entity[P]> : never);
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
   * The database transaction in which the current operation should be executed
   */
  transaction?: ITransaction;
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
  // order?: Partial<{
  //   [P in keyof Entity]?: 'asc' | 'desc';
  // }>;
  order?: {
    [P in keyof Entity]?: Entity[P] extends string | number | Date
      ? 'asc' | 'desc'
      : never;
  };
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
  update: PartialDeep<Entity> & { $op?: UpdateOperators<Entity> };
  /**
   * Conditions to determine which entities to update
   */
  where?: FindWhereOptions<Entity>;
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
  // columnName: keyof Pick<
  //   Entity,
  //   {
  //     [K in keyof Entity]: Entity[K] extends number ? K : never;
  //   }[keyof Entity]
  // >;
  columnName: keyof {
    [K in keyof Entity as Entity[K] extends number ? K : never]: Entity[K];
  };
  /**
   * Conditions to filter the entities before aggregation
   */
  where?: FindWhereOptions<Entity>;
};

/**
 * Options for increment/decrement operations on numeric columns
 */
export type IncDecOptions<Entity> = {
  value: number;
} & NumericColumnAggregateOptions<Entity>;

/**
 * Options for upserting (insert or update) entities
 */
export type UpsertOptions<Entity> = {
  /**
   * The data to use for updating if the entity exists
   */
  update: PartialDeep<Entity> & { $op?: UpdateOperators<Entity> };
  /**
   * The data to use for creating if the entity doesn't exist
   */
  create: PartialDeep<Entity>;
  /**
   * Conditions to determine whether to update or create
   */
  where?: FindWhereOptions<Entity>;
  /**
   * Additional options for the upsert operation
   */
  options?: CommonOptions<Entity>;
};

/**
 * Options for aggregate operations
 */
export type AggregateOptions<Entity> = {
  /**
   * Fields to group the results by
   * Can only group by primitive fields (string, number, boolean)
   */
  // groupBy?: (keyof Entity)[];
  groupBy?: (keyof {
    [K in keyof Entity as Entity[K] extends string | number | boolean
      ? K
      : never]: Entity[K];
  })[];
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
   * Keys are entity properties, values are 'asc' or 'desc'
   */
  // order?: Partial<{
  //   [P in keyof Entity]?: 'asc' | 'desc';
  // }>;
  order?: {
    [P in keyof Entity]?: Entity[P] extends string | number | Date
      ? 'asc' | 'desc'
      : never;
  };
  /**
   * Fields to sum (only numeric fields)
   */
  // sum?: Partial<{
  //   [P in keyof Entity]?: true;
  // }>;
  sum?: Partial<{
    [P in keyof Entity as Entity[P] extends number ? P : never]: true;
  }>;
  /**
   * Fields to average (only numeric fields)
   */
  // avg?: Partial<{
  //   [P in keyof Entity]?: true;
  // }>;
  avg?: Partial<{
    [P in keyof Entity as Entity[P] extends number ? P : never]: true;
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
   * The database transaction in which the current operation should be executed
   */
  transaction?: ITransaction;
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
  [FIND_OPERATOR.AND]?: Partial<WhereOperators<Entity>>[];
  [FIND_OPERATOR.OR]?: Partial<WhereOperators<Entity>>[];
  /** Like operator (case-sensitive string matching) */
  [FIND_OPERATOR.LIKE]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Case-insensitive like operator */
  [FIND_OPERATOR.ILIKE]?: Partial<{
    [P in keyof Entity]: Entity[P] extends string ? string : never;
  }>;
  /** Between operator for numeric fields (value must be between two given numeric values) */
  [FIND_OPERATOR.BETWEEN]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number
      ? [Entity[P], Entity[P]]
      : never;
  }>;
  /** Not between operator for numeric fields (value must not be between two given numeric values) */
  [FIND_OPERATOR.NOT_BETWEEN]?: Partial<{
    [P in keyof Entity]: Entity[P] extends number
      ? [Entity[P], Entity[P]]
      : never;
  }>;
  [FIND_OPERATOR.ISNULL]?: Partial<{
    [P in keyof Entity]: Entity[P] extends null ? null : never;
  }>;
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
