/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable quotes */
import { Sequelize } from 'sequelize';

import { ExpressionDateFunction, ExpressionType } from '../enums';
import { IExpressionBuilder } from '../interfaces';
import {
  ConditionalExpression,
  DateExpression,
  MathExpression,
  StringExpression,
} from '../types';

/**
 * Expression builder for Sequelize
 * Converts expressions to Sequelize's query syntax
 * @class SequelizeExpressionBuilder
 * @implements {IExpressionBuilder}
 */
export class SequelizeExpressionBuilder implements IExpressionBuilder {
  public constructor(private readonly sequelize: Sequelize) {}

  public buildMathExpression(expression: MathExpression): any {
    const { left, operator, right } = expression.value;
    const leftValue = this.getExpressionValue(left);
    const rightValue = this.getExpressionValue(right);
    return this.sequelize.literal(`(${leftValue} ${operator} ${rightValue})`);
  }

  public buildStringExpression(expression: StringExpression): any {
    const { function: func, arguments: args } = expression.value;
    const processedArgs = args.map((arg) => this.getExpressionValue(arg));
    return this.sequelize.fn(func, ...processedArgs);
  }

  public buildDateExpression(expression: DateExpression): any {
    const { function: func, part, field, value, unit } = expression.value;
    switch (func) {
      case ExpressionDateFunction.EXTRACT:
        return this.sequelize.fn(
          'EXTRACT',
          this.sequelize.literal(`${part} FROM ${field.field}`)
        );
      case ExpressionDateFunction.ADD:
      case ExpressionDateFunction.SUB:
        return this.sequelize.fn(
          `DATE_${func}`,
          field.field,
          this.sequelize.literal(`INTERVAL ${value} ${unit}`)
        );
      case ExpressionDateFunction.DIFF:
        return this.sequelize.fn(
          'DATEDIFF',
          this.sequelize.literal(`${unit}, ${field.field}, NOW()`)
        );
      case ExpressionDateFunction.FORMAT:
        return this.sequelize.fn('DATE_FORMAT', field.field, value);
      default:
        throw new Error(`Unsupported date function: ${JSON.stringify(func)}`);
    }
  }

  public buildConditionalExpression(expression: ConditionalExpression): any {
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
    return this.sequelize.literal(`CASE ${whenClauses}${elseClause} END`);
  }

  private getExpressionValue(value: any): any {
    if (value === null) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value;
    if ('field' in value) return value.field;
    if ('type' in value && 'value' in value) {
      switch (value.type) {
        case ExpressionType.MATH:
          return this.buildMathExpression(value);
        case ExpressionType.STRING:
          return this.buildStringExpression(value);
        case ExpressionType.DATE:
          return this.buildDateExpression(value);
        case ExpressionType.CONDITIONAL:
          return this.buildConditionalExpression(value);
        default:
          throw new Error(`Unsupported expression type: ${value.type}`);
      }
    }
    return value;
  }
}
