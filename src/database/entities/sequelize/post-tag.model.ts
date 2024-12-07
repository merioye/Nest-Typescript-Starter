import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { PostEntity } from './post.model';
import { TagEntity } from './tag.model';

@Table({ tableName: 'posts_tags' })
export class PostTagEntity extends Model {
  @ForeignKey(() => PostEntity)
  @Column(DataType.BIGINT)
  postId: number;

  @ForeignKey(() => TagEntity)
  @Column(DataType.BIGINT)
  tagId: number;
}
