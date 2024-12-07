import { Schema } from 'mongoose';

// Mongoose Global plugin to transform _id to id
export const transformMongooseIdPlugin = (schema: Schema): void => {
  schema.set('toJSON', {
    transform: (_, ret) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });

  schema.set('toObject', {
    transform: (_, ret) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  });
};
