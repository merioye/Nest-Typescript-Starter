// import { PrismaClient } from '@prisma/client';
// import { Category, Comment, Post, Tag, User } from '@/types';
// import { Op_Symbol } from '../../../constants';
// import { FIND_OPERATOR } from '../../../enums';
// import { PrismaRepository } from '../../prisma.repository';

// describe('PrismaRepository - findOne method', () => {
//   let prisma: PrismaClient;
//   let userRepository: PrismaRepository<User>;
//   let postRepository: PrismaRepository<Post>;
//   let commentRepository: PrismaRepository<Comment>;
//   let categoryRepository: PrismaRepository<Category>;

//   beforeAll(async () => {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
//     prisma = new PrismaClient();
//     userRepository = new PrismaRepository<User>(prisma, 'user');
//     postRepository = new PrismaRepository<Post>(prisma, 'post');
//     commentRepository = new PrismaRepository<Comment>(prisma, 'comment');
//     categoryRepository = new PrismaRepository<Category>(prisma, 'category');

//     // Seed the database with test data
//     await seedDatabase();
//   });

//   afterAll(async () => {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
//     await prisma.$disconnect();
//   });

//   it('should find a user by id', async () => {
//     const user = await userRepository.findOne({ where: { id: 1 } });
//     expect(user).toBeDefined();
//     expect(user?.id).toBe(1);
//   });

//   it('should return null when user is not found', async () => {
//     const user = await userRepository.findOne({ where: { id: 9999 } });
//     expect(user).toBeNull();
//   });

//   it('should find a user with specific fields selected', async () => {
//     const user = await userRepository.findOne({
//       where: { id: 1 },
//       select: ['id', 'email', 'username'],
//     });
//     expect(user).toBeDefined();
//     expect(Object.keys(user!)).toEqual(['id', 'email', 'username']);
//   });

//   it('should find a user with relations', async () => {
//     const user = await userRepository.findOne({
//       where: { id: 1 },
//       relations: { profile: true, posts: true },
//     });
//     expect(user).toBeDefined();
//     expect(user?.profile).toBeDefined();
//     expect(Array.isArray(user?.posts)).toBe(true);
//   });

//   it('should find a user with nested relations', async () => {
//     const user = await userRepository.findOne({
//       where: { id: 1 },
//       relations: { profile: { address: true }, posts: { comments: true } },
//     });
//     expect(user).toBeDefined();
//     expect(user?.profile?.address).toBeDefined();
//     expect(user?.posts?.[0]?.comments).toBeDefined();
//   });

//   it('should find a user with custom order', async () => {
//     const user = await userRepository.findOne({
//       order: { createdAt: 'desc' },
//     });
//     expect(user).toBeDefined();
//     // Verify that this is indeed the most recently created user
//   });

//   it('should find a non-deleted user by default', async () => {
//     const user = await userRepository.findOne({ where: { id: 1 } });
//     expect(user).toBeDefined();
//     expect(user?.isDeleted).toBe(false);
//   });

//   it('should find a deleted user when withDeleted is true', async () => {
//     // Assuming user with id 2 is soft-deleted
//     const user = await userRepository.findOne({
//       where: { id: 2 },
//       withDeleted: true,
//     });
//     expect(user).toBeDefined();
//     expect(user?.isDeleted).toBe(true);
//   });

//   it('should not find a deleted user when withDeleted is false', async () => {
//     // Assuming user with id 2 is soft-deleted
//     const user = await userRepository.findOne({
//       where: { id: 2 },
//       withDeleted: false,
//     });
//     expect(user).toBeNull();
//   });

//   it('should find a user with complex where conditions', async () => {
//     const user = await userRepository.findOne({
//       where: {
//         [Op_Symbol]: {
//           [FIND_OPERATOR.AND]: [
//             { age: { [Op_Symbol]: { [FIND_OPERATOR.GTE]: 18 } } },
//             { age: { [Op_Symbol]: { [FIND_OPERATOR.LTE]: 30 } } },
//           ],
//         },
//         isActive: true,
//       },
//     });
//     expect(user).toBeDefined();
//     expect(user?.age).toBeGreaterThanOrEqual(18);
//     expect(user?.age).toBeLessThanOrEqual(30);
//     expect(user?.isActive).toBe(true);
//   });

//   it('should find a user with nested where conditions', async () => {
//     const user = await userRepository.findOne({
//       where: {
//         profile: {
//           address: {
//             city: 'New York',
//           },
//         },
//       },
//     });
//     expect(user).toBeDefined();
//     expect(user?.profile?.address?.city).toBe('New York');
//   });

//   it('should find a post with tag conditions', async () => {
//     const post = await postRepository.findOne({
//       where: {
//         tags: {
//           some: {
//             name: 'technology',
//           },
//         },
//       },
//       relations: { tags: true },
//     });
//     expect(post).toBeDefined();
//     expect(post?.tags.some((tag) => tag.name === 'technology')).toBe(true);
//   });

//   it('should find a comment with parent and replies', async () => {
//     const comment = await commentRepository.findOne({
//       where: {
//         parentId: { [Op_Symbol]: { [FIND_OPERATOR.NE]: null } },
//       },
//       relations: { parent: true, replies: true },
//     });
//     expect(comment).toBeDefined();
//     expect(comment?.parent).toBeDefined();
//     expect(Array.isArray(comment?.replies)).toBe(true);
//   });

//   it('should find a category with subcategories', async () => {
//     const category = await categoryRepository.findOne({
//       where: { parentCategoryId: null },
//       relations: { subCategories: true },
//     });
//     expect(category).toBeDefined();
//     expect(Array.isArray(category?.subCategories)).toBe(true);
//     expect(category?.subCategories.length).toBeGreaterThan(0);
//   });

//   it('should find a user with specific social links', async () => {
//     const user = await userRepository.findOne({
//       where: {
//         profile: {
//           socialLinks: {
//             path: ['twitter'],
//             equals: '@johndoe',
//           },
//         },
//       },
//       relations: { profile: true },
//     });
//     expect(user).toBeDefined();
//     expect(user?.profile?.socialLinks?.twitter).toBe('@johndoe');
//   });

//   it('should find a post with array contains condition', async () => {
//     const post = await postRepository.findOne({
//       where: {
//         tags: {
//           [Op_Symbol]: {
//             [FIND_OPERATOR.ARRAY_CONTAINS]: { name: 'technology' },
//           },
//         },
//       },
//       relations: { tags: true },
//     });
//     expect(post).toBeDefined();
//     expect(post?.tags.some((tag) => tag.name === 'technology')).toBe(true);
//   });

//   it('should find a user with case-insensitive like condition', async () => {
//     const user = await userRepository.findOne({
//       where: {
//         email: {
//           [Op_Symbol]: {
//             [FIND_OPERATOR.ILIKE]: '%@example.com',
//           },
//         },
//       },
//     });
//     expect(user).toBeDefined();
//     expect(user?.email.toLowerCase()).toContain('@example.com');
//   });

//   it('should find a post within a date range', async () => {
//     const startDate = new Date('2023-01-01');
//     const endDate = new Date('2023-12-31');
//     const post = await postRepository.findOne({
//       where: {
//         createdAt: {
//           [Op_Symbol]: {
//             [FIND_OPERATOR.BETWEEN]: [startDate, endDate],
//           },
//         },
//       },
//     });
//     expect(post).toBeDefined();
//     expect(post?.createdAt).toBeGreaterThanOrEqual(startDate);
//     expect(post?.createdAt).toBeLessThanOrEqual(endDate);
//   });

//   it('should find a user with a null field', async () => {
//     const user = await userRepository.findOne({
//       where: {
//         lastLoginAt: {
//           [Op_Symbol]: {
//             [FIND_OPERATOR.ISNULL]: null,
//           },
//         },
//       },
//     });
//     expect(user).toBeDefined();
//     expect(user?.lastLoginAt).toBeNull();
//   });

//   // Add more tests for other edge cases and scenarios...
// });
