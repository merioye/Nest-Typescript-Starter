import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { CategoryEntity } from './category.model';
import { CommentEntity } from './comment.model';
import { LikeEntity } from './like.model';
import { PostTagEntity } from './post-tag.model';
import { TagEntity } from './tag.model';
import { UserEntity } from './user.model';

@Table({
  tableName: 'posts',
})
export class PostEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING)
  title: string;

  @Column(DataType.TEXT)
  content: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  published: boolean;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  authorId: number;

  @BelongsTo(() => UserEntity)
  author: UserEntity;

  @HasMany(() => CommentEntity)
  comments: CommentEntity[];

  @HasMany(() => LikeEntity)
  likes: LikeEntity[];

  @ForeignKey(() => CategoryEntity)
  @Column(DataType.BIGINT)
  categoryId: number;

  @BelongsTo(() => CategoryEntity)
  category: CategoryEntity;

  @BelongsToMany(() => TagEntity, () => PostTagEntity)
  tags: TagEntity[];

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
