import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { PostEntity } from './post.model';
import { UserEntity } from './user.model';

@Table({
  tableName: 'likes',
})
export class LikeEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  userId: number;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @ForeignKey(() => PostEntity)
  @Column(DataType.BIGINT)
  postId: number;

  @BelongsTo(() => PostEntity)
  post: PostEntity;

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
