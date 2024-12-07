import { transformMongooseIdPlugin } from '@/core/base/database';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  profile: Types.ObjectId;
  isDeleted: boolean;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
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
AddressSchema.plugin(transformMongooseIdPlugin);

export const AddressEntity = mongoose.model<IAddress>('Address', AddressSchema);
