// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import {
//   FindOptionsOrder,
//   FindOptionsRelations,
//   FindOptionsSelect,
//   FindOptionsWhere,
//   Repository,
//   FindOneOptions as TypeORMFindOneOptions,
//   Entity as TypeORMEntity,
// } from 'typeorm';
// import { FIND_OPERATOR } from './constants';
// import {
//   FindOneOptions,
//   FindWhereOptions,
//   IRepository,
//   RelationsOptions,
//   SelectOptions,
//   WhereOperators,
// } from './repository.interface';

// export class TypeORMRepository<Entity> implements IRepository<Entity> {
//   public constructor(private repository: Repository<Entity extends TypeORMEntity>) {}

//   async findOne(options?: FindOneOptions<Entity>): Promise<Entity | null> {
//     const typeormOptions: TypeORMFindOneOptions<Entity> = {};

//     if (options?.where) {
//       typeormOptions.where = this.convertWhereToTypeORM(options.where);
//     }

//     if (options?.select) {
//       typeormOptions.select = this.convertSelectToTypeORM(options.select);
//     }

//     if (options?.relations) {
//       typeormOptions.relations = this.convertRelationsToTypeORM(
//         options.relations
//       );
//     }

//     if (options?.order) {
//       typeormOptions.order = this.convertOrderToTypeORM(options.order);
//     }

//     const result = await this.repository.findOne(typeormOptions);
//     return result || null;
//   }

//   private convertWhereToTypeORM(
//     where: FindWhereOptions<Entity>
//   ): FindOptionsWhere<Entity> {
//     const typeormWhere: FindOptionsWhere<Entity> = {};

//     for (const [key, value] of Object.entries(where)) {
//       if (value && typeof value === 'object' && 'op' in value) {
//         typeormWhere[key as keyof Entity] = this.convertOperatorToTypeORM(
//           value.op as WhereOperators<Entity>
//         );
//       } else if (value && typeof value === 'object') {
//         typeormWhere[key] = this.convertWhereToTypeORM(
//           value as FindWhereOptions<Entity>
//         );
//       } else {
//         typeormWhere[key as keyof Entity] = value;
//       }
//     }

//     return typeormWhere;
//   }

//   private convertOperatorToTypeORM(operator: WhereOperators<Entity>): any {
//     const typeormOp: any = {};

//     for (const [op, value] of Object.entries(operator)) {
//       switch (op) {
//         case FIND_OPERATOR.LT:
//           typeormOp.lessThan = value;
//           break;
//         case FIND_OPERATOR.GT:
//           typeormOp.moreThan = value;
//           break;
//         case FIND_OPERATOR.LTE:
//           typeormOp.lessThanOrEqual = value;
//           break;
//         case FIND_OPERATOR.GTE:
//           typeormOp.moreThanOrEqual = value;
//           break;
//         case FIND_OPERATOR.NE:
//           typeormOp.not = value;
//           break;
//         case FIND_OPERATOR.IN:
//           typeormOp.in = value;
//           break;
//         case FIND_OPERATOR.NIN:
//           typeormOp.not = { in: value };
//           break;
//         case FIND_OPERATOR.LIKE:
//           typeormOp.like = value;
//           break;
//         case FIND_OPERATOR.ILIKE:
//           typeormOp.ilike = value;
//           break;
//         case FIND_OPERATOR.BETWEEN:
//           typeormOp.between = value;
//           break;
//         case FIND_OPERATOR.ISNULL:
//           typeormOp.isNull = true;
//           break;
//         // Add more operators as needed
//       }
//     }

//     return typeormOp;
//   }

//   private convertSelectToTypeORM(
//     select: SelectOptions<Entity>
//   ): FindOptionsSelect<Entity> {
//     if (Array.isArray(select)) {
//       return select.reduce((acc, field) => {
//         acc[field] = true;
//         return acc;
//       }, {} as FindOptionsSelect<Entity>);
//     }
//     return select as FindOptionsSelect<Entity>;
//   }

//   private convertRelationsToTypeORM(
//     relations: RelationsOptions<Entity>
//   ): FindOptionsRelations<Entity> {
//     return this.flattenRelations(relations);
//   }

//   private convertOrderToTypeORM(order: any): FindOptionsOrder<Entity> {
//     return order as FindOptionsOrder<Entity>;
//   }
// }
