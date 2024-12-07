import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { PostEntity } from './post.model';

@Table({
  tableName: 'categories',
})
export class CategoryEntity extends Model {
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

  @HasMany(() => PostEntity)
  posts: PostEntity[];

  @ForeignKey(() => CategoryEntity)
  @AllowNull
  @Column(DataType.BIGINT)
  parentCategoryId?: number;

  @BelongsTo(() => CategoryEntity, 'parentCategoryId')
  parentCategory?: CategoryEntity;

  @HasMany(() => CategoryEntity, 'parentCategoryId')
  subCategories: CategoryEntity[];

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
