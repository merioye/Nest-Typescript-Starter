import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { BookEntity } from './book.model';
import { UserEntity } from './user.model';

@Table({ tableName: 'books_purchasers' })
export class BookPurchaserEntity extends Model {
  @ForeignKey(() => BookEntity)
  @Column(DataType.BIGINT)
  bookId: number;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  userId: number;
}
