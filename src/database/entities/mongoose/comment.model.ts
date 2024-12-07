import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  parent?: Types.ObjectId;
  replies: Types.DocumentArray<IComment>;
  isDeleted: boolean;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: false,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
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
CommentSchema.plugin(transformMongooseIdPlugin);

export const CommentEntity = mongoose.model<IComment>('Comment', CommentSchema);
