/* eslint-disable jest/no-jasmine-globals */
import { ArgumentMetadata, Optional, Paramtype } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CustomParseArrayPipe } from '../custom-parse-array.pipe';

// Test classes for nested validation
class RandomObject {
  @IsDefined()
  @IsBoolean()
  isEnabled: boolean;

  @IsString()
  title: string;

  @IsDate()
  createdAt: Date;

  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }
}

class ArrItemWithNestedArray {
  @Type(() => RandomObject)
  @ValidateNested({ each: true })
  random: RandomObject[];
}

class ArrItemWithProp {
  @IsNumber()
  number: number;
}

describe('CustomParseArrayPipe', () => {
  let pipe: CustomParseArrayPipe;
  let optionalPipe: CustomParseArrayPipe;

  beforeEach(() => {
    pipe = new CustomParseArrayPipe();
    optionalPipe = new CustomParseArrayPipe({ optional: true });
  });

  const createMetadata = (
    data?: string,
    type: Paramtype = 'body',
    optional: boolean = false
  ): ArgumentMetadata => ({
    type,
    metatype: Array,
    data,
    ...(optional && { decorators: [Optional] }),
  });

  describe('undefined value handling', () => {
    it('should throw RequestValidationError when undefined and not optional', async () => {
      const metadata = createMetadata('items');

      try {
        await pipe.transform(undefined, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.field).toBe(
          'items'
        );
      }
    });

    it('should return undefined when optional', async () => {
      const metadata = createMetadata('items', 'body', true);
      const result = await optionalPipe.transform(undefined, metadata);
      expect(result).toBeUndefined();
    });
  });

  describe('non-parseable value handling', () => {
    it('should throw RequestValidationError for boolean value', async () => {
      const metadata = createMetadata('items');

      try {
        await pipe.transform(true, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
      }
    });

    it('should throw RequestValidationError for number value', async () => {
      const metadata = createMetadata('items');

      try {
        await pipe.transform(42, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
      }
    });

    it('should throw RequestValidationError for plain object', async () => {
      const metadata = createMetadata('items');

      try {
        await pipe.transform({}, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
      }
    });
  });

  describe('string parsing', () => {
    it('should parse comma-separated values', async () => {
      const result = await pipe.transform(
        '1,2.0,3,{},true,null,,',
        createMetadata('items')
      );
      expect(result).toEqual(['1', '2.0', '3', '{}', 'true', 'null', '', '']);
    });

    it('should parse custom separator values', async () => {
      const customPipe = new CustomParseArrayPipe({ separator: '/' });
      const result = await customPipe.transform(
        '1/2/3',
        createMetadata('items')
      );
      expect(result).toEqual(['1', '2', '3']);
    });

    it('should parse dot-separated values', async () => {
      const customPipe = new CustomParseArrayPipe({ separator: '.' });
      const result = await customPipe.transform(
        '1.2.3',
        createMetadata('items')
      );
      expect(result).toEqual(['1', '2', '3']);
    });
  });

  describe('type validation', () => {
    it('should validate numbers', async () => {
      const numberPipe = new CustomParseArrayPipe({ items: Number });
      const result = await numberPipe.transform(
        '1,2,3',
        createMetadata('items')
      );
      expect(result).toEqual([1, 2, 3]);

      try {
        await numberPipe.transform('1,2,a,null,3', createMetadata('items'));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        expect((error as RequestValidationError).errors[0]?.message).toContain(
          'invalid_array'
        );
      }
    });

    it('should validate booleans', async () => {
      const boolPipe = new CustomParseArrayPipe({ items: Boolean });
      const result = await boolPipe.transform(
        'true,false',
        createMetadata('items')
      );
      expect(result).toEqual([true, false]);

      try {
        await boolPipe.transform('true,123,false', createMetadata('items'));
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
      }
    });
  });

  describe('complex object validation', () => {
    it('should validate objects with properties', async () => {
      const pipe = new CustomParseArrayPipe({ items: ArrItemWithProp });

      try {
        await pipe.transform(
          [{ number: '1' }, { number: '2' }, { number: 3 }],
          createMetadata('items')
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
      }
    });

    it('should validate nested arrays', async () => {
      const pipe = new CustomParseArrayPipe({ items: ArrItemWithNestedArray });

      try {
        await pipe.transform(
          [
            {
              random: [
                {
                  isEnabled: true,
                  title: true, // should be string
                  createdAt: new Date(),
                },
              ],
            },
            {
              random: [
                {
                  title: 'ok',
                  createdAt: false, // should be Date
                },
              ],
            },
          ],
          createMetadata('items')
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
      }
    });
  });
});
