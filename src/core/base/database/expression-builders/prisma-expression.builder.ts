/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma } from '@prisma/client';

import { ExpressionDateFunction, ExpressionType } from '../enums';
import { IExpressionBuilder } from '../interfaces';
import {
  ConditionalExpression,
  DateExpression,
  MathExpression,
  StringExpression,
} from '../types';

/**
 * Expression builder for Prisma ORM
 * Uses raw SQL expressions as Prisma supports native SQL
 *
 * @class PrismaExpressionBuilder
 * @implements {IExpressionBuilder}
 */
export class PrismaExpressionBuilder implements IExpressionBuilder {
  public buildMathExpression(expression: MathExpression): any {
    const { left, operator, right } = expression.value;
    const leftValue = this.getExpressionValue(left);
    const rightValue = this.getExpressionValue(right);
    return Prisma.sql`(${Prisma.raw(
      `${leftValue} ${operator} ${rightValue}`
    )})`;
  }

  public buildStringExpression(expression: StringExpression): any {
    const { function: func, arguments: args } = expression.value;
    const processedArgs = args
      .map((arg) => this.getExpressionValue(arg))
      .join(', ');
    return Prisma.sql`(${Prisma.raw(`${func}(${processedArgs})`)})`;
  }

  public buildDateExpression(expression: DateExpression): any {
    const { function: func, part, field, value, unit } = expression.value;
    switch (func) {
      case ExpressionDateFunction.EXTRACT:
        return Prisma.sql`(EXTRACT(${Prisma.raw(part || '')} FROM ${Prisma.raw(
          field.field
        )}))`;
      case ExpressionDateFunction.ADD:
      case ExpressionDateFunction.SUB:
        return Prisma.sql`(DATE_${func}(${Prisma.raw(
          field.field
        )}, INTERVAL ${value} ${unit}))`;
      case ExpressionDateFunction.DIFF:
        return Prisma.sql`(DATEDIFF(${Prisma.raw(unit || '')}, ${Prisma.raw(
          field.field
        )}, NOW()))`;
      case ExpressionDateFunction.FORMAT:
        return Prisma.sql`(DATE_FORMAT(${Prisma.raw(field.field)}, ${value}))`;
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
    return Prisma.sql`(CASE ${Prisma.raw(whenClauses)}${Prisma.raw(
      elseClause
    )} END)`;
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
