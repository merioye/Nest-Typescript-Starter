/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// ############################### Common Types #################################

import { PartialDeep } from 'type-fest';

import { Op_Symbol } from '../constants';
import { AggregateFunction, FindOperator, UpdateOperator } from '../enums';
import {
  ConditionalExpression,
  DateExpression,
  Expression,
  MathExpression,
  StringExpression,
} from './expression.types';

// ############################### Helper Types #################################

/**
 * Helper type for numeric fields in an entity
 */
export type NumericFields<Entity> = {
  [K in keyof Entity as Entity[K] extends number ? K : never]: Entity[K];
};

/**
 * Helper type for groupable fields (string, number, boolean)
 */
export type GroupableFields<Entity> = {
  [K in keyof Entity as Entity[K] extends string | number | boolean
    ? K
    : never]: Entity[K];
};

/**
 * Helper type for orderable fields (string, number, Date)
 */
export type OrderableFields<Entity> = {
  [K in keyof Entity as Entity[K] extends string | number | Date
    ? K
    : never]: Entity[K];
};

/**
 * Options for finding entities with complex conditions
 * This type allows for nested conditions and various operators
 */
export type FindWhereOptions<Entity> = WhereValue<Entity>;

/**
 * Helper type to extract relation fields from an entity
 */
type RelationFields<Entity> = {
  [K in keyof Entity]: NonNullable<Entity[K]> extends object ? K : never;
}[keyof Entity];

/**
 * Helper type for extracting field names from a relation
 */
type RelationFieldNames<T> = T extends (infer U)[]
  ? keyof NonNullable<U>
  : keyof NonNullable<T>;

/**
 * Helper type for handling array relations in where conditions
 */
type ArrayRelationWhere<T> = T extends (infer U)[]
  ? FindWhereOptions<NonNullable<U>>
  : FindWhereOptions<NonNullable<T>>;

/**
 * Helper type for relation options
 */
export type RelationsOptions<Entity> = {
  [P in RelationFields<Entity>]?:
    | boolean
    | RelationFieldNames<Entity[P]>[]
    | (Entity[P] extends (infer U)[]
        ? RelationsOptions<U>
        : RelationsOptions<Entity[P]>);
};

/**
 * Order direction options
 */
export type OrderDirection = 'asc' | 'desc';

/**
 * Options for ordering query results
 */
export type OrderOptions<Entity> = {
  [P in keyof Entity]?: OrderDirection;
};

/**
 * Options for selecting specific fields from entities
 * Can be an array of field names or an object for nested selection
 */
export type SelectOptions<Entity> =
  | (keyof Entity)[]
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
   * Specifies the order of the query results
   */
  order?: OrderOptions<Entity>;
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
  update: PartialDeep<Entity> & { [Op_Symbol]?: UpdateOperators<Entity> };
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
  columnName: keyof {
    [K in keyof Entity as Entity[K] extends number | undefined
      ? K
      : never]: Entity[K];
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
  update: PartialDeep<Entity> & { [Op_Symbol]?: UpdateOperators<Entity> };
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
 * Type for field mapping in aggregate operations
 */
export type FieldMapping<T> = Array<keyof T | string>;

/**
 * Type for aggregate function configuration
 */
export interface AggregateFunctionConfig<
  T,
  ComputedFields extends string = string,
> {
  function: AggregateFunction;
  field: keyof T | ComputedFields;
  alias: string;
}

/**
 * Type for computed field configuration
 */
export interface ComputedFieldConfig {
  expression:
    | Expression<any>
    | MathExpression
    | StringExpression
    | DateExpression
    | ConditionalExpression;
  type: 'math' | 'string' | 'date' | 'conditional';
}

/**
 * Type for aggregate pipeline stage
 */
export interface AggregatePipelineStage<T> {
  $where?: FindWhereOptions<T>;
  $group?: {
    by: Array<keyof T | string> | null;
    functions: Array<AggregateFunctionConfig<T>>;
  };
  $project?: {
    fields: Array<keyof T | string>;
    computedFields?: {
      [key: string]: ComputedFieldConfig;
    };
  };
  $order?: {
    [key: string]: OrderDirection;
  };
  $skip?: number;
  $limit?: number;
}

/**
 * Options for aggregate pipeline
 */
export interface AggregatePipelineOptions<T> {
  pipeline: AggregatePipelineStage<T>[];
  select?: SelectOptions<T>;
  relations?: RelationsOptions<T>;
  withDeleted?: boolean;
}

/**
 * Result type for aggregate operations
 */
export type AggregateResult<T> = {
  [K in keyof T]?: any;
} & {
  [key: string]: any;
};

// ############################### Operator Types #################################

/**
 * Type for fields that support comparison operations (numbers, dates)
 */
type Comparable = number | Date;

/**
 * Helper type to extract keys of Entity that have comparable types, including optional fields
 */
type ComparableKeys<Entity> = {
  [P in keyof Entity]: NonNullable<Entity[P]> extends Comparable ? P : never;
}[keyof Entity];

/**
 * Helper type for string fields
 */
type StringKeys<Entity> = {
  [P in keyof Entity]: NonNullable<Entity[P]> extends string ? P : never;
}[keyof Entity];

/**
 * Helper type to extract array element type
 */
type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Helper type for array fields
 */
// type ArrayFields<Entity> = {
//   [P in keyof Entity as Entity[P] extends any[]
//     ? P
//     : never]: Entity[P] extends any[] ? ArrayElement<Entity[P]> : never;
// };

/**
 * Helper type for array keys
 */
type ArrayKeys<Entity> = {
  [P in keyof Entity]: Entity[P] extends any[] ? P : never;
}[keyof Entity];

/**
 * Helper type to create a partial record with only comparable fields
 */
// type ComparableFields<Entity> = Partial<{
//   [P in ComparableKeys<Entity>]: NonNullable<Entity[P]>;
// }>;

/**
 * Helper type to create a partial record with only string fields
 */
type StringFields<Entity> = Partial<{
  [P in StringKeys<Entity>]: NonNullable<Entity[P]>;
}>;

/**
 * Helper type for array field values
 */
// type ArrayFieldValue<Entity> = {
//   [P in keyof Entity as Entity[P] extends any[] ? P : never]: Array<
//     Partial<ArrayElement<Entity[P]>>
//   >;
// };

/**
 * Helper type for direct array values
 */
// type DirectArrayValue<Entity> = Entity extends any[]
//   ? Array<Partial<ArrayElement<Entity>>>
//   : never;

/**
 * Helper type for array contains values
 */
type IsPrimitiveArray<T> = T extends (string | number | boolean | Date)[]
  ? true
  : false;

type DeepPrimitiveArrayValue<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends any[]
        ? IsPrimitiveArray<T[P]> extends true
          ? ArrayElement<T[P]>
          : never
        : T[P] extends object
        ? DeepPrimitiveArrayValue<T[P]>
        : never;
    }
  : never;

type ArrayContainsValue<Entity> = {
  [P in keyof Entity as Entity[P] extends any[] ? P : never]:
    | (IsPrimitiveArray<Entity[P]> extends true
        ? ArrayElement<Entity[P]>
        : never)
    | DeepPrimitiveArrayValue<ArrayElement<Entity[P]>>;
};

/**
 * Helper type for any operator values
 */
// type AnyOperatorValue<Entity> = Partial<{
//   [P in keyof Entity as Entity[P] extends any[] ? P : never]: Array<
//     Partial<ArrayElement<Entity[P]>>
//   >;
// }>;

/**
 * Helper type for nested field values
 */
type NestedFieldValue<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends any[]
        ?
            | Partial<ArrayElement<T[P]>>
            | { [K in keyof ArrayElement<T[P]>]: ArrayElement<T[P]>[K] }
        : T[P] extends object
        ? NestedFieldValue<T[P]>
        : T[P] | null;
    }
  : T | null;

/**
 * Helper type for field values
 */
type FieldValue<Entity, P extends keyof Entity> = Entity[P] extends any[]
  ?
      | Partial<ArrayElement<Entity[P]>>
      | { [Op_Symbol]?: WhereOperators<ArrayElement<Entity[P]>> }
  : Entity[P] extends object
  ? NestedFieldValue<Entity[P]> | { [Op_Symbol]?: WhereOperators<Entity[P]> }
  : Entity[P] | null;

/**
 * Helper type for where values
 */
type WhereValue<Entity> =
  | Partial<{ [P in keyof Entity]: Entity[P] | null }>
  | { [Op_Symbol]?: WhereOperators<Entity> }
  | { [P in keyof Entity]?: WhereValue<Entity[P]> };

/**
 * Operators for complex where conditions in queries
 * @template Entity - The entity type these operators apply to
 */
export type WhereOperators<Entity> = {
  [FindOperator.LT]?:
    | Partial<{
        [P in keyof Entity]: FieldValue<Entity, P>;
      }>
    | Entity[keyof Entity];
  [FindOperator.GT]?:
    | Partial<{
        [P in keyof Entity]: FieldValue<Entity, P>;
      }>
    | Entity[keyof Entity];
  [FindOperator.LTE]?:
    | Partial<{
        [P in keyof Entity]: FieldValue<Entity, P>;
      }>
    | Entity[keyof Entity];
  [FindOperator.GTE]?:
    | Partial<{
        [P in keyof Entity]: FieldValue<Entity, P>;
      }>
    | Entity[keyof Entity];
  [FindOperator.NE]?:
    | Partial<{ [P in keyof Entity]: FieldValue<Entity, P> }>
    | Entity[keyof Entity];
  [FindOperator.IN]?:
    | Partial<{ [P in keyof Entity]: Entity[P][] }>
    | Entity[keyof Entity][];
  [FindOperator.NIN]?:
    | Partial<{ [P in keyof Entity]: Entity[P][] }>
    | Entity[keyof Entity][];
  [FindOperator.AND]?: (
    | Partial<{ [P in keyof Entity]: Entity[P] }>
    | { [Op_Symbol]: WhereOperators<Entity> }
    | {
        [P in RelationFields<Entity>]?: ArrayRelationWhere<Entity[P]>;
      }
  )[];
  [FindOperator.OR]?: (
    | Partial<{ [P in keyof Entity]: Entity[P] }>
    | { [Op_Symbol]: WhereOperators<Entity> }
    | {
        [P in RelationFields<Entity>]?: ArrayRelationWhere<Entity[P]>;
      }
  )[];
  [FindOperator.LIKE]?: StringFields<Entity> | string;
  [FindOperator.ILIKE]?: StringFields<Entity> | string;
  [FindOperator.BETWEEN]?:
    | Partial<{
        [P in ComparableKeys<Entity>]: [Entity[P], Entity[P]];
      }>
    | [Entity[keyof Entity], Entity[keyof Entity]];
  [FindOperator.NOT_BETWEEN]?:
    | Partial<{
        [P in ComparableKeys<Entity>]: [Entity[P], Entity[P]];
      }>
    | [Entity[keyof Entity], Entity[keyof Entity]];
  [FindOperator.ISNULL]?:
    | Partial<{
        [P in keyof Entity]: boolean;
      }>
    | boolean;
  [FindOperator.NOT_NULL]?:
    | Partial<{
        [P in keyof Entity]: boolean;
      }>
    | boolean;
  [FindOperator.ARRAY_CONTAINS]?:
    | ArrayContainsValue<Entity>
    | (IsPrimitiveArray<Entity[ArrayKeys<Entity>]> extends true
        ? ArrayElement<Entity[ArrayKeys<Entity>]>
        : DeepPrimitiveArrayValue<ArrayElement<Entity[ArrayKeys<Entity>]>>);
  [FindOperator.ANY]?: Partial<{
    [P in keyof Entity as Entity[P] extends any[] ? P : never]: Array<
      Partial<ArrayElement<Entity[P]>>
    >;
  }>;
  [FindOperator.SIZE]?:
    | Partial<{
        [P in ArrayKeys<Entity>]: number;
      }>
    | number;
  [FindOperator.STARTSWITH]?: StringFields<Entity> | string;
  [FindOperator.NOT_STARTSWITH]?: StringFields<Entity> | string;
  [FindOperator.ENDSWITH]?: StringFields<Entity> | string;
  [FindOperator.NOT_ENDSWITH]?: StringFields<Entity> | string;
  [FindOperator.SUBSTRING]?: StringFields<Entity> | string;
  [FindOperator.MATCH]?:
    | Partial<{
        [P in StringKeys<Entity>]: RegExp;
      }>
    | RegExp;
};

/**
 * Operators for update operations
 * @template Entity - The entity type these operators apply to
 */
export type UpdateOperators<Entity> = {
  [UpdateOperator.INC]?:
    | Partial<{
        [P in keyof Entity]: FieldValue<Entity, P>;
      }>
    | Entity[keyof Entity];
  [UpdateOperator.DEC]?:
    | Partial<{
        [P in keyof Entity]: FieldValue<Entity, P>;
      }>
    | Entity[keyof Entity];
  [UpdateOperator.MUL]?:
    | Partial<{
        [P in keyof Entity]: FieldValue<Entity, P>;
      }>
    | Entity[keyof Entity];
};

/**
 * Options for ordering aggregate results
 */
export type AggregateOrderOptions = {
  [key: string]: OrderDirection;
};

export * from './expression.types';
