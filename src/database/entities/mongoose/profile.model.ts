import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IAddress } from './address.model';

export interface IProfile extends Document {
  bio?: string;
  website?: string;
  avatarUrl?: string;
  socialLinks?: any;
  user: Types.ObjectId;
  address?: IAddress;
  isDeleted: boolean;
}

const ProfileSchema = new Schema<IProfile>(
  {
    bio: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    socialLinks: {
      type: Schema.Types.Mixed,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
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
ProfileSchema.plugin(transformMongooseIdPlugin);

export const ProfileEntity = mongoose.model<IProfile>('Profile', ProfileSchema);
