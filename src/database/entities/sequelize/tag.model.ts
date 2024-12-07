import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { PostTagEntity } from './post-tag.model';
import { PostEntity } from './post.model';
import { UserTagEntity } from './user-tag.model';
import { UserEntity } from './user.model';

@Table({
  tableName: 'tags',
})
export class TagEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Unique
  @Column(DataType.STRING)
  name: string;

  @BelongsToMany(() => PostEntity, () => PostTagEntity)
  posts: PostEntity[];

  @BelongsToMany(() => UserEntity, () => UserTagEntity)
  users: UserEntity[];

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
