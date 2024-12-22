// import { Module } from '@nestjs/common';
// import { Test } from '@nestjs/testing';

// import { LoggerModuleOptions } from '@/types';
// import { Environment } from '@/enums';

// import { LoggerToken } from '../constants';
// import { ILogger } from '../interfaces';
// import { LoggerModule } from '../logger.module';
// import { WinstonLogger } from '../loggers';

// jest.mock('../loggers/winston.logger');

// describe('LoggerModule', () => {
//   const mockOptions: LoggerModuleOptions = {
//     environment: Environment.TEST,
//     logsDirPath: '/test/logs',
//   };

//   let loggerInstance: ILogger;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     loggerInstance = {} as ILogger;
//     (WinstonLogger.getInstance as jest.Mock).mockReturnValue(loggerInstance);
//   });

//   describe('forRoot', () => {
//     it('should create a dynamic module with global scope', () => {
//       const module = LoggerModule.forRoot(mockOptions);

//       expect(module).toEqual({
//         global: true,
//         module: LoggerModule,
//         providers: [{ provide: LoggerToken, useValue: loggerInstance }],
//         exports: [LoggerToken],
//       });
//     });

//     it('should use WinstonLogger instance with provided options', () => {
//       LoggerModule.forRoot(mockOptions);

//       // eslint-disable-next-line @typescript-eslint/unbound-method
//       expect(WinstonLogger.getInstance).toHaveBeenCalledWith(mockOptions);
//     });

//     it('should create a module that can be imported', async () => {
//       const moduleRef = await Test.createTestingModule({
//         imports: [LoggerModule.forRoot(mockOptions)],
//       }).compile();

//       const logger = moduleRef.get<ILogger>(LoggerToken);
//       expect(logger).toBe(loggerInstance);
//     });

//     it('should provide logger globally to other modules', async () => {
//       // Create a test module that depends on the globally provided logger
//       @Module({})
//       class TestModule {}

//       const moduleRef = await Test.createTestingModule({
//         imports: [LoggerModule.forRoot(mockOptions), TestModule],
//       }).compile();

//       // We should be able to get the logger from any context
//       const logger = moduleRef.get<ILogger>(LoggerToken);
//       expect(logger).toBe(loggerInstance);

//       // Verify the module is marked as global
//       const module = LoggerModule.forRoot(mockOptions);
//       expect(module.global).toBe(true);
//     });
//   });
// });
