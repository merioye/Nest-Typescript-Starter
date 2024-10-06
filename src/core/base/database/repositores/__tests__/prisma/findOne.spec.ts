// import { PrismaClient } from '@prisma/client';
// import {
//   Address,
//   Book,
//   Category,
//   Comment,
//   Follow,
//   Genre,
//   Like,
//   Post,
//   Profile,
//   Role,
//   Tag,
//   User,
// } from '@/types';
// import { Op_Symbol } from '../../../constants';
// import { FIND_OPERATOR } from '../../../enums';
// import { FindOneOptions } from '../../../types';
// import { PrismaRepository } from '../../prisma.repository';

// describe('PrismaRepository - findOne method', () => {
//   let prisma: PrismaClient;
//   let userRepository: PrismaRepository<User>;

//   beforeAll(async () => {
//     prisma = new PrismaClient();
//     userRepository = new PrismaRepository<User>(prisma, 'user');

//     // Setup: Create test data
//     await prisma.user.createMany({
//       data: [
//         {
//           id: 1,
//           email: 'user1@example.com',
//           username: 'user1',
//           password: 'password1',
//           age: 25,
//           isActive: true,
//           role: 'USER',
//         },
//         {
//           id: 2,
//           email: 'user2@example.com',
//           username: 'user2',
//           password: 'password2',
//           age: 30,
//           isActive: false,
//           role: 'ADMIN',
//         },
//         {
//           id: 3,
//           email: 'user3@example.com',
//           username: 'user3',
//           password: 'password3',
//           age: 35,
//           isActive: true,
//           role: 'MODERATOR',
//         },
//       ],
//     });

//     await prisma.profile.create({
//       data: {
//         userId: 1,
//         bio: 'Test bio',
//         website: 'https://example.com',
//         address: {
//           create: {
//             street: '123 Test St',
//             city: 'Test City',
//             state: 'Test State',
//             country: 'Test Country',
//             zipCode: '12345',
//           },
//         },
//       },
//     });

//     await prisma.post.create({
//       data: {
//         title: 'Test Post',
//         content: 'Test Content',
//         authorId: 1,
//         categoryId: 1,
//         published: true,
//         comments: {
//           create: [
//             { content: 'Test Comment 1', authorId: 2 },
//             { content: 'Test Comment 2', authorId: 3 },
//           ],
//         },
//         tags: {
//           create: [{ name: 'TestTag1' }, { name: 'TestTag2' }],
//         },
//       },
//     });
//   });

//   afterAll(async () => {
//     await prisma.comment.deleteMany();
//     await prisma.post.deleteMany();
//     await prisma.tag.deleteMany();
//     await prisma.address.deleteMany();
//     await prisma.profile.deleteMany();
//     await prisma.user.deleteMany();
//     await prisma.$disconnect();
//   });

//   it('should find a user by id', async () => {
//     const result = await userRepository.findOne({ where: { id: 1 } });
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(1);
//     expect(result?.email).toBe('user1@example.com');
//   });

//   it('should return null when user is not found', async () => {
//     const result = await userRepository.findOne({ where: { id: 999 } });
//     expect(result).toBeNull();
//   });

//   it('should find a user using complex where conditions', async () => {
//     const options: FindOneOptions<any> = {
//       where: {
//         [Op_Symbol]: {
//           [FIND_OPERATOR.AND]: [
//             { age: { [Op_Symbol]: { [FIND_OPERATOR.GTE]: 30 } } },
//             { isActive: true },
//           ],
//         },
//       },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(3);
//     expect(result?.age).toBe(35);
//     expect(result?.isActive).toBe(true);
//   });

//   it('should support nested where conditions', async () => {
//     const options: FindOneOptions<any> = {
//       where: {
//         profile: {
//           bio: { [Op_Symbol]: { [FIND_OPERATOR.LIKE]: '%Test%' } },
//         },
//       },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(1);
//   });

//   it('should support select option', async () => {
//     const options: FindOneOptions<any> = {
//       where: { id: 1 },
//       select: ['id', 'email', 'username'],
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result).toHaveProperty('id');
//     expect(result).toHaveProperty('email');
//     expect(result).toHaveProperty('username');
//     expect(result).not.toHaveProperty('password');
//     expect(result).not.toHaveProperty('age');
//   });

//   it('should support nested select option', async () => {
//     const options: FindOneOptions<any> = {
//       where: { id: 1 },
//       select: ['id', 'email', { profile: ['bio', 'website'] }],
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result).toHaveProperty('id');
//     expect(result).toHaveProperty('email');
//     expect(result).toHaveProperty('profile');
//     expect(result?.profile).toHaveProperty('bio');
//     expect(result?.profile).toHaveProperty('website');
//     expect(result?.profile).not.toHaveProperty('avatarUrl');
//   });

//   it('should support relations option', async () => {
//     const options: FindOneOptions<any> = {
//       where: { id: 1 },
//       relations: { profile: true, posts: true },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result).toHaveProperty('profile');
//     expect(result).toHaveProperty('posts');
//     expect(Array.isArray(result?.posts)).toBe(true);
//   });

//   it('should support nested relations option', async () => {
//     const options: FindOneOptions<any> = {
//       where: { id: 1 },
//       relations: {
//         profile: { address: true },
//         posts: { comments: true, tags: true },
//       },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result?.profile).toHaveProperty('address');
//     expect(result?.posts[0]).toHaveProperty('comments');
//     expect(result?.posts[0]).toHaveProperty('tags');
//     expect(Array.isArray(result?.posts[0].comments)).toBe(true);
//     expect(Array.isArray(result?.posts[0].tags)).toBe(true);
//   });

//   it('should support order option', async () => {
//     const options: FindOneOptions<any> = {
//       order: { age: 'desc' },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(3);
//     expect(result?.age).toBe(35);
//   });

//   it('should support multiple order criteria', async () => {
//     const options: FindOneOptions<any> = {
//       order: { isActive: 'desc', age: 'asc' },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(1);
//     expect(result?.isActive).toBe(true);
//     expect(result?.age).toBe(25);
//   });

//   it('should support withDeleted option', async () => {
//     // First, soft delete a user
//     await prisma.user.update({ where: { id: 2 }, data: { isDeleted: true } });

//     // Try to find the soft-deleted user without withDeleted option
//     let result = await userRepository.findOne({ where: { id: 2 } });
//     expect(result).toBeNull();

//     // Try to find the soft-deleted user with withDeleted option
//     result = await userRepository.findOne({
//       where: { id: 2 },
//       withDeleted: true,
//     });
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(2);
//     expect(result?.isDeleted).toBe(true);

//     // Restore the user
//     await prisma.user.update({ where: { id: 2 }, data: { isDeleted: false } });
//   });

//   it('should support custom softDeleteColumnName option', async () => {
//     // First, soft delete a user using a custom column
//     await prisma.user.update({ where: { id: 2 }, data: { isActive: false } });

//     // Try to find the soft-deleted user with custom softDeleteColumnName
//     const result = await userRepository.findOne({
//       where: { id: 2 },
//       withDeleted: true,
//       softDeleteColumnName: 'isActive',
//     });
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(2);
//     expect(result?.isActive).toBe(false);

//     // Restore the user
//     await prisma.user.update({ where: { id: 2 }, data: { isActive: true } });
//   });

//   it('should throw an error for invalid model name', async () => {
//     const invalidRepository = new PrismaRepository<any>(prisma, 'invalidModel');
//     await expect(
//       invalidRepository.findOne({ where: { id: 1 } })
//     ).rejects.toThrow('Invalid model name: invalidModel');
//   });

//   it('should handle empty options', async () => {
//     const result = await userRepository.findOne();
//     expect(result).toBeDefined();
//     expect(result).toHaveProperty('id');
//   });

//   it('should handle all supported FIND_OPERATOR types', async () => {
//     const options: FindOneOptions<any> = {
//       where: {
//         [Op_Symbol]: {
//           [FIND_OPERATOR.OR]: [
//             { age: { [Op_Symbol]: { [FIND_OPERATOR.LT]: 30 } } },
//             { age: { [Op_Symbol]: { [FIND_OPERATOR.GT]: 30 } } },
//           ],
//           [FIND_OPERATOR.AND]: [
//             { isActive: true },
//             { role: { [Op_Symbol]: { [FIND_OPERATOR.NE]: 'ADMIN' } } },
//           ],
//           [FIND_OPERATOR.NOT]: { username: 'user2' },
//         },
//       },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(3);
//   });

//   // Add more tests for other FIND_OPERATOR types as needed

//   it('should handle complex nested conditions', async () => {
//     const options: FindOneOptions<any> = {
//       where: {
//         [Op_Symbol]: {
//           [FIND_OPERATOR.AND]: [
//             {
//               [Op_Symbol]: {
//                 [FIND_OPERATOR.OR]: [
//                   { age: { [Op_Symbol]: { [FIND_OPERATOR.LTE]: 25 } } },
//                   { age: { [Op_Symbol]: { [FIND_OPERATOR.GTE]: 35 } } },
//                 ],
//               },
//             },
//             {
//               [Op_Symbol]: {
//                 [FIND_OPERATOR.AND]: [
//                   { isActive: true },
//                   { role: { [Op_Symbol]: { [FIND_OPERATOR.NE]: 'ADMIN' } } },
//                 ],
//               },
//             },
//           ],
//         },
//       },
//     };
//     const result = await userRepository.findOne(options);
//     expect(result).toBeDefined();
//     expect(result?.id).toBe(3);
//   });
// });
