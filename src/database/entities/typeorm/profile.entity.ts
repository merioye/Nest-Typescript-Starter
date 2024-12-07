import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AddressEntity } from './address.entity';
import { UserEntity } from './user.entity';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column('json', { nullable: true })
  socialLinks?: JSON;

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn()
  user: UserEntity;

  @Column('bigint')
  userId: number;

  @OneToOne(() => AddressEntity, (address) => address.profile)
  address?: AddressEntity;

  @Column({ default: false })
  isDeleted: boolean = false;
}
