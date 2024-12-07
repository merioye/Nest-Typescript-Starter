import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => PostEntity)
  @JoinTable()
  posts: PostEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @Column({ default: false })
  isDeleted: boolean = false;
}
