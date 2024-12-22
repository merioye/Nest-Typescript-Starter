import { ApiResponse } from '../api-response.util';

describe('ApiResponse', () => {
  describe('constructor', () => {
    it('should create an instance with default values', () => {
      const result = { data: 'test' };
      const response = new ApiResponse({ result });

      expect(response.result).toBe(result);
      expect(response.message).toBe('common.success.Success');
      expect(response.statusCode).toBe(200);
      expect(response.success).toBe(true);
      expect(response.errors).toEqual([]);
      expect(response.errorInfo).toEqual({});
    });

    it('should create an instance with custom message and status code', () => {
      const result = { data: 'test' };
      const message = 'custom.message';
      const statusCode = 201;
      const response = new ApiResponse({ result, message, statusCode });

      expect(response.result).toBe(result);
      expect(response.message).toBe(message);
      expect(response.statusCode).toBe(statusCode);
      expect(response.success).toBe(true);
      expect(response.errors).toEqual([]);
      expect(response.errorInfo).toEqual({});
    });

    it('should set success to false for status codes >= 400', () => {
      const result = { error: 'Not Found' };
      const statusCode = 404;
      const response = new ApiResponse({ result, statusCode });

      expect(response.success).toBe(false);
    });

    it('should handle null result', () => {
      const response = new ApiResponse({ result: null });

      expect(response.result).toBeNull();
      expect(response.message).toBe('common.success.Success');
      expect(response.statusCode).toBe(200);
      expect(response.success).toBe(true);
      expect(response.errors).toEqual([]);
      expect(response.errorInfo).toEqual({});
    });

    it('should handle undefined optional parameters', () => {
      const result = { data: 'test' };
      const response = new ApiResponse({ result });

      expect(response.result).toBe(result);
      expect(response.message).toBe('common.success.Success');
      expect(response.statusCode).toBe(200);
      expect(response.success).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should properly handle generic type parameter', () => {
      interface TestData {
        id: number;
        name: string;
      }

      const testData: TestData = { id: 1, name: 'Test' };
      const response = new ApiResponse<TestData>({ result: testData });

      expect(response.result).toEqual(testData);
      expect(response.result.id).toBe(1);
      expect(response.result.name).toBe('Test');
    });

    it('should handle array results', () => {
      const arrayResult = [1, 2, 3];
      const response = new ApiResponse<number[]>({ result: arrayResult });

      expect(Array.isArray(response.result)).toBe(true);
      expect(response.result).toEqual(arrayResult);
    });
  });
});
