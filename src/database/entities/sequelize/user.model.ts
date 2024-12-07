import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { Role } from '@/types';

import { BookPurchaserEntity } from './book-purchaser.model';
import { BookEntity } from './book.model';
import { CommentEntity } from './comment.model';
import { FollowEntity } from './follow.model';
import { LikeEntity } from './like.model';
import { PostEntity } from './post.model';
import { ProfileEntity } from './profile.model';
import { TagEntity } from './tag.model';
import { UserTagEntity } from './user-tag.model';

@Table({
  tableName: 'users',
})
export class UserEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Unique
  @Column(DataType.STRING)
  email: string;

  @Unique
  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  password: string;

  @AllowNull
  @Column(DataType.STRING)
  firstName?: string;

  @AllowNull
  @Column(DataType.STRING)
  lastName?: string;

  @AllowNull
  @Column(DataType.INTEGER)
  age?: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @Default(Role.USER)
  @Column(DataType.ENUM(...Object.values(Role)))
  role: Role;

  @AllowNull
  @Column(DataType.DATE)
  lastLoginAt?: Date;

  @AllowNull
  @HasOne(() => ProfileEntity)
  profile?: ProfileEntity;

  @HasMany(() => PostEntity)
  posts: PostEntity[];

  @HasMany(() => CommentEntity)
  comments: CommentEntity[];

  @HasMany(() => LikeEntity)
  likes: LikeEntity[];

  @HasMany(() => FollowEntity, 'followerId')
  followers: FollowEntity[];

  @HasMany(() => FollowEntity, 'followingId')
  following: FollowEntity[];

  @HasMany(() => BookEntity, 'authorId')
  authoredBooks: BookEntity[];

  @BelongsToMany(() => BookEntity, () => BookPurchaserEntity)
  purchasedBooks: BookEntity[];

  @BelongsToMany(() => TagEntity, () => UserTagEntity)
  tags: TagEntity[];

  @Column(DataType.ARRAY(DataType.STRING))
  interests: string[];

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
