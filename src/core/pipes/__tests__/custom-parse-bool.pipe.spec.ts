/* eslint-disable jest/no-jasmine-globals */
import { ArgumentMetadata, Optional, Paramtype } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { TranslationKeySeparator } from '@/constants';

import { CustomParseBoolPipe } from '../custom-parse-bool.pipe';

describe('CustomParseBoolPipe', () => {
  let pipe: CustomParseBoolPipe;
  let optionalPipe: CustomParseBoolPipe;

  beforeEach(() => {
    pipe = new CustomParseBoolPipe();
    optionalPipe = new CustomParseBoolPipe({ optional: true });
  });

  // Helper function to create metadata
  const createMetadata = (
    data?: string,
    type: Paramtype = 'body',
    optional: boolean = false
  ): ArgumentMetadata => ({
    type,
    metatype: Boolean,
    data,
    ...(optional && { decorators: [Optional] }),
  });

  describe('valid boolean transformations', () => {
    it('should transform "true" string to true', async () => {
      const result = await pipe.transform('true', createMetadata('isActive'));
      expect(result).toBe(true);
    });

    it('should transform "false" string to false', async () => {
      const result = await pipe.transform('false', createMetadata('isActive'));
      expect(result).toBe(false);
    });

    it('should transform true boolean to true', async () => {
      const result = await pipe.transform(true, createMetadata('isActive'));
      expect(result).toBe(true);
    });

    it('should transform false boolean to false', async () => {
      const result = await pipe.transform(false, createMetadata('isActive'));
      expect(result).toBe(false);
    });
  });

  describe('optional parameter handling', () => {
    it('should return undefined for undefined value when optional', async () => {
      const metadata = createMetadata('isActive', 'body', true);
      const result = await optionalPipe.transform(
        undefined as unknown as boolean,
        metadata
      );
      expect(result).toBeUndefined();
    });

    it('should return null for null value when optional', async () => {
      const metadata = createMetadata('isActive', 'body', true);
      const result = await optionalPipe.transform(
        null as unknown as boolean,
        metadata
      );
      expect(result).toBeNull();
    });

    it('should still transform valid boolean when optional', async () => {
      const metadata = createMetadata('isActive', 'body', true);
      const result = await optionalPipe.transform('true', metadata);
      expect(result).toBe(true);
    });

    it('should still throw error for invalid boolean when optional', async () => {
      const metadata = createMetadata('isActive', 'body', true);

      try {
        await optionalPipe.transform('invalid-value', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });
  });

  describe('invalid boolean transformations', () => {
    it('should throw RequestValidationError for invalid string', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform('not-a-boolean', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors).toEqual([
          {
            message: `common.error.invalid_boolean${TranslationKeySeparator}${JSON.stringify(
              {
                field: 'isActive',
              }
            )}`,
            field: 'isActive',
            location: 'body',
            stack: null,
          },
        ]);
      }
    });

    it('should throw RequestValidationError for null', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform(null as unknown as boolean, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });

    it('should throw RequestValidationError for undefined', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform(undefined as unknown as boolean, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });

    it('should throw RequestValidationError for "0" string', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform('0', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });

    it('should throw RequestValidationError for "1" string', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform('1', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });

    it('should throw RequestValidationError for uppercase "TRUE"', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform('TRUE', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });

    it('should throw RequestValidationError for null when not optional', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform(null as unknown as boolean, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });

    it('should throw RequestValidationError for undefined when not optional', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform(undefined as unknown as boolean, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });
  });

  describe('metadata handling', () => {
    it('should handle missing metadata data field', async () => {
      const metadata = createMetadata(undefined);

      try {
        await pipe.transform('not-a-boolean', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe('');
      }
    });

    it('should handle different metadata types', async () => {
      const metadata = createMetadata('isActive', 'query');

      try {
        await pipe.transform('not-a-boolean', metadata);
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
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform('', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });

    it('should throw RequestValidationError for whitespace string', async () => {
      const metadata = createMetadata('isActive');

      try {
        await pipe.transform('   ', metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'isActive'
        );
      }
    });
  });
});
