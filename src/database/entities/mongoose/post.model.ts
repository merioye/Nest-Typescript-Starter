import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IComment } from './comment.model';
import { ILike } from './like.model';
import { ITag } from './tag.model';

export interface IPost extends Document {
  title: string;
  content: string;
  published: boolean;
  author: Types.ObjectId;
  comments: Types.DocumentArray<IComment>;
  likes: Types.DocumentArray<ILike>;
  tags: Types.DocumentArray<ITag>;
  category: Types.ObjectId;
  isDeleted: boolean;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Like',
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
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
PostSchema.plugin(transformMongooseIdPlugin);

export const PostEntity = mongoose.model<IPost>('Post', PostSchema);
