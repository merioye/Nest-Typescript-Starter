import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IPost } from './post.model';

export interface ICategory extends Document {
  name: string;
  description?: string;
  posts: Types.DocumentArray<IPost>;
  parentCategory?: Types.ObjectId;
  subCategories: Types.DocumentArray<ICategory>;
  isDeleted: boolean;
}

const CategorySchema = new Schema<ICategory>(
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
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    subCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
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
CategorySchema.plugin(transformMongooseIdPlugin);

export const CategoryEntity = mongoose.model<ICategory>(
  'Category',
  CategorySchema
);
