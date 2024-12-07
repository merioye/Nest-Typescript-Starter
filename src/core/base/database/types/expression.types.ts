import {
  ExpressionComparisonOperator,
  ExpressionDateFunction,
  ExpressionDatePart,
  ExpressionDateUnit,
  ExpressionMathOperator,
  ExpressionStringFunction,
} from '../enums';

/**
 * Base type for all expressions
 */
export type Expression<T> = {
  type: string;
  value: T;
};

/**
 * Mathematical expression
 */
export type MathExpression = Expression<{
  left: FieldRef | number | MathExpression;
  operator: ExpressionMathOperator;
  right: FieldRef | number | MathExpression;
}>;

/**
 * String expression
 */
export type StringExpression = Expression<{
  function: ExpressionStringFunction;
  arguments: Array<FieldRef | string | StringExpression>;
}>;

/**
 * Date expression
 */
export type DateExpression = Expression<{
  function: ExpressionDateFunction;
  part?: ExpressionDatePart;
  field: FieldRef;
  value?: number;
  unit?: ExpressionDateUnit;
}>;

/**
 * Conditional expression
 */
export type ConditionalExpression = Expression<{
  cases: Array<{
    when: {
      left: FieldRef | number | string | MathExpression;
      operator: ExpressionComparisonOperator;
      right: FieldRef | number | string | MathExpression;
    };
    then: any;
  }>;
  else: any;
}>;

/**
 * Field reference (represents a column in the database)
 */
export type FieldRef = {
  field: string;
};

/**
 * Helper type to create field references
 */
export type FieldsOf<T> = {
  [K in keyof T]: T[K] extends object ? never : K;
}[keyof T];

/**
 * Expression builder functions
 */
export interface TypedExpressionBuilder<T> {
  /**
   * Create a field reference
   */
  field<K extends FieldsOf<T>>(name: K | string): FieldRef;

  /**
   * Create a math expression
   */
  math(
    left: FieldRef | number | MathExpression,
    operator: ExpressionMathOperator,
    right: FieldRef | number | MathExpression
  ): MathExpression;

  /**
   * Create a string expression
   */
  string(
    func: ExpressionStringFunction,
    ...args: Array<FieldRef | string | StringExpression>
  ): StringExpression;

  /**
   * Create a date expression
   */
  date(config: {
    function: ExpressionDateFunction;
    part?: ExpressionDatePart;
    field: FieldRef;
    value?: number;
    unit?: ExpressionDateUnit;
  }): DateExpression;

  /**
   * Create a conditional expression
   */
  case(): ConditionalExpressionBuilder<T>;
}

/**
 * Builder for conditional expressions
 */
export interface ConditionalExpressionBuilder<T> {
  when(
    left: FieldRef | number | string | MathExpression,
    operator: ExpressionComparisonOperator,
    right: FieldRef | number | string | MathExpression
  ): ConditionalExpressionBuilder<T>;
  then(value: any): ConditionalExpressionBuilder<T>;
  else(value: any): ConditionalExpression;
}
