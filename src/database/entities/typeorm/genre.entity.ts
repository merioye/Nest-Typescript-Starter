import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BookEntity } from './book.entity';

@Entity('genres')
export class GenreEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => BookEntity, (book) => book.genre)
  books: BookEntity[];

  @Column({ default: false })
  isDeleted: boolean = false;
}
