import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { Role } from '@/types';

import { IBook } from './book.model';
import { IComment } from './comment.model';
import { IFollow } from './follow.model';
import { ILike } from './like.model';
import { IPost } from './post.model';
import { IProfile } from './profile.model';
import { ITag } from './tag.model';

// Interfaces for TypeScript support
export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  isActive: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profile?: IProfile;
  posts: Types.DocumentArray<IPost>;
  comments: Types.DocumentArray<IComment>;
  likes: Types.DocumentArray<ILike>;
  followers: Types.DocumentArray<IFollow>;
  following: Types.DocumentArray<IFollow>;
  authoredBooks: Types.DocumentArray<IBook>;
  purchasedBooks: Types.DocumentArray<IBook>;
  tags: Types.DocumentArray<ITag>;
  interests: string[];
  isDeleted: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    age: {
      type: Number,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    lastLoginAt: {
      type: Date,
      required: false,
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
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
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Follow',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Follow',
      },
    ],
    authoredBooks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    purchasedBooks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    interests: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Apply the transform plugin
UserSchema.plugin(transformMongooseIdPlugin);

export const UserEntity = mongoose.model<IUser>('User', UserSchema);
