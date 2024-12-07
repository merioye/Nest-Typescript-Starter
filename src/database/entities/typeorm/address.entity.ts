import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProfileEntity } from './profile.entity';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  zipCode: string;

  @OneToOne(() => ProfileEntity, (profile) => profile.address)
  @JoinColumn()
  profile: ProfileEntity;

  @Column('bigint')
  profileId: number;

  @Column({ default: false })
  isDeleted: boolean = false;
}
