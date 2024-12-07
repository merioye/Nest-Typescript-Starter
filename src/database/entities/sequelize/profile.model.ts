import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { AddressEntity } from './address.model';
import { UserEntity } from './user.model';

@Table({
  tableName: 'profiles',
})
export class ProfileEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @AllowNull
  @Column(DataType.TEXT)
  bio?: string;

  @AllowNull
  @Column(DataType.STRING)
  website?: string;

  @AllowNull
  @Column(DataType.STRING)
  avatarUrl?: string;

  @Column(DataType.JSON)
  socialLinks?: JSON;

  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  userId: number;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @AllowNull
  @HasOne(() => AddressEntity)
  address?: AddressEntity;

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
