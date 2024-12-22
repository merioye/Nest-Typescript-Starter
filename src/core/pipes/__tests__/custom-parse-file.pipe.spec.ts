/* eslint-disable jest/no-jasmine-globals */
import internal from 'stream';
import { FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { CustomParseFilePipe } from '../custom-parse-file.pipe';

describe('CustomParseFilePipe', () => {
  let pipe: CustomParseFilePipe;

  // Helper function to create a mock file
  const createMockFile = (
    options: Partial<Express.Multer.File> = {}
  ): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    destination: '/tmp',
    filename: 'test-123.jpg',
    path: '/tmp/test-123.jpg',
    buffer: Buffer.from('test'),
    stream: null as unknown as internal.Readable,
    ...options,
  });

  describe('Single file validation', () => {
    describe('with file size validation', () => {
      beforeEach(() => {
        pipe = new CustomParseFilePipe('avatar', {
          fileIsRequired: true,
          validators: [new MaxFileSizeValidator({ maxSize: 2000 })],
        });
      });

      it('should pass validation for valid file size', async () => {
        const mockFile = createMockFile({ size: 1000 });
        const result = await pipe.transform(mockFile);
        expect(result).toEqual(mockFile);
      });

      it('should throw error for file exceeding max size', async () => {
        const mockFile = createMockFile({ size: 3000 });

        try {
          await pipe.transform(mockFile);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(RequestValidationError);
          expect((error as RequestValidationError).errors[0]?.field).toBe(
            'avatar'
          );
          expect(
            (error as RequestValidationError).errors[0]?.message
          ).toContain('expected size is less than 2000');
        }
      });
    });

    describe('with mime type validation', () => {
      beforeEach(() => {
        pipe = new CustomParseFilePipe('document', {
          fileIsRequired: true,
          validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
        });
      });

      it('should pass validation for valid mime type', async () => {
        const mockFile = createMockFile({ mimetype: 'application/pdf' });
        const result = await pipe.transform(mockFile);
        expect(result).toEqual(mockFile);
      });

      it('should throw error for invalid mime type', async () => {
        const mockFile = createMockFile({ mimetype: 'image/png' });

        try {
          await pipe.transform(mockFile);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(RequestValidationError);
          expect((error as RequestValidationError).errors[0]?.field).toBe(
            'document'
          );
          expect(
            (error as RequestValidationError).errors[0]?.message
          ).toContain('expected type is application/pdf');
        }
      });
    });

    describe('with required file validation', () => {
      beforeEach(() => {
        pipe = new CustomParseFilePipe('attachment', {
          fileIsRequired: true,
        });
      });

      it('should pass validation when file is provided', async () => {
        const mockFile = createMockFile();
        const result = await pipe.transform(mockFile);
        expect(result).toEqual(mockFile);
      });

      it('should throw error when file is undefined', async () => {
        try {
          await pipe.transform(undefined as unknown as Express.Multer.File);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(RequestValidationError);
          expect((error as RequestValidationError).errors[0]?.field).toBe(
            'attachment'
          );
          expect(
            (error as RequestValidationError).errors[0]?.message
          ).toContain('required');
        }
      });
    });
  });

  describe('Multiple files validation', () => {
    describe('with file size validation', () => {
      beforeEach(() => {
        pipe = new CustomParseFilePipe('photos', {
          fileIsRequired: true,
          validators: [new MaxFileSizeValidator({ maxSize: 2000 })],
        });
      });

      it('should pass validation for valid file sizes', async () => {
        const mockFiles = [
          createMockFile({ size: 1000 }),
          createMockFile({ size: 1500 }),
        ];
        const result = await pipe.transform(mockFiles);
        expect(result).toEqual(mockFiles);
      });

      it('should throw error if any file exceeds max size', async () => {
        const mockFiles = [
          createMockFile({ size: 1000 }),
          createMockFile({ size: 3000 }),
        ];

        try {
          await pipe.transform(mockFiles);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(RequestValidationError);
          expect((error as RequestValidationError).errors[0]?.field).toBe(
            'photos'
          );
          expect(
            (error as RequestValidationError).errors[0]?.message
          ).toContain('expected size is less than 2000');
        }
      });
    });

    describe('with optional file validation', () => {
      beforeEach(() => {
        pipe = new CustomParseFilePipe('files', {
          fileIsRequired: false,
        });
      });

      it('should pass validation when files array is empty', async () => {
        const result = await pipe.transform([]);
        expect(result).toEqual([]);
      });

      it('should pass validation when some files are provided', async () => {
        const mockFiles = [createMockFile(), createMockFile()];
        const result = await pipe.transform(mockFiles);
        expect(result).toEqual(mockFiles);
      });
    });

    describe('with mime type validation', () => {
      beforeEach(() => {
        pipe = new CustomParseFilePipe('documents', {
          fileIsRequired: true,
          validators: [
            new FileTypeValidator({
              fileType: /(application\/pdf|image\/jpeg)/,
            }),
          ],
        });
      });

      it('should pass validation for valid mime types', async () => {
        const mockFiles = [
          createMockFile({ mimetype: 'application/pdf' }),
          createMockFile({ mimetype: 'image/jpeg' }),
        ];
        const result = await pipe.transform(mockFiles);
        expect(result).toEqual(mockFiles);
      });

      it('should throw error for any invalid mime type', async () => {
        const mockFiles = [
          createMockFile({ mimetype: 'application/pdf' }),
          createMockFile({ mimetype: 'image/gif' }),
        ];

        try {
          await pipe.transform(mockFiles);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(RequestValidationError);
          expect((error as RequestValidationError).errors[0]?.field).toBe(
            'documents'
          );
          expect(
            (error as RequestValidationError).errors[0]?.message
          ).toContain('expected type is /(application\\/pdf|image\\/jpeg)/');
        }
      });
    });
  });
});
