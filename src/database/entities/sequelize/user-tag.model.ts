import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { TagEntity } from './tag.model';
import { UserEntity } from './user.model';

@Table({ tableName: 'users_tags' })
export class UserTagEntity extends Model {
  @ForeignKey(() => UserEntity)
  @Column(DataType.BIGINT)
  userId: number;

  @ForeignKey(() => TagEntity)
  @Column(DataType.BIGINT)
  tagId: number;
}
