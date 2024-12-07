import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('likes')
export class LikeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  @JoinColumn()
  user: UserEntity;

  @Column('bigint')
  userId: number;

  @ManyToOne(() => PostEntity, (post) => post.likes)
  @JoinColumn()
  post: PostEntity;

  @Column('bigint')
  postId: number;

  @Column({ default: false })
  isDeleted: boolean = false;
}
