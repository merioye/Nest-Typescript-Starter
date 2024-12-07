/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable quotes */
import {
  ExpressionComparisonOperator,
  ExpressionDateFunction,
  ExpressionMathOperator,
  ExpressionStringFunction,
  ExpressionType,
} from '../enums';
import { IExpressionBuilder } from '../interfaces';
import {
  ConditionalExpression,
  DateExpression,
  MathExpression,
  StringExpression,
} from '../types';

/**
 * Expression builder for Mongoose
 * Converts SQL-like expressions to MongoDB aggregation pipeline syntax
 *
 * @class MongooseExpressionBuilder
 * @implements {IExpressionBuilder}
 */
export class MongooseExpressionBuilder implements IExpressionBuilder {
  public buildMathExpression(expression: MathExpression): any {
    const { left, operator, right } = expression.value;
    const leftValue = this.getExpressionValue(left);
    const rightValue = this.getExpressionValue(right);

    switch (operator) {
      case ExpressionMathOperator.ADD:
        return { $add: [leftValue, rightValue] };
      case ExpressionMathOperator.SUB:
        return { $subtract: [leftValue, rightValue] };
      case ExpressionMathOperator.MUL:
        return { $multiply: [leftValue, rightValue] };
      case ExpressionMathOperator.DIV:
        return { $divide: [leftValue, rightValue] };
      case ExpressionMathOperator.MOD:
        return { $mod: [leftValue, rightValue] };
      default:
        throw new Error(
          `Unsupported math operator: ${JSON.stringify(operator)}`
        );
    }
  }

  public buildStringExpression(expression: StringExpression): any {
    const { function: func, arguments: args } = expression.value;
    const processedArgs = args.map((arg) => this.getExpressionValue(arg));

    switch (func) {
      case ExpressionStringFunction.CONCAT:
        return { $concat: processedArgs };
      case ExpressionStringFunction.UPPER:
        return { $toUpper: processedArgs[0] };
      case ExpressionStringFunction.LOWER:
        return { $toLower: processedArgs[0] };
      case ExpressionStringFunction.LENGTH:
        return { $strLenCP: processedArgs[0] };
      case ExpressionStringFunction.SUBSTRING:
        return {
          $substr: [
            processedArgs[0],
            processedArgs[1] || 0,
            processedArgs[2] || -1,
          ],
        };
      default:
        throw new Error(`Unsupported string function: ${JSON.stringify(func)}`);
    }
  }

  public buildDateExpression(expression: DateExpression): any {
    const { function: func, part, field, value, unit } = expression.value;

    switch (func) {
      case ExpressionDateFunction.EXTRACT:
        if (!part) throw new Error('Date part is required for EXTRACT');
        return { [`$${part.toLowerCase()}`]: `$${field.field}` };
      case ExpressionDateFunction.ADD:
        return {
          $dateAdd: {
            startDate: `$${field.field}`,
            unit: unit?.toLowerCase(),
            amount: value,
          },
        };
      case ExpressionDateFunction.SUB:
        return {
          $dateSubtract: {
            startDate: `$${field.field}`,
            unit: unit?.toLowerCase(),
            amount: value,
          },
        };
      case ExpressionDateFunction.DIFF:
        return {
          $dateDiff: {
            startDate: `$${field.field}`,
            endDate: '$$NOW',
            unit: unit?.toLowerCase(),
          },
        };
      case ExpressionDateFunction.FORMAT:
        return {
          $dateToString: {
            date: `$${field.field}`,
            format: value,
          },
        };
      default:
        throw new Error(`Unsupported date function: ${JSON.stringify(func)}`);
    }
  }

  public buildConditionalExpression(expression: ConditionalExpression): any {
    const { cases, else: elseValue } = expression.value;

    const branches = cases.map(({ when, then }) => ({
      case: this.buildCondition(when),
      then: this.getExpressionValue(then),
    }));

    return {
      $switch: {
        branches,
        default: this.getExpressionValue(elseValue),
      },
    };
  }

  private buildCondition(when: {
    left: any;
    operator: string;
    right: any;
  }): any {
    const { left, operator, right } = when;
    const leftValue = this.getExpressionValue(left);
    const rightValue = this.getExpressionValue(right);

    switch (operator) {
      case ExpressionComparisonOperator.EQ:
        return { $eq: [leftValue, rightValue] };
      case ExpressionComparisonOperator.NE:
        return { $ne: [leftValue, rightValue] };
      case ExpressionComparisonOperator.GT:
        return { $gt: [leftValue, rightValue] };
      case ExpressionComparisonOperator.GTE:
        return { $gte: [leftValue, rightValue] };
      case ExpressionComparisonOperator.LT:
        return { $lt: [leftValue, rightValue] };
      case ExpressionComparisonOperator.LTE:
        return { $lte: [leftValue, rightValue] };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private getExpressionValue(value: any): any {
    if (value === null) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value;
    if ('field' in value) return `$${value.field}`;
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
          throw new Error(
            `Unsupported expression type: ${JSON.stringify(value.type)}`
          );
      }
    }
    return value;
  }
}
