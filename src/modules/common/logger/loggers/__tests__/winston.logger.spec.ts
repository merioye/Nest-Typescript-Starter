import { LoggerModuleOptions } from '@/types';
import { Environment } from '@/enums';

import { ILogger } from '../../interfaces';
import { WinstonLogger } from '../winston.logger';

interface MockWinstonModule {
  format: {
    combine: jest.Mock;
    timestamp: jest.Mock;
    errors: jest.Mock;
    json: jest.Mock;
    colorize: jest.Mock;
    printf: jest.Mock;
    logstash: jest.Mock;
    metadata: jest.Mock;
  };
  createLogger: jest.Mock;
  transports: {
    Console: jest.Mock;
    File: jest.Mock;
  };
}

jest.mock('winston', () => {
  const mockFormat: MockWinstonModule['format'] = {
    combine: jest.fn().mockReturnThis(),
    timestamp: jest.fn().mockReturnThis(),
    errors: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    colorize: jest.fn().mockReturnThis(),
    printf: jest.fn().mockReturnValue('mockFormat'),
    logstash: jest.fn().mockReturnThis(),
    metadata: jest.fn().mockReturnThis(),
  };

  const mockLogger: jest.Mocked<Partial<ILogger>> = {
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockModule: MockWinstonModule = {
    format: mockFormat,
    createLogger: jest.fn().mockReturnValue(mockLogger),
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
  };

  return mockModule;
});

describe('WinstonLogger', () => {
  let logger: ILogger;
  const mockOptions: LoggerModuleOptions = {
    environment: Environment.DEV,
    logsDirPath: '/test/logs',
    debugMode: true,
  };

  beforeEach(() => {
    // Clear the singleton instance before each test
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (WinstonLogger as any)._instance = undefined;
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    let winstonMock: MockWinstonModule;

    beforeEach(() => {
      winstonMock = jest.requireMock<MockWinstonModule>('winston');
    });

    it('should create a singleton instance', () => {
      const instance1 = WinstonLogger.getInstance(mockOptions);
      const instance2 = WinstonLogger.getInstance(mockOptions);

      expect(instance1).toBe(instance2);
    });

    it('should create logger with development environment settings', () => {
      WinstonLogger.getInstance(mockOptions);

      expect(winstonMock.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          defaultMeta: {
            application: 'nest + typescript starter',
          },
        })
      );
    });

    it('should create logger with production environment settings', () => {
      WinstonLogger.getInstance({
        ...mockOptions,
        environment: Environment.PROD,
      });

      expect(winstonMock.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        })
      );
    });

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    it('should create silent transports in test environment', () => {
      WinstonLogger.getInstance({
        ...mockOptions,
        environment: Environment.TEST,
      });

      const consoleTransportCall =
        winstonMock.transports.Console.mock.calls[0][0];
      const fileTransportCalls = winstonMock.transports.File.mock.calls;

      expect(consoleTransportCall.silent).toBe(true);
      expect(fileTransportCalls[0][0].silent).toBe(true);
      expect(fileTransportCalls[1][0].silent).toBe(true);
    });
  });

  describe('logging methods', () => {
    let winstonMock: MockWinstonModule;
    let mockLoggerInstance: jest.Mocked<Partial<ILogger>>;

    beforeEach(() => {
      winstonMock = jest.requireMock<MockWinstonModule>('winston');
      mockLoggerInstance = winstonMock.createLogger() as jest.Mocked<
        Partial<ILogger>
      >;
      logger = WinstonLogger.getInstance(mockOptions);
    });

    it('should stringify non-string messages', () => {
      const obj = { test: 'value' };
      logger.info(obj);

      expect(mockLoggerInstance.info).toHaveBeenCalledWith(
        JSON.stringify(obj),
        []
      );
    });

    it('should pass through string messages', () => {
      const message = 'test message';
      logger.info(message);

      expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, []);
    });

    it('should handle optional parameters', () => {
      const message = 'test message';
      const params = [{ context: 'test' }];
      logger.info(message, ...params);

      expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, params);
    });

    describe('log levels', () => {
      const message = 'test message';

      it('should call log with info level', () => {
        logger.log(message);
        expect(mockLoggerInstance.log).toHaveBeenCalledWith(
          'info',
          message,
          []
        );
      });

      it('should call info', () => {
        logger.info(message);
        expect(mockLoggerInstance.info).toHaveBeenCalledWith(message, []);
      });

      it('should call debug', () => {
        logger.debug(message);
        expect(mockLoggerInstance.debug).toHaveBeenCalledWith(message, []);
      });

      it('should call error', () => {
        logger.error(message);
        expect(mockLoggerInstance.error).toHaveBeenCalledWith(message, []);
      });
    });
  });
});
