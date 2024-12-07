import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { BookPurchaserEntity } from './book-purchaser.model';
import { GenreEntity } from './genre.model';
import { UserEntity } from './user.model';

@Table({
  tableName: 'books',
})
export class BookEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING)
  title: string;

  @AllowNull
  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.DECIMAL(10, 2))
  price: number;

  @Column(DataType.DATE)
  publishDate: Date;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  authorId: number;

  @BelongsTo(() => UserEntity)
  author: UserEntity;

  @ForeignKey(() => GenreEntity)
  @Column(DataType.BIGINT)
  genreId: number;

  @BelongsTo(() => GenreEntity)
  genre: GenreEntity;

  @BelongsToMany(() => UserEntity, () => BookPurchaserEntity)
  purchasers: UserEntity[];

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
