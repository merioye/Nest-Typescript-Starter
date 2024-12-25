import { Test, TestingModule } from '@nestjs/testing';
import { LoggerToken } from '@/modules/common/logger';

import { HealthServiceToken } from '../constants';
import { HealthController } from '../health.controller';
import { Health } from '../types';

describe('HealthController', () => {
  let controller: HealthController;
  let mockLogger: { info: jest.Mock };
  let mockHealthService: { health: jest.Mock };

  const mockHealth: Health = {
    status: 'ok',
    message: 'Server is up and running',
  };

  beforeEach(async () => {
    // Create mock implementations
    mockLogger = {
      info: jest.fn(),
    };

    mockHealthService = {
      health: jest.fn().mockReturnValue(mockHealth),
    };

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: LoggerToken,
          useValue: mockLogger,
        },
        {
          provide: HealthServiceToken,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('checkHealth', () => {
    it('should log info message when health check is requested', () => {
      // Act
      controller.checkHealth();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request for checking server health'
      );
    });

    it('should return health information from health service', () => {
      // Act
      const result = controller.checkHealth();

      // Assert
      expect(mockHealthService.health).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockHealth);
    });

    it('should call health service method and logger in correct order', () => {
      // Act
      controller.checkHealth();

      // Assert
      const calls: string[] = [];
      mockLogger.info.mock.invocationCallOrder.forEach(() =>
        calls.push('logger')
      );
      mockHealthService.health.mock.invocationCallOrder.forEach(() =>
        calls.push('health')
      );

      expect(calls).toEqual(['logger', 'health']);
    });
  });
});
