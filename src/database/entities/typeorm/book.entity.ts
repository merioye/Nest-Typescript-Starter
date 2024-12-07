import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GenreEntity } from './genre.entity';
import { UserEntity } from './user.entity';

@Entity('books')
export class BookEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column('decimal')
  price: number;

  @Column()
  publishDate: Date;

  @ManyToOne(() => UserEntity, (user) => user.authoredBooks)
  @JoinColumn()
  author: UserEntity;

  @Column('bigint')
  authorId: number;

  @ManyToMany(() => UserEntity, (user) => user.purchasedBooks)
  @JoinTable()
  purchasers: UserEntity[];

  @ManyToOne(() => GenreEntity, (genre) => genre.books)
  @JoinColumn()
  genre: GenreEntity;

  @Column('bigint')
  genreId: number;

  @Column({ default: false })
  isDeleted: boolean = false;
}
