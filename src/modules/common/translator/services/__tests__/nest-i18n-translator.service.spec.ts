// import { I18nContext, I18nService } from 'nestjs-i18n';

// import {
//   ITranslationKeyFormatterService,
//   ITranslatorService,
// } from '../../interfaces';
// import { NestI18nTranslatorService } from '../nest-i18n-translator.service';

// jest.mock('nestjs-i18n', () => ({
//   I18nService: jest.fn(),
//   I18nContext: {
//     current: jest.fn(),
//   },
// }));

// describe('NestI18nTranslatorService', () => {
//   let service: ITranslatorService;
//   let i18nService: jest.Mocked<I18nService>;
//   let formatterService: jest.Mocked<ITranslationKeyFormatterService>;

//   const translationsFileName = 'messages.json';
//   const defaultLang = 'en';

//   beforeEach(() => {
//     i18nService = {
//       translate: jest.fn(),
//     } as unknown as jest.Mocked<I18nService>;

//     formatterService = {
//       format: jest.fn(),
//     } as jest.Mocked<ITranslationKeyFormatterService>;

//     (I18nContext.current as jest.Mock).mockReturnValue({ lang: defaultLang });

//     service = new NestI18nTranslatorService(
//       formatterService,
//       i18nService,
//       translationsFileName
//     );
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('t', () => {
//     const testKey = 'test.key';
//     const testArgs = { name: 'John' };
//     const expectedTranslation = 'Hello John';

//     beforeEach(() => {
//       formatterService.format.mockReturnValue({
//         key: testKey,
//         args: testArgs,
//       });
//       i18nService.translate.mockReturnValue(expectedTranslation);
//     });

//     it('should translate with default language from context', () => {
//       const result = service.t(testKey);

//       expect(formatterService.format).toHaveBeenCalledWith(testKey);
//       expect(i18nService.translate).toHaveBeenCalledWith('messages.test.key', {
//         lang: defaultLang,
//         args: testArgs,
//       });
//       expect(result).toBe(expectedTranslation);
//     });

//     it('should translate with provided language', () => {
//       const customLang = 'fr';
//       const result = service.t(testKey, customLang);

//       expect(formatterService.format).toHaveBeenCalledWith(testKey);
//       expect(i18nService.translate).toHaveBeenCalledWith('messages.test.key', {
//         lang: customLang,
//         args: testArgs,
//       });
//       expect(result).toBe(expectedTranslation);
//     });

//     it('should handle empty translation file name', () => {
//       service = new NestI18nTranslatorService(
//         formatterService,
//         i18nService,
//         ''
//       );

//       const result = service.t(testKey);

//       expect(formatterService.format).toHaveBeenCalledWith(testKey);
//       expect(i18nService.translate).toHaveBeenCalledWith(testKey, {
//         lang: defaultLang,
//         args: testArgs,
//       });
//       expect(result).toBe(expectedTranslation);
//     });

//     it('should handle undefined I18nContext', () => {
//       (I18nContext.current as jest.Mock).mockReturnValue(undefined);
//       const result = service.t(testKey);

//       expect(formatterService.format).toHaveBeenCalledWith(testKey);
//       expect(i18nService.translate).toHaveBeenCalledWith('messages.test.key', {
//         lang: undefined,
//         args: testArgs,
//       });
//       expect(result).toBe(expectedTranslation);
//     });

//     it('should handle translation file name with extension', () => {
//       service = new NestI18nTranslatorService(
//         formatterService,
//         i18nService,
//         'messages.json'
//       );

//       const result = service.t(testKey);

//       expect(formatterService.format).toHaveBeenCalledWith(testKey);
//       expect(i18nService.translate).toHaveBeenCalledWith('messages.test.key', {
//         lang: defaultLang,
//         args: testArgs,
//       });
//       expect(result).toBe(expectedTranslation);
//     });

//     it('should handle no translation args', () => {
//       formatterService.format.mockReturnValue({
//         key: testKey,
//         args: undefined,
//       });

//       const result = service.t(testKey);

//       expect(formatterService.format).toHaveBeenCalledWith(testKey);
//       expect(i18nService.translate).toHaveBeenCalledWith('messages.test.key', {
//         lang: defaultLang,
//         args: undefined,
//       });
//       expect(result).toBe(expectedTranslation);
//     });
//   });
// });
