import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IPost } from './post.model';
import { IUser } from './user.model';

export interface ITag extends Document {
  name: string;
  posts: Types.DocumentArray<IPost>;
  users: Types.DocumentArray<IUser>;
  isDeleted: boolean;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Apply the transform plugin
TagSchema.plugin(transformMongooseIdPlugin);

export const TagEntity = mongoose.model<ITag>('Tag', TagSchema);
