export enum FindOperator {
  LT = 'LT',
  GT = 'GT',
  LTE = 'LTE',
  GTE = 'GTE',
  NE = 'NE',
  IN = 'IN',
  NIN = 'NIN',
  AND = 'AND',
  OR = 'OR',
  LIKE = 'LIKE',
  ILIKE = 'ILIKE',
  BETWEEN = 'BETWEEN',
  NOT_BETWEEN = 'NOT_BETWEEN',
  ISNULL = 'ISNULL',
  NOT_NULL = 'NOT_NULL',
  ANY = 'ANY',
  ARRAY_CONTAINS = 'ARRAY_CONTAINS',
  SIZE = 'SIZE',
  STARTSWITH = 'STARTSWITH',
  NOT_STARTSWITH = 'NOT_STARTSWITH',
  ENDSWITH = 'ENDSWITH',
  NOT_ENDSWITH = 'NOT_ENDSWITH',
  SUBSTRING = 'SUBSTRING',
  MATCH = 'MATCH',
}

export enum UpdateOperator {
  INC = 'INC',
  DEC = 'DEC',
  MUL = 'MUL',
}

/**
 * Supported aggregate functions
 */
export enum AggregateFunction {
  SUM = 'sum',
  AVG = 'avg',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  FIRST = 'first',
  LAST = 'last',
  ARRAY = 'array',
}
/**
 * Supported expression types
 */
export enum ExpressionType {
  MATH = 'math',
  STRING = 'string',
  DATE = 'date',
  CONDITIONAL = 'conditional',
}

export enum ExpressionDateFunction {
  EXTRACT = 'EXTRACT',
  ADD = 'ADD',
  SUB = 'SUB',
  DIFF = 'DIFF',
  FORMAT = 'FORMAT',
}

export enum ExpressionDatePart {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  DAY = 'DAY',
  HOUR = 'HOUR',
  MINUTE = 'MINUTE',
  SECOND = 'SECOND',
}

export enum ExpressionDateUnit {
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum ExpressionStringFunction {
  CONCAT = 'CONCAT',
  LOWER = 'LOWER',
  UPPER = 'UPPER',
  LENGTH = 'LENGTH',
  SUBSTRING = 'SUBSTRING',
}

export enum ExpressionMathOperator {
  ADD = '+',
  SUB = '-',
  MUL = '*',
  DIV = '/',
  MOD = '%',
}

export enum ExpressionComparisonOperator {
  EQ = '=',
  NE = '!=',
  GT = '>',
  LT = '<',
  GTE = '>=',
  LTE = '<=',
}
