import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IBook } from './book.model';

export interface IGenre extends Document {
  name: string;
  description?: string;
  books: Types.DocumentArray<IBook>;
  isDeleted: boolean;
}

const GenreSchema = new Schema<IGenre>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
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
GenreSchema.plugin(transformMongooseIdPlugin);

export const GenreEntity = mongoose.model<IGenre>('Genre', GenreSchema);
