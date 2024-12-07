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

import { UserEntity } from './user.model';

@Table({
  tableName: 'follows',
})
export class FollowEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  followerId: number;

  @BelongsTo(() => UserEntity, 'followerId')
  follower: UserEntity;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  followingId: number;

  @BelongsTo(() => UserEntity, 'followingId')
  following: UserEntity;

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
