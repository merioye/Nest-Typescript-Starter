import {
  ConditionalExpression,
  DateExpression,
  MathExpression,
  StringExpression,
} from '../types';

/**
 * Interface for building database-specific expressions
 * Each ORM implementation will provide its own expression builder
 *
 * @interface IExpressionBuilder
 */
export interface IExpressionBuilder {
  /**
   * Build a mathematical expression
   * @param expression SQL-like expression (e.g., "age + 1")
   */
  buildMathExpression(expression: MathExpression): any;

  /**
   * Build a string manipulation expression
   * @param expression SQL-like expression (e.g., "CONCAT(firstName, ' ', lastName)")
   */
  buildStringExpression(expression: StringExpression): any;

  /**
   * Build a date manipulation expression
   * @param expression SQL-like expression (e.g., "EXTRACT(YEAR FROM createdAt)")
   */
  buildDateExpression(expression: DateExpression): any;

  /**
   * Build a conditional expression
   * @param expression SQL-like expression (e.g., "CASE WHEN age >= 30 THEN 'Senior' ELSE 'Junior' END")
   */
  buildConditionalExpression(expression: ConditionalExpression): any;
}
