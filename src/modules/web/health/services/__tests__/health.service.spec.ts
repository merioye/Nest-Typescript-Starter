import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorServiceToken } from '@/modules/common/translator';

import { Health } from '../../types';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  let healthService: HealthService;
  let mockTranslatorService: {
    t: jest.Mock;
  };

  beforeEach(async () => {
    // Create mock translator service
    mockTranslatorService = {
      t: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: TranslatorServiceToken,
          useValue: mockTranslatorService,
        },
      ],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(healthService).toBeDefined();
    });

    it('should have translator service injected', () => {
      expect(healthService['_translatorService']).toBeDefined();
    });

    it('should throw error when translator service is not provided', async () => {
      await expect(
        Test.createTestingModule({
          providers: [HealthService], // No translator service provided
        }).compile()
      ).rejects.toThrow();
    });
  });

  describe('health', () => {
    it('should return correct health structure', () => {
      mockTranslatorService.t.mockReturnValue('OK');

      const result = healthService.health();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('status');
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });

    it('should use translator service for status', () => {
      const expectedStatus = 'Translated OK';
      mockTranslatorService.t.mockReturnValue(expectedStatus);

      const result = healthService.health();

      expect(mockTranslatorService.t).toHaveBeenCalledWith('common.success.ok');
      expect(result.status).toBe(expectedStatus);
    });

    it('should return consistent message format', () => {
      mockTranslatorService.t.mockReturnValue('OK');

      const firstCall = healthService.health();
      const secondCall = healthService.health();

      expect(firstCall.message).toBe(secondCall.message);
    });

    it('should handle translator service returning empty string', () => {
      mockTranslatorService.t.mockReturnValue('');

      const result = healthService.health();

      expect(result.status).toBe('');
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });

    it('should handle translator service returning null', () => {
      mockTranslatorService.t.mockReturnValue(null);

      const result = healthService.health();

      expect(result.status).toBe(null);
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });

    it('should maintain Health type contract', () => {
      mockTranslatorService.t.mockReturnValue('OK');

      const result = healthService.health();

      const healthCheck: Health = result; // Type assertion should not fail
      expect(healthCheck).toEqual({
        message: 'health.success.Server_is_up_and_running',
        status: 'OK',
      });
    });
  });

  describe('error handling', () => {
    it('should handle translator service throwing error', () => {
      mockTranslatorService.t.mockImplementation(() => {
        throw new Error('Translation failed');
      });

      expect(() => healthService.health()).toThrow('Translation failed');
    });

    it('should handle translator service returning undefined', () => {
      mockTranslatorService.t.mockReturnValue(undefined);

      const result = healthService.health();

      expect(result.status).toBeUndefined();
      expect(result.message).toBe('health.success.Server_is_up_and_running');
    });
  });

  describe('service lifecycle', () => {
    it('should maintain singleton scope', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          HealthService,
          {
            provide: TranslatorServiceToken,
            useValue: mockTranslatorService,
          },
        ],
      }).compile();

      const service1 = module.get(HealthService);
      const service2 = module.get(HealthService);

      expect(service1).toBe(service2);
    });
  });
});
