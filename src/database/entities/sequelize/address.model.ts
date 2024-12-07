import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { ProfileEntity } from './profile.model';

@Table({
  tableName: 'addresses',
})
export class AddressEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id: number;

  @Column(DataType.STRING)
  street: string;

  @Column(DataType.STRING)
  city: string;

  @Column(DataType.STRING)
  state: string;

  @Column(DataType.STRING)
  country: string;

  @Column(DataType.STRING)
  zipCode: string;

  @Unique
  @ForeignKey(() => ProfileEntity)
  @Column(DataType.BIGINT)
  profileId: number;

  @BelongsTo(() => ProfileEntity)
  profile: ProfileEntity;

  @Column(DataType.BOOLEAN)
  @Default(false)
  isDeleted: boolean;
}
