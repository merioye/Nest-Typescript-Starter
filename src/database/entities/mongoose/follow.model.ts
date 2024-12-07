import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFollow extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  isDeleted: boolean;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

// Unique index to prevent duplicate follows
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Apply the transform plugin
FollowSchema.plugin(transformMongooseIdPlugin);

export const FollowEntity = mongoose.model<IFollow>('Follow', FollowSchema);
