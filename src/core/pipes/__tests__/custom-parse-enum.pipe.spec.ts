/* eslint-disable jest/no-jasmine-globals */
import { ArgumentMetadata, Optional, Paramtype } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { TranslationKeySeparator } from '@/constants';

import { CustomParseEnumPipe } from '../custom-parse-enum.pipe';

// Test enum
enum TestEnum {
  ONE = 'one',
  TWO = 'two',
  THREE = 'three',
}

describe('CustomParseEnumPipe', () => {
  let pipe: CustomParseEnumPipe;
  let optionalPipe: CustomParseEnumPipe;

  beforeEach(() => {
    pipe = new CustomParseEnumPipe(TestEnum);
    optionalPipe = new CustomParseEnumPipe(TestEnum, { optional: true });
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

  describe('valid enum transformations', () => {
    it('should accept valid enum value', async () => {
      const result = await pipe.transform('one', createMetadata('status'));
      expect(result).toBe(TestEnum.ONE);
    });

    it('should handle valid enum value when optional', async () => {
      const metadata = createMetadata('status', 'body', true);
      const result = await optionalPipe.transform('two', metadata);
      expect(result).toBe(TestEnum.TWO);
    });
  });

  describe('optional parameter handling', () => {
    it('should return undefined for undefined value when optional', async () => {
      const metadata = createMetadata('status', 'body', true);
      const result = await optionalPipe.transform(
        undefined as unknown as string,
        metadata
      );
      expect(result).toBeUndefined();
    });

    it('should return null for null value when optional', async () => {
      const metadata = createMetadata('status', 'body', true);
      const result = await optionalPipe.transform(
        null as unknown as string,
        metadata
      );
      expect(result).toBeNull();
    });
  });

  describe('invalid enum transformations', () => {
    it('should throw RequestValidationError for invalid enum value', async () => {
      const metadata = createMetadata('status');

      try {
        await pipe.transform('invalid', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors).toEqual([
          {
            message: `common.error.invalid_enum${TranslationKeySeparator}${JSON.stringify(
              {
                field: 'status',
                allowedValues: 'one, two, three',
              }
            )}`,
            field: 'status',
            location: 'body',
            stack: null,
          },
        ]);
      }
    });

    it('should throw RequestValidationError for empty string', async () => {
      const metadata = createMetadata('status');

      try {
        await pipe.transform('', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'status'
        );
      }
    });

    it('should throw RequestValidationError for whitespace', async () => {
      const metadata = createMetadata('status');

      try {
        await pipe.transform('   ', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'status'
        );
      }
    });

    it('should throw RequestValidationError for numbers', async () => {
      const metadata = createMetadata('status');

      try {
        await pipe.transform('123', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'status'
        );
      }
    });
  });

  describe('metadata handling', () => {
    it('should handle missing metadata data field', async () => {
      const metadata = createMetadata(undefined);

      try {
        await pipe.transform('invalid', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('');
      }
    });

    it('should handle different metadata types', async () => {
      const metadata = createMetadata('status', 'query');

      try {
        await pipe.transform('invalid', metadata);
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
