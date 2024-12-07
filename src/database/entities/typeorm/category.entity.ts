import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PostEntity } from './post.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => PostEntity, (post) => post.category)
  posts: PostEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.subCategories, {
    nullable: true,
  })
  @JoinColumn()
  parentCategory?: CategoryEntity;

  @Column({ nullable: true, type: 'bigint' })
  parentCategoryId?: number;

  @OneToMany(() => CategoryEntity, (category) => category.parentCategory)
  subCategories: CategoryEntity[];

  @Column({ default: false })
  isDeleted: boolean = false;
}
