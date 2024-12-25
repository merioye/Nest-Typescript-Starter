import { ITranslationKeyFormatterService } from '../../interfaces';
import { TranslationKeyFormatterService } from '../translation-key-formatter.service';

describe('TranslationKeyFormatterService', () => {
  let service: ITranslationKeyFormatterService;
  const separator = '::';

  beforeEach(() => {
    service = new TranslationKeyFormatterService(separator);
  });

  describe('format', () => {
    it('should return key and undefined args when no separator is present', () => {
      const key = 'test.key';
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: undefined,
      });
    });

    it('should return empty key and undefined args when empty string is provided', () => {
      const key = '';
      const result = service.format(key);

      expect(result).toEqual({
        key: '',
        args: undefined,
      });
    });

    it('should parse key and args when separator is present', () => {
      const key = 'test.key::{"name":"John","age":"25"}';
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          name: 'John',
          age: '25',
        },
      });
    });

    it('should handle empty args object', () => {
      const key = 'test.key::{}';
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {},
      });
    });

    it('should throw error when args JSON is invalid', () => {
      const key = 'test.key::{invalid_json}';

      expect(() => service.format(key)).toThrow(SyntaxError);
    });

    it('should handle key with multiple separators', () => {
      const key = 'test.key::{"data":"value"}::extra';
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          data: 'value',
        },
      });
    });

    it('should handle key with special characters in args', () => {
      const key = 'test.key::{"special":"!@#$%^&*()"}';
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          special: '!@#$%^&*()',
        },
      });
    });

    it('should handle key with nested objects in args', () => {
      const key = 'test.key::{"user":{"name":"John","age":"25"}}';
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          user: {
            name: 'John',
            age: '25',
          },
        },
      });
    });
  });

  describe('dependency injection', () => {
    it('should be defined with injected separator', () => {
      const service = new TranslationKeyFormatterService(separator);
      expect(service).toBeDefined();
      expect(service['_translationKeySeparator']).toBe(separator);
    });
  });
});
