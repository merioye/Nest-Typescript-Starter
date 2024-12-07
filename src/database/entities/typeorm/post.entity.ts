import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';
import { LikeEntity } from './like.entity';
import { TagEntity } from './tag.entity';
import { UserEntity } from './user.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  published: boolean = false;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  @JoinColumn()
  author: UserEntity;

  @Column('bigint')
  authorId: number;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (like) => like.post)
  likes: LikeEntity[];

  @ManyToMany(() => TagEntity)
  @JoinTable()
  tags: TagEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.posts)
  @JoinColumn()
  category: CategoryEntity;

  @Column('bigint')
  categoryId: number;

  @Column({ default: false })
  isDeleted: boolean = false;
}
