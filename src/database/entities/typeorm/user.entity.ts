import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '@/types';

import { BookEntity } from './book.entity';
import { CommentEntity } from './comment.entity';
import { FollowEntity } from './follow.entity';
import { LikeEntity } from './like.entity';
import { PostEntity } from './post.entity';
import { ProfileEntity } from './profile.entity';
import { TagEntity } from './tag.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ default: true })
  isActive: boolean = true;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role = Role.USER;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  profile?: ProfileEntity;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  followers: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  following: FollowEntity[];

  @OneToMany(() => BookEntity, (book) => book.author)
  authoredBooks: BookEntity[];

  @ManyToMany(() => BookEntity, (book) => book.purchasers)
  purchasedBooks: BookEntity[];

  @ManyToMany(() => TagEntity)
  @JoinTable()
  tags: TagEntity[];

  @Column('simple-array', { default: [] })
  interests: string[] = [];

  @Column({ default: false })
  isDeleted: boolean = false;
}
