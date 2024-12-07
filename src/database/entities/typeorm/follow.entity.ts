import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('follows')
export class FollowEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.followers)
  @JoinColumn({ name: 'followerId' })
  follower: UserEntity;

  @Column('bigint')
  followerId: number;

  @ManyToOne(() => UserEntity, (user) => user.following)
  @JoinColumn({ name: 'followingId' })
  following: UserEntity;

  @Column('bigint')
  followingId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean = false;
}
