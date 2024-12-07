/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExpressionDateFunction,
  ExpressionDatePart,
  ExpressionDateUnit,
  ExpressionMathOperator,
  ExpressionStringFunction,
  ExpressionType,
} from '../enums';
import {
  ConditionalExpression,
  ConditionalExpressionBuilder,
  DateExpression,
  FieldRef,
  FieldsOf,
  MathExpression,
  StringExpression,
  TypedExpressionBuilder,
} from '../types';

/**
 * Base expression builder that creates strongly-typed expressions
 *
 * @class BaseExpressionBuilder
 * @template T - The entity type these expressions apply to
 * @implements {TypedExpressionBuilder<T>}
 */
export class BaseExpressionBuilder<T> implements TypedExpressionBuilder<T> {
  public field<K extends FieldsOf<T>>(name: K | string): FieldRef {
    return { field: name as string };
  }

  public math(
    left: FieldRef | number | MathExpression,
    operator: ExpressionMathOperator,
    right: FieldRef | number | MathExpression
  ): MathExpression {
    return {
      type: ExpressionType.MATH,
      value: { left, operator, right },
    };
  }

  public string(
    func: ExpressionStringFunction,
    ...args: Array<FieldRef | string | StringExpression>
  ): StringExpression {
    return {
      type: ExpressionType.STRING,
      value: {
        function: func,
        arguments: args,
      },
    };
  }

  public date(config: {
    function: ExpressionDateFunction;
    part?: ExpressionDatePart;
    field: FieldRef;
    value?: number;
    unit?: ExpressionDateUnit;
  }): DateExpression {
    return {
      type: ExpressionType.DATE,
      value: config,
    };
  }

  public case(): ConditionalExpressionBuilder<T> {
    const cases: ConditionalExpression['value']['cases'] = [];
    let currentCase: (typeof cases)[0] | null = null;
    let elseValue: any = null;

    const builder: ConditionalExpressionBuilder<T> = {
      when: (left, operator, right) => {
        currentCase = {
          when: { left, operator, right },
          then: null,
        };
        cases.push(currentCase);
        return builder;
      },
      then: (value) => {
        if (currentCase) {
          currentCase.then = value;
        }
        return builder;
      },
      else: (value) => {
        elseValue = value;
        return {
          type: ExpressionType.CONDITIONAL,
          value: {
            cases,
            else: elseValue,
          },
        };
      },
    };

    return builder;
  }
}

/**
 * Helper function to create a strongly-typed expression builder
 */
export function createExpressionBuilder<T>(): TypedExpressionBuilder<T> {
  return new BaseExpressionBuilder<T>();
}
