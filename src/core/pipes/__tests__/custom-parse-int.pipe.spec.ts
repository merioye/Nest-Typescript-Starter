/* eslint-disable jest/no-jasmine-globals */
import { ArgumentMetadata, Optional, Paramtype } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { TranslationKeySeparator } from '@/constants';

import { CustomParseIntPipe } from '../custom-parse-int.pipe';

describe('CustomParseIntPipe', () => {
  let pipe: CustomParseIntPipe;
  let optionalPipe: CustomParseIntPipe;

  beforeEach(() => {
    pipe = new CustomParseIntPipe();
    optionalPipe = new CustomParseIntPipe({ optional: true });
  });

  // Helper function to create metadata
  const createMetadata = (
    data?: string,
    type: Paramtype = 'body',
    optional: boolean = false
  ): ArgumentMetadata => ({
    type,
    metatype: Number,
    data,
    ...(optional && { decorators: [Optional] }),
  });

  describe('valid integer transformations', () => {
    it('should transform positive integer string to number', async () => {
      const result = await pipe.transform('123', createMetadata('age'));
      expect(result).toBe(123);
    });

    it('should transform negative integer string to number', async () => {
      const result = await pipe.transform(
        '-123',
        createMetadata('temperature')
      );
      expect(result).toBe(-123);
    });

    it('should transform zero string to number', async () => {
      const result = await pipe.transform('0', createMetadata('count'));
      expect(result).toBe(0);
    });

    it('should transform string with leading zeros to number', async () => {
      const result = await pipe.transform('000123', createMetadata('id'));
      expect(result).toBe(123);
    });
  });

  describe('optional parameter handling', () => {
    it('should return undefined for undefined value when optional', async () => {
      const metadata = createMetadata('age', 'body', true);
      const result = await optionalPipe.transform(
        undefined as unknown as string,
        metadata
      );
      expect(result).toBeUndefined();
    });

    it('should return null for null value when optional', async () => {
      const metadata = createMetadata('age', 'body', true);
      const result = await optionalPipe.transform(
        null as unknown as string,
        metadata
      );
      expect(result).toBeNull();
    });

    it('should still transform valid integer when optional', async () => {
      const metadata = createMetadata('age', 'body', true);
      const result = await optionalPipe.transform('42', metadata);
      expect(result).toBe(42);
    });

    it('should still throw error for invalid integer when optional', async () => {
      const metadata = createMetadata('age', 'body', true);

      try {
        await optionalPipe.transform('invalid', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('age');
      }
    });
  });

  describe('invalid integer transformations', () => {
    it('should throw RequestValidationError for float string', async () => {
      const metadata = createMetadata('price');

      try {
        await pipe.transform('123.45', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors).toEqual([
          {
            message: `common.error.invalid_int${TranslationKeySeparator}${JSON.stringify(
              {
                field: 'price',
              }
            )}`,
            field: 'price',
            location: 'body',
            stack: null,
          },
        ]);
      }
    });

    it('should throw RequestValidationError for alphabetic characters', async () => {
      const metadata = createMetadata('age');

      try {
        await pipe.transform('abc', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('age');
      }
    });

    it('should throw RequestValidationError for mixed alphanumeric', async () => {
      const metadata = createMetadata('id');

      try {
        await pipe.transform('123abc', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('id');
      }
    });

    it('should throw RequestValidationError for special characters', async () => {
      const metadata = createMetadata('count');

      try {
        await pipe.transform('123!@#', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'count'
        );
      }
    });

    it('should throw RequestValidationError for exponential notation', async () => {
      const metadata = createMetadata('value');

      try {
        await pipe.transform('1e5', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'value'
        );
      }
    });

    it('should throw RequestValidationError for null when not optional', async () => {
      const metadata = createMetadata('age');

      try {
        await pipe.transform(null as unknown as string, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('age');
      }
    });

    it('should throw RequestValidationError for undefined when not optional', async () => {
      const metadata = createMetadata('age');

      try {
        await pipe.transform(undefined as unknown as string, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('age');
      }
    });
  });

  describe('metadata handling', () => {
    it('should handle missing metadata data field', async () => {
      const metadata = createMetadata(undefined);

      try {
        await pipe.transform('not-a-number', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('');
      }
    });

    it('should handle different metadata types', async () => {
      const metadata = createMetadata('age', 'query');

      try {
        await pipe.transform('not-a-number', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.location).toBe(
          'query'
        );
      }
    });
  });

  describe('empty strings and whitespace', () => {
    it('should throw RequestValidationError for empty string', async () => {
      const metadata = createMetadata('age');

      try {
        await pipe.transform('', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('age');
      }
    });

    it('should throw RequestValidationError for whitespace string', async () => {
      const metadata = createMetadata('age');

      try {
        await pipe.transform('   ', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('age');
      }
    });
  });
});
