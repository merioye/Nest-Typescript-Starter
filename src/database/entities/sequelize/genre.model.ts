import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { BookEntity } from './book.model';

@Table({
  tableName: 'genres',
})
export class GenreEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Unique
  @Column(DataType.STRING)
  name: string;

  @AllowNull
  @Column(DataType.TEXT)
  description?: string;

  @HasMany(() => BookEntity)
  books: BookEntity[];

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
