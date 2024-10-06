// /* eslint-disable no-console */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import {
//   Address,
//   Book,
//   Category,
//   Comment,
//   Follow,
//   Genre,
//   Like,
//   Post,
//   PrismaClient,
//   Profile,
//   Tag,
//   User,
// } from '@prisma/client';

// const prisma = new PrismaClient();

// // Helper function to generate random date within the last 2 years
// const randomDate = (): Date => {
//   const start = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
//   const end = new Date();
//   return new Date(
//     start.getTime() + Math.random() * (end.getTime() - start.getTime())
//   );
// };

// // Seed Users
// async function seedUsers(count = 20): Promise<User[]> {
//   const users = [];
//   for (let i = 1; i <= count; i++) {
//     const user = await prisma.user.create({
//       data: {
//         email: `user${i}@example.com`,
//         username: `user${i}`,
//         password: `hashedpassword${i}`,
//         firstName: `FirstName${i}`,
//         lastName: `LastName${i}`,
//         age: 20 + i,
//         role: i % 10 === 0 ? 'ADMIN' : i % 5 === 0 ? 'MODERATOR' : 'USER',
//         createdAt: randomDate(),
//         updatedAt: randomDate(),
//         lastLoginAt: randomDate(),
//       },
//     });
//     users.push(user);
//   }
//   console.log(`Created ${users.length} users`);
//   return users;
// }

// // Seed Profiles
// async function seedProfiles(users: User[]): Promise<Profile[]> {
//   const profiles = [];
//   for (const user of users) {
//     const profile = await prisma.profile.create({
//       data: {
//         bio: `Bio for ${user.username}`,
//         website: `https://${user.username}.com`,
//         avatarUrl: `https://example.com/avatar/${user.id}.jpg`,
//         socialLinks: { twitter: `@${user.username}`, github: user.username },
//         userId: user.id,
//       },
//     });
//     profiles.push(profile);
//   }
//   console.log(`Created ${profiles.length} profiles`);
//   return profiles;
// }

// // Seed Addresses
// async function seedAddresses(profiles: Profile[]): Promise<Address[]> {
//   const addresses = [];
//   for (let i = 0; i < profiles.length; i++) {
//     const address = await prisma.address.create({
//       data: {
//         street: `${i + 1} Main St`,
//         city: `City${i + 1}`,
//         state: `State${i + 1}`,
//         country: 'Country',
//         zipCode: `${10000 + i}`,
//         profileId: profiles[i].id,
//       },
//     });
//     addresses.push(address);
//   }
//   console.log(`Created ${addresses.length} addresses`);
//   return addresses;
// }

// // Seed Categories
// async function seedCategories(): Promise<Category[]> {
//   const categoryNames = [
//     'Technology',
//     'Travel',
//     'Food',
//     'Sports',
//     'Health',
//     'Fashion',
//     'Music',
//     'Art',
//     'Science',
//     'Business',
//     'Education',
//     'Entertainment',
//     'Politics',
//     'Environment',
//     'Lifestyle',
//   ];
//   const categories = [];
//   for (const name of categoryNames) {
//     const category = await prisma.category.create({
//       data: {
//         name,
//         description: `All about ${name.toLowerCase()}`,
//       },
//     });
//     categories.push(category);
//   }
//   console.log(`Created ${categories.length} categories`);
//   return categories;
// }

// // Seed Posts
// async function seedPosts(
//   users: User[],
//   categories: Category[],
//   count = 20
// ): Promise<Post[]> {
//   const posts = [];
//   for (let i = 1; i <= count; i++) {
//     const post = await prisma.post.create({
//       data: {
//         title: `Post Title ${i}`,
//         content: `This is the content for post ${i}. It's a very interesting post about various topics.`,
//         published: Math.random() > 0.2,
//         createdAt: randomDate(),
//         updatedAt: randomDate(),
//         authorId: users[Math.floor(Math.random() * users.length)].id,
//         categoryId:
//           categories[Math.floor(Math.random() * categories.length)].id,
//       },
//     });
//     posts.push(post);
//   }
//   console.log(`Created ${posts.length} posts`);
//   return posts;
// }

// // Seed Comments
// async function seedComments(
//   users: User[],
//   posts: Post[],
//   count = 20
// ): Promise<Comment[]> {
//   const comments = [];
//   for (let i = 1; i <= count; i++) {
//     const comment = await prisma.comment.create({
//       data: {
//         content: `This is comment ${i}. Very insightful!`,
//         createdAt: randomDate(),
//         updatedAt: randomDate(),
//         authorId: users[Math.floor(Math.random() * users.length)].id,
//         postId: posts[Math.floor(Math.random() * posts.length)].id,
//       },
//     });
//     comments.push(comment);
//   }
//   console.log(`Created ${comments.length} comments`);
//   return comments;
// }

// // Seed Likes
// async function seedLikes(
//   users: User[],
//   posts: Post[],
//   count = 20
// ): Promise<Like[]> {
//   const likes = [];
//   for (let i = 1; i <= count; i++) {
//     const like = await prisma.like.create({
//       data: {
//         createdAt: randomDate(),
//         userId: users[Math.floor(Math.random() * users.length)].id,
//         postId: posts[Math.floor(Math.random() * posts.length)].id,
//       },
//     });
//     likes.push(like);
//   }
//   console.log(`Created ${likes.length} likes`);
//   return likes;
// }

// // Seed Follows
// async function seedFollows(users: User[], count = 20): Promise<Follow[]> {
//   const follows = [];
//   for (let i = 1; i <= count; i++) {
//     const [followerId, followingId] = users
//       .map((user) => user.id)
//       .sort(() => 0.5 - Math.random())
//       .slice(0, 2);

//     const follow = await prisma.follow.create({
//       data: {
//         followerId,
//         followingId,
//         createdAt: randomDate(),
//       },
//     });
//     follows.push(follow);
//   }
//   console.log(`Created ${follows.length} follows`);
//   return follows;
// }

// // Seed Tags
// async function seedTags(): Promise<Tag[]> {
//   const tagNames = [
//     'programming',
//     'travel',
//     'food',
//     'sports',
//     'health',
//     'fashion',
//     'music',
//     'art',
//     'science',
//     'business',
//     'education',
//     'entertainment',
//     'politics',
//     'environment',
//     'lifestyle',
//   ];
//   const tags = [];
//   for (const name of tagNames) {
//     const tag = await prisma.tag.create({
//       data: { name },
//     });
//     tags.push(tag);
//   }
//   console.log(`Created ${tags.length} tags`);
//   return tags;
// }

// // Seed Genres
// async function seedGenres(): Promise<Genre[]> {
//   const genreNames = [
//     'Science Fiction',
//     'Mystery',
//     'Romance',
//     'Thriller',
//     'Fantasy',
//     'Horror',
//     'Adventure',
//     'Historical Fiction',
//     'Biography',
//     'Self-Help',
//     'Cookbook',
//     'Poetry',
//     'Drama',
//     'Comedy',
//     "Children's",
//   ];
//   const genres = [];
//   for (const name of genreNames) {
//     const genre = await prisma.genre.create({
//       data: {
//         name,
//         description: `Books in the ${name} genre`,
//       },
//     });
//     genres.push(genre);
//   }
//   console.log(`Created ${genres.length} genres`);
//   return genres;
// }

// // Seed Books
// async function seedBooks(
//   users: User[],
//   genres: Genre[],
//   count = 20
// ): Promise<Book[]> {
//   const books = [];
//   for (let i = 1; i <= count; i++) {
//     const book = await prisma.book.create({
//       data: {
//         title: `Book Title ${i}`,
//         description: `This is a great book about topic ${i}. You'll love reading it!`,
//         price: parseFloat((9.99 + i).toFixed(2)),
//         publishDate: randomDate(),
//         authorId: users[Math.floor(Math.random() * users.length)].id,
//         genreId: genres[Math.floor(Math.random() * genres.length)].id,
//       },
//     });
//     books.push(book);
//   }
//   console.log(`Created ${books.length} books`);
//   return books;
// }

// // Main seeding function
// async function main(): Promise<void> {
//   const users = await seedUsers();
//   const profiles = await seedProfiles(users);
//   await seedAddresses(profiles);
//   const categories = await seedCategories();
//   const posts = await seedPosts(users, categories);
//   await seedComments(users, posts);
//   await seedLikes(users, posts);
//   await seedFollows(users);
//   await seedTags();
//   const genres = await seedGenres();
//   await seedBooks(users, genres);

//   console.log('Seed data creation completed successfully');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async (): void => {
//     await prisma.$disconnect();
//   });
