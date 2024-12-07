import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILike extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  isDeleted: boolean;
}

const LikeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
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

// Unique index to prevent duplicate likes
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

// Apply the transform plugin
LikeSchema.plugin(transformMongooseIdPlugin);

export const LikeEntity = mongoose.model<ILike>('Like', LikeSchema);
