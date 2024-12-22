/* eslint-disable jest/no-jasmine-globals */
import { ArgumentMetadata, Optional, Paramtype } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { TranslationKeySeparator } from '@/constants';

import { CustomParseUUIDPipe } from '../custom-parse-uuid.pipe';

describe('CustomParseUUIDPipe', () => {
  let pipe: CustomParseUUIDPipe;
  let optionalPipe: CustomParseUUIDPipe;

  beforeEach(() => {
    pipe = new CustomParseUUIDPipe();
    optionalPipe = new CustomParseUUIDPipe({ optional: true });
  });

  // Helper function to create metadata
  const createMetadata = (
    data?: string,
    type: Paramtype = 'body',
    optional: boolean = false
  ): ArgumentMetadata => ({
    type,
    metatype: String,
    data,
    ...(optional && { decorators: [Optional] }),
  });

  describe('valid UUID transformations', () => {
    it('should accept valid UUID v4', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const result = await pipe.transform(validUUID, createMetadata('id'));
      expect(result).toBe(validUUID);
    });

    it('should accept valid UUID v4 with uppercase letters', async () => {
      const validUUID = '123E4567-E89B-12D3-A456-426614174000';
      const result = await pipe.transform(validUUID, createMetadata('id'));
      expect(result).toBe(validUUID);
    });
  });

  describe('optional parameter handling', () => {
    it('should return undefined for undefined value when optional', async () => {
      const metadata = createMetadata('id', 'body', true);
      const result = await optionalPipe.transform(
        undefined as unknown as string,
        metadata
      );
      expect(result).toBeUndefined();
    });

    it('should return null for null value when optional', async () => {
      const metadata = createMetadata('id', 'body', true);
      const result = await optionalPipe.transform(
        null as unknown as string,
        metadata
      );
      expect(result).toBeNull();
    });

    it('should still validate UUID format when optional', async () => {
      const metadata = createMetadata('id', 'body', true);
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const result = await optionalPipe.transform(validUUID, metadata);
      expect(result).toBe(validUUID);
    });

    it('should still throw error for invalid UUID when optional', async () => {
      const metadata = createMetadata('id', 'body', true);

      try {
        await optionalPipe.transform('invalid-uuid', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('id');
      }
    });
  });

  describe('invalid UUID transformations', () => {
    it('should throw RequestValidationError for invalid UUID format', async () => {
      const metadata = createMetadata('id');

      try {
        await pipe.transform('not-a-uuid', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors).toEqual([
          {
            message: `common.error.invalid_uuid${TranslationKeySeparator}${JSON.stringify(
              {
                field: 'id',
              }
            )}`,
            field: 'id',
            location: 'body',
            stack: null,
          },
        ]);
      }
    });

    it('should throw RequestValidationError for null when not optional', async () => {
      const metadata = createMetadata('id');

      try {
        await pipe.transform(null as unknown as string, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('id');
      }
    });

    it('should throw RequestValidationError for undefined when not optional', async () => {
      const metadata = createMetadata('id');

      try {
        await pipe.transform(undefined as unknown as string, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('id');
      }
    });

    it('should throw RequestValidationError for empty string', async () => {
      const metadata = createMetadata('id');

      try {
        await pipe.transform('', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('id');
      }
    });

    it('should throw RequestValidationError for malformed UUID', async () => {
      const metadata = createMetadata('id');

      try {
        await pipe.transform('123e4567-e89b-12d3-a456-42661417400', metadata); // Missing one character
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('id');
      }
    });
  });

  describe('metadata handling', () => {
    it('should handle missing metadata data field', async () => {
      const metadata = createMetadata(undefined);

      try {
        await pipe.transform('not-a-uuid', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('');
      }
    });

    it('should handle different metadata types', async () => {
      const metadata = createMetadata('id', 'query');

      try {
        await pipe.transform('not-a-uuid', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.location).toBe(
          'query'
        );
      }
    });
  });
});
