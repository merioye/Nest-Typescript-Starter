import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn()
  author: UserEntity;

  @Column('bigint')
  authorId: number;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  @JoinColumn()
  post: PostEntity;

  @Column('bigint')
  postId: number;

  @ManyToOne(() => CommentEntity, (comment) => comment.replies, {
    nullable: true,
  })
  @JoinColumn()
  parent?: CommentEntity;

  @Column({ nullable: true, type: 'bigint' })
  parentId?: number;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  replies: CommentEntity[];

  @Column({ default: false })
  isDeleted: boolean = false;
}
