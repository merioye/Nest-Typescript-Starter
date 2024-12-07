/* eslint-disable jest/no-conditional-expect */
import { prismaClient } from '@/database/clients/prisma';
import { PrismaClient } from '@prisma/client';

import { Book, Category, Genre, Post, Role, User } from '@/types';

import { PrismaRepository } from '../../prisma.repository';
import { clearDatabase } from './seed';

describe('PrismaRepository - Transaction Tests', () => {
  let prisma: PrismaClient;
  let userRepository: PrismaRepository<User>;
  let postRepository: PrismaRepository<Post>;
  let bookRepository: PrismaRepository<Book>;
  let categoryRepository: PrismaRepository<Category>;
  let genreRepository: PrismaRepository<Genre>;

  beforeAll(() => {
    prisma = prismaClient;
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
    userRepository = new PrismaRepository<User>(prisma, 'user');
    postRepository = new PrismaRepository<Post>(prisma, 'post');
    bookRepository = new PrismaRepository<Book>(prisma, 'book');
    categoryRepository = new PrismaRepository<Category>(prisma, 'category');
    genreRepository = new PrismaRepository<Genre>(prisma, 'genre');
  });

  afterAll(async () => {
    await clearDatabase(prisma);
  });

  describe('Transaction Management', () => {
    it('should successfully commit a transaction with multiple operations', async () => {
      const userData = {
        email: 'john@example.com',
        username: 'johndoe',
        password: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.USER,
      };

      const transaction = await userRepository.beginTransaction();
      try {
        // Create category first
        const category = await categoryRepository.insertOne({
          name: 'Test Category',
          description: 'Test Category Description',
        });

        // Create genre first
        const genre = await genreRepository.insertOne({
          name: 'Test Genre',
          description: 'Test Genre Description',
        });

        const user = await userRepository.insertOne(userData);

        const postData = {
          title: 'Test Post',
          content: 'Test Content',
          authorId: user.id,
          categoryId: category.id,
          published: true,
        };
        const post = await postRepository.insertOne(postData);

        const bookData = {
          title: 'Test Book',
          description: 'Test Description',
          price: 29.99,
          publishDate: new Date(),
          authorId: user.id,
          genreId: genre.id,
        };
        const book = await bookRepository.insertOne(bookData);

        await transaction.commit();

        // Verify data persisted
        const savedUser = await userRepository.findOne({
          where: { id: user.id },
        });
        const savedPost = await postRepository.findOne({
          where: { id: post.id },
        });
        const savedBook = await bookRepository.findOne({
          where: { id: book.id },
        });

        expect(savedUser).toBeDefined();
        expect(savedPost).toBeDefined();
        expect(savedBook).toBeDefined();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });

    it('should successfully rollback a transaction on error', async () => {
      const userData = {
        email: 'john@example.com',
        username: 'johndoe',
        password: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.USER,
      };

      const transaction = await userRepository.beginTransaction();
      try {
        await userRepository.insertOne(userData);
        await postRepository.insertOne({ title: undefined }); // This should fail
        await transaction.commit();
        expect(true).toBe(false); // This line should never be reached
      } catch (error) {
        await transaction.rollback();

        // Verify no data was persisted
        const users = await userRepository.findMany({});
        expect(users.length).toBe(0);
      }
    });

    it('should handle concurrent transactions independently', async () => {
      const transaction1 = await userRepository.beginTransaction();
      const transaction2 = await postRepository.beginTransaction();

      try {
        // Create category first transaction
        const category = await categoryRepository.insertOne({
          name: 'Test Category',
          description: 'Test Category Description',
        });

        const user = await userRepository.insertOne({
          email: 'user1@example.com',
          username: 'user1',
          password: 'hashedpassword',
          firstName: 'User',
          lastName: 'One',
          role: Role.USER,
        });

        const post = await postRepository.insertOne({
          title: 'Post 1',
          content: 'Content 1',
          authorId: user.id,
          categoryId: category.id,
          published: true,
        });

        await transaction1.commit();
        await transaction2.commit();

        // Verify both operations succeeded
        const savedUser = await userRepository.findOne({
          where: { id: user.id },
        });
        const savedPost = await postRepository.findOne({
          where: { id: post.id },
        });

        expect(savedUser).toBeDefined();
        expect(savedPost).toBeDefined();
      } catch (error) {
        await transaction1.rollback();
        await transaction2.rollback();
        throw error;
      }
    });

    it('should handle nested operations within transaction', async () => {
      const transaction = await userRepository.beginTransaction();
      try {
        // Create category and genre first
        const category = await categoryRepository.insertOne({
          name: 'Test Category',
          description: 'Test Category Description',
        });

        const genre = await genreRepository.insertOne({
          name: 'Test Genre',
          description: 'Test Genre Description',
        });

        const user = await userRepository.insertOne({
          email: 'parent@example.com',
          username: 'parentuser',
          password: 'hashedpassword',
          firstName: 'Parent',
          lastName: 'User',
          role: Role.USER,
        });

        // Create multiple related records
        await Promise.all([
          postRepository.insertOne({
            title: 'Post 1',
            content: 'Content 1',
            authorId: user.id,
            categoryId: category.id,
            published: true,
          }),
          postRepository.insertOne({
            title: 'Post 2',
            content: 'Content 2',
            authorId: user.id,
            categoryId: category.id,
            published: true,
          }),
        ]);

        await Promise.all([
          bookRepository.insertOne({
            title: 'Book 1',
            description: 'Description 1',
            price: 19.99,
            publishDate: new Date(),
            authorId: user.id,
            genreId: genre.id,
          }),
          bookRepository.insertOne({
            title: 'Book 2',
            description: 'Description 2',
            price: 29.99,
            publishDate: new Date(),
            authorId: user.id,
            genreId: genre.id,
          }),
        ]);

        await transaction.commit();

        // Verify all related records were created
        const savedUser = await userRepository.findOne({
          where: { id: user.id },
          relations: {
            posts: true,
            authoredBooks: true,
          },
        });

        expect(savedUser?.posts.length).toBe(2);
        expect(savedUser?.authoredBooks.length).toBe(2);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });

    it('should throw error when trying to start a transaction while another is active', async () => {
      const transaction1 = await userRepository.beginTransaction();

      await expect(userRepository.beginTransaction()).rejects.toThrow(
        'A transaction is already in progress'
      );

      await transaction1.rollback();
    });

    it('should throw error when trying to commit a mismatched transaction', async () => {
      const transaction1 = await userRepository.beginTransaction();
      const transaction2 = await postRepository.beginTransaction();

      await expect(
        userRepository.commitTransaction(transaction2)
      ).rejects.toThrow('Transaction mismatch');

      await transaction1.rollback();
      await transaction2.rollback();
    });

    it('should throw error when trying to rollback a mismatched transaction', async () => {
      const transaction1 = await userRepository.beginTransaction();
      const transaction2 = await postRepository.beginTransaction();

      await expect(
        userRepository.rollbackTransaction(transaction2)
      ).rejects.toThrow('Transaction mismatch');

      await transaction1.rollback();
      await transaction2.rollback();
    });

    it('should throw error when trying to use completed transaction', async () => {
      const transaction = await userRepository.beginTransaction();
      await transaction.commit();

      const userData = {
        email: 'john@example.com',
        username: 'johndoe',
        password: 'hashedpassword',
      };
      await expect(userRepository.insertOne(userData)).rejects.toThrow();
    });
  });
});
