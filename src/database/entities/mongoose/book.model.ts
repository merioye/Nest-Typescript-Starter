import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IUser } from './user.model';

export interface IBook extends Document {
  title: string;
  description?: string;
  price: number;
  publishDate: Date;
  author: Types.ObjectId;
  purchasers: Types.DocumentArray<IUser>;
  genre: Types.ObjectId;
  isDeleted: boolean;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    publishDate: {
      type: Date,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purchasers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    genre: {
      type: Schema.Types.ObjectId,
      ref: 'Genre',
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
BookSchema.plugin(transformMongooseIdPlugin);

export const BookEntity = mongoose.model<IBook>('Book', BookSchema);
