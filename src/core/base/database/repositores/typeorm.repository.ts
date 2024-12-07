// /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { ForbiddenError, NotFoundError } from '@/common/errors';
// import { PartialDeep } from 'type-fest';
// import {
//   DataSource,
//   EntityManager,
//   FindOptionsOrder,
//   FindOptionsRelations,
//   FindOptionsSelect,
//   FindOptionsWhere,
//   ObjectLiteral,
//   Repository,
//   SelectQueryBuilder,
// } from 'typeorm';

// import { Op_Symbol, SoftDeleteDefaultColumnName } from '../constants';
// import {
//   AggregateFunction,
//   ExpressionType,
//   FindOperator,
//   UpdateOperator,
// } from '../enums';
// import { TypeORMExpressionBuilder } from '../expression-builders';
// import { IExpressionBuilder, IRepository, ITransaction } from '../interfaces';
// import { TypeORMTransaction } from '../transactions';
// import {
//   AggregatePipelineOptions,
//   AggregateResult,
//   ComputedFieldConfig,
//   ConditionalExpression,
//   DateExpression,
//   DeleteOptions,
//   FindManyOptions,
//   FindOneOptions,
//   FindWhereOptions,
//   MathExpression,
//   NumericColumnAggregateOptions,
//   OrderDirection,
//   RelationsOptions,
//   RestoreOptions,
//   SelectOptions,
//   StringExpression,
//   UpdateOperators,
//   UpdateOptions,
//   UpsertOptions,
//   WhereOperators,
// } from '../types';

// export class TypeORMRepository<Entity extends ObjectLiteral>
//   implements IRepository<Entity>
// {
//   private readonly _expressionBuilder: IExpressionBuilder;
//   private readonly _softDeleteColumnName: string;
//   private readonly _repository: Repository<Entity>;

//   public constructor(
//     private readonly dataSource: DataSource,
//     private readonly entityClass: new () => Entity,
//     softDeleteColumnName?: string
//   ) {
//     this._repository = this.dataSource.getRepository(entityClass);
//     this._expressionBuilder = new TypeORMExpressionBuilder();
//     this._softDeleteColumnName =
//       softDeleteColumnName || SoftDeleteDefaultColumnName;
//   }

//   private createQueryBuilder(alias?: string): SelectQueryBuilder<Entity> {
//     return this.dataSource.manager
//       .getRepository(this.entityClass)
//       .createQueryBuilder(alias || this.entityClass.name.toLowerCase());
//   }

//   private convertWhereOperatorsToTypeORM(
//     operators: WhereOperators<Entity>,
//     alias: string
//   ): { sql: string; parameters: Record<string, any> } {
//     const conditions: string[] = [];
//     const parameters: Record<string, any> = {};
//     let paramCounter = 0;

//     for (const [operator, value] of Object.entries(operators)) {
//       switch (operator) {
//         case FindOperator.EQ:
//           conditions.push(`${alias} = :param${paramCounter}`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.NE:
//           conditions.push(`${alias} != :param${paramCounter}`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.GT:
//           conditions.push(`${alias} > :param${paramCounter}`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.GTE:
//           conditions.push(`${alias} >= :param${paramCounter}`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.LT:
//           conditions.push(`${alias} < :param${paramCounter}`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.LTE:
//           conditions.push(`${alias} <= :param${paramCounter}`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.IN:
//           conditions.push(`${alias} IN (:...param${paramCounter})`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.NIN:
//           conditions.push(`${alias} NOT IN (:...param${paramCounter})`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.LIKE:
//           conditions.push(`${alias} LIKE :param${paramCounter}`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.ILIKE:
//           conditions.push(`LOWER(${alias}) LIKE LOWER(:param${paramCounter})`);
//           parameters[`param${paramCounter}`] = value;
//           break;
//         case FindOperator.BETWEEN:
//           conditions.push(
//             `${alias} BETWEEN :param${paramCounter}0 AND :param${paramCounter}1`
//           );
//           parameters[`param${paramCounter}0`] = (value as [any, any])[0];
//           parameters[`param${paramCounter}1`] = (value as [any, any])[1];
//           break;
//         case FindOperator.ISNULL:
//           conditions.push(value ? `${alias} IS NULL` : `${alias} IS NOT NULL`);
//           break;
//         case FindOperator.NOT_NULL:
//           conditions.push(value ? `${alias} IS NOT NULL` : `${alias} IS NULL`);
//           break;
//         case FindOperator.AND:
//           if (Array.isArray(value)) {
//             const subConditions = value.map((subValue) => {
//               const converted = this.convertWhereToTypeORM(
//                 subValue as FindWhereOptions<Entity>,
//                 alias
//               );
//               Object.assign(parameters, converted.parameters);
//               return `(${converted.sql})`;
//             });
//             conditions.push(`(${subConditions.join(' AND ')})`);
//           }
//           break;
//         case FindOperator.OR:
//           if (Array.isArray(value)) {
//             const subConditions = value.map((subValue) => {
//               const converted = this.convertWhereToTypeORM(
//                 subValue as FindWhereOptions<Entity>,
//                 alias
//               );
//               Object.assign(parameters, converted.parameters);
//               return `(${converted.sql})`;
//             });
//             conditions.push(`(${subConditions.join(' OR ')})`);
//           }
//           break;
//       }
//       paramCounter++;
//     }

//     return {
//       sql: conditions.join(' AND '),
//       parameters,
//     };
//   }

//   private convertWhereToTypeORM(
//     where: FindWhereOptions<Entity>,
//     alias: string
//   ): { sql: string; parameters: Record<string, any> } {
//     const conditions: string[] = [];
//     const parameters: Record<string, any> = {};

//     for (const [key, value] of Object.entries(where)) {
//       if (key === Op_Symbol) {
//         const opResult = this.convertWhereOperatorsToTypeORM(
//           value as WhereOperators<Entity>,
//           alias
//         );
//         if (opResult.sql) {
//           conditions.push(opResult.sql);
//           Object.assign(parameters, opResult.parameters);
//         }
//       } else if (value && typeof value === 'object' && !Array.isArray(value)) {
//         if ('op' in value) {
//           const opResult = this.convertWhereOperatorsToTypeORM(
//             { [value.op]: value.value } as unknown as WhereOperators<Entity>,
//             `${alias}.${key}`
//           );
//           if (opResult.sql) {
//             conditions.push(opResult.sql);
//             Object.assign(parameters, opResult.parameters);
//           }
//         } else {
//           const subResult = this.convertWhereToTypeORM(
//             value as FindWhereOptions<Entity>,
//             `${alias}.${key}`
//           );
//           if (subResult.sql) {
//             conditions.push(subResult.sql);
//             Object.assign(parameters, subResult.parameters);
//           }
//         }
//       } else {
//         conditions.push(`${alias}.${key} = :${key}`);
//         parameters[key] = value;
//       }
//     }

//     return {
//       sql: conditions.length ? conditions.join(' AND ') : '1=1',
//       parameters,
//     };
//   }

//   private applySelectOptions(
//     queryBuilder: SelectQueryBuilder<Entity>,
//     select: SelectOptions<Entity>,
//     alias: string
//   ): void {
//     if (Array.isArray(select)) {
//       queryBuilder.select(select.map((field) => `${alias}.${String(field)}`));
//     } else {
//       const selectFields = Object.entries(select)
//         .filter(([_, value]) => value)
//         .map(([field]) => `${alias}.${field}`);
//       queryBuilder.select(selectFields);
//     }
//   }

//   private applyRelationOptions(
//     queryBuilder: SelectQueryBuilder<Entity>,
//     relations: RelationsOptions<Entity>,
//     alias: string
//   ): void {
//     if (Array.isArray(relations)) {
//       relations.forEach((relation) => {
//         queryBuilder.leftJoinAndSelect(
//           `${alias}.${String(relation)}`,
//           String(relation)
//         );
//       });
//     } else {
//       Object.entries(relations).forEach(([relation, nested]) => {
//         if (nested === true) {
//           queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
//         } else if (typeof nested === 'object') {
//           // Handle nested relations recursively
//           queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
//           this.applyRelationOptions(queryBuilder, nested, relation);
//         }
//       });
//     }
//   }

//   private applyOrderOptions(
//     queryBuilder: SelectQueryBuilder<Entity>,
//     order: { [P in keyof Entity]?: OrderDirection },
//     alias: string
//   ): void {
//     Object.entries(order).forEach(([field, direction]) => {
//       queryBuilder.addOrderBy(
//         `${alias}.${field}`,
//         (direction as string) === 'ASC' ? 'ASC' : 'DESC'
//       );
//     });
//   }

//   public async findOne(
//     options?: FindOneOptions<Entity>
//   ): Promise<Entity | null> {
//     const alias = this.entityClass.name.toLowerCase();
//     const queryBuilder = this.createQueryBuilder(alias);

//     if (options?.where) {
//       const whereResult = this.convertWhereToTypeORM(options.where, alias);
//       queryBuilder.where(whereResult.sql, whereResult.parameters);
//     }

//     if (options?.select) {
//       this.applySelectOptions(queryBuilder, options.select, alias);
//     }

//     if (options?.relations) {
//       this.applyRelationOptions(queryBuilder, options.relations, alias);
//     }

//     if (options?.order) {
//       this.applyOrderOptions(queryBuilder, options.order, alias);
//     }

//     // Handle soft delete
//     if (!options?.withDeleted) {
//       queryBuilder.andWhere(`${alias}.${this._softDeleteColumnName} IS NULL`);
//     }

//     return await queryBuilder.getOne();
//   }
// }
