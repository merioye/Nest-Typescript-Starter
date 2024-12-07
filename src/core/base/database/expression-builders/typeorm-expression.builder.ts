/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ExpressionDateFunction, ExpressionType } from '../enums';
import { IExpressionBuilder } from '../interfaces';
import {
  ConditionalExpression,
  DateExpression,
  MathExpression,
  StringExpression,
} from '../types';

/**
 * Expression builder for TypeORM
 * Converts expressions to TypeORM's QueryBuilder syntax
 * @class TypeORMExpressionBuilder
 * @implements {IExpressionBuilder}
 */
export class TypeORMExpressionBuilder implements IExpressionBuilder {
  public buildMathExpression(expression: MathExpression): string {
    const { left, operator, right } = expression.value;
    const leftValue = this.getExpressionValue(left);
    const rightValue = this.getExpressionValue(right);
    return `(${leftValue} ${operator} ${rightValue})`;
  }

  public buildStringExpression(expression: StringExpression): string {
    const { function: func, arguments: args } = expression.value;
    const processedArgs = args
      .map((arg) => this.getExpressionValue(arg))
      .join(', ');
    return `${func}(${processedArgs})`;
  }

  public buildDateExpression(expression: DateExpression): string {
    const { function: func, part, field, value, unit } = expression.value;
    switch (func) {
      case ExpressionDateFunction.EXTRACT:
        return `EXTRACT(${part} FROM ${field.field})`;
      case ExpressionDateFunction.ADD:
      case ExpressionDateFunction.SUB:
        return `DATE_${func}(${field.field}, INTERVAL ${value} ${unit})`;
      case ExpressionDateFunction.DIFF:
        return `DATEDIFF(${unit}, ${field.field}, NOW())`;
      case ExpressionDateFunction.FORMAT:
        return `DATE_FORMAT(${field.field}, ${value})`;
      default:
        throw new Error(`Unsupported date function: ${JSON.stringify(func)}`);
    }
  }

  public buildConditionalExpression(expression: ConditionalExpression): string {
    const { cases, else: elseValue } = expression.value;
    const whenClauses = cases
      .map(({ when, then }) => {
        const { left, operator, right } = when;
        const leftValue = this.getExpressionValue(left);
        const rightValue = this.getExpressionValue(right);
        return `WHEN ${leftValue} ${operator} ${rightValue} THEN ${this.getExpressionValue(
          then
        )}`;
      })
      .join(' ');
    const elseClause = elseValue
      ? ` ELSE ${this.getExpressionValue(elseValue)}`
      : '';
    return `CASE ${whenClauses}${elseClause} END`;
  }

  private getExpressionValue(value: any): string {
    if (value === null) return 'NULL';
    if (typeof value === 'string') return `'${value}'`;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? '1' : '0';
    if ('field' in value) return value.field;
    if ('type' in value && 'value' in value) {
      switch (value.type) {
        case ExpressionType.MATH:
          return this.buildMathExpression(value as MathExpression);
        case ExpressionType.STRING:
          return this.buildStringExpression(value as StringExpression);
        case ExpressionType.DATE:
          return this.buildDateExpression(value as DateExpression);
        case ExpressionType.CONDITIONAL:
          return this.buildConditionalExpression(
            value as ConditionalExpression
          );
        default:
          throw new Error(`Unsupported expression type: ${value.type}`);
      }
    }
    return String(value);
  }
}
