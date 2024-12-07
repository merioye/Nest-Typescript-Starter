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
} from 'sequelize-typescript';

import { PostEntity } from './post.model';
import { UserEntity } from './user.model';

@Table({
  tableName: 'comments',
})
export class CommentEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.TEXT)
  content: string;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  authorId: number;

  @BelongsTo(() => UserEntity)
  author: UserEntity;

  @ForeignKey(() => PostEntity)
  @Column(DataType.BIGINT)
  postId: number;

  @BelongsTo(() => PostEntity)
  post: PostEntity;

  @ForeignKey(() => CommentEntity)
  @AllowNull
  @Column(DataType.BIGINT)
  parentId?: number;

  @BelongsTo(() => CommentEntity, 'parentId')
  parent?: CommentEntity;

  @HasMany(() => CommentEntity, 'parentId')
  replies: CommentEntity[];

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
