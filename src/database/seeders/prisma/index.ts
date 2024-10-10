/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { faker } from '@faker-js/faker';
import {
  Address,
  Book,
  Category,
  Comment,
  Follow,
  Genre,
  Like,
  Post,
  PrismaClient,
  Profile,
  Tag,
  User,
} from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate random date within the last 2 years
const randomDate = (): Date => {
  return faker.date.past({ years: 2 });
};

// Seed Users
async function seedUsers(count = 20): Promise<User[]> {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }),
        username: faker.internet.userName({ firstName, lastName }),
        password: faker.internet.password(),
        firstName,
        lastName,
        age: faker.number.int({ min: 18, max: 80 }),
        role: i % 10 === 0 ? 'ADMIN' : i % 5 === 0 ? 'MODERATOR' : 'USER',
        createdAt: randomDate(),
        updatedAt: randomDate(),
        lastLoginAt: randomDate(),
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users`);
  return users;
}

// Seed Profiles
async function seedProfiles(users: User[]): Promise<Profile[]> {
  const profiles = [];
  for (const user of users) {
    const profile = await prisma.profile.create({
      data: {
        bio: faker.lorem.paragraph(),
        website: faker.internet.url(),
        avatarUrl: faker.image.avatar(),
        socialLinks: {
          twitter: `@${faker.internet.userName()}`,
          github: faker.internet.userName(),
          linkedin: faker.internet.userName(),
        },
        userId: user.id,
      },
    });
    profiles.push(profile);
  }
  console.log(`Created ${profiles.length} profiles`);
  return profiles;
}

// Seed Addresses
async function seedAddresses(profiles: Profile[]): Promise<Address[]> {
  const addresses = [];
  for (const profile of profiles) {
    const address = await prisma.address.create({
      data: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode(),
        profileId: profile.id,
      },
    });
    addresses.push(address);
  }
  console.log(`Created ${addresses.length} addresses`);
  return addresses;
}

// Seed Categories
async function seedCategories(): Promise<Category[]> {
  const categoryNames = [
    'Technology',
    'Travel',
    'Food',
    'Sports',
    'Health',
    'Fashion',
    'Music',
    'Art',
    'Science',
    'Business',
    'Education',
    'Entertainment',
    'Politics',
    'Environment',
    'Lifestyle',
  ];
  const categories = [];
  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: {
        name,
        description: faker.lorem.sentence(),
      },
    });
    categories.push(category);
  }
  console.log(`Created ${categories.length} categories`);
  return categories;
}

// Seed Posts
async function seedPosts(
  users: User[],
  categories: Category[],
  count = 50
): Promise<Post[]> {
  const posts = [];
  for (let i = 1; i <= count; i++) {
    const post = await prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        published: faker.datatype.boolean(),
        createdAt: randomDate(),
        updatedAt: randomDate(),
        authorId: faker.helpers.arrayElement(users).id,
        categoryId: faker.helpers.arrayElement(categories).id,
      },
    });
    posts.push(post);
  }
  console.log(`Created ${posts.length} posts`);
  return posts;
}

// Seed Comments
async function seedComments(
  users: User[],
  posts: Post[],
  count = 100
): Promise<Comment[]> {
  const comments = [];
  for (let i = 1; i <= count; i++) {
    const comment = await prisma.comment.create({
      data: {
        content: faker.lorem.paragraph(),
        createdAt: randomDate(),
        updatedAt: randomDate(),
        authorId: faker.helpers.arrayElement(users).id,
        postId: faker.helpers.arrayElement(posts).id,
      },
    });
    comments.push(comment);
  }
  console.log(`Created ${comments.length} comments`);
  return comments;
}

// Seed Likes
async function seedLikes(
  users: User[],
  posts: Post[],
  count = 200
): Promise<Like[]> {
  const likes = [];
  const likeSet = new Set<string>();

  while (likes.length < count) {
    const userId = faker.helpers.arrayElement(users).id;
    const postId = faker.helpers.arrayElement(posts).id;
    const likeKey = `${userId}-${postId}`;

    if (!likeSet.has(likeKey)) {
      try {
        const like = await prisma.like.create({
          data: {
            createdAt: randomDate(),
            userId: userId,
            postId: postId,
          },
        });
        likes.push(like);
        likeSet.add(likeKey);
      } catch (error) {
        console.log(`Skipping duplicate like: ${likeKey}`);
      }
    }
  }

  console.log(`Created ${likes.length} unique likes`);
  return likes;
}

// Seed Follows
async function seedFollows(users: User[], count = 50): Promise<Follow[]> {
  const follows = [];
  const followSet = new Set<string>();

  while (follows.length < count) {
    const [follower, following] = faker.helpers.arrayElements(users, 2);
    const followKey = `${follower?.id}-${following?.id}`;

    if (follower?.id !== following?.id && !followSet.has(followKey)) {
      try {
        const follow = await prisma.follow.create({
          data: {
            followerId: follower?.id as number,
            followingId: following?.id as number,
            createdAt: randomDate(),
          },
        });
        follows.push(follow);
        followSet.add(followKey);
      } catch (error) {
        console.log(`Skipping duplicate follow: ${followKey}`);
      }
    }
  }

  console.log(`Created ${follows.length} unique follows`);
  return follows;
}

// Seed Tags
async function seedTags(): Promise<Tag[]> {
  const tagNames = [
    'programming',
    'travel',
    'food',
    'sports',
    'health',
    'fashion',
    'music',
    'art',
    'science',
    'business',
    'education',
    'entertainment',
    'politics',
    'environment',
    'lifestyle',
  ];
  const tags = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.create({
      data: { name },
    });
    tags.push(tag);
  }
  console.log(`Created ${tags.length} tags`);
  return tags;
}

// Seed Genres
async function seedGenres(): Promise<Genre[]> {
  const genreNames = [
    'Science Fiction',
    'Mystery',
    'Romance',
    'Thriller',
    'Fantasy',
    'Horror',
    'Adventure',
    'Historical Fiction',
    'Biography',
    'Self-Help',
    'Cookbook',
    'Poetry',
    'Drama',
    'Comedy',
  ];
  const genres = [];
  for (const name of genreNames) {
    const genre = await prisma.genre.create({
      data: {
        name,
        description: faker.lorem.sentence(),
      },
    });
    genres.push(genre);
  }
  console.log(`Created ${genres.length} genres`);
  return genres;
}

// Seed Books
async function seedBooks(
  users: User[],
  genres: Genre[],
  count = 50
): Promise<Book[]> {
  const books = [];
  for (let i = 1; i <= count; i++) {
    const book = await prisma.book.create({
      data: {
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        price: parseFloat(faker.commerce.price({ min: 9.99, max: 99.99 })),
        publishDate: faker.date.past({ years: 5 }),
        authorId: faker.helpers.arrayElement(users).id,
        genreId: faker.helpers.arrayElement(genres).id,
      },
    });
    books.push(book);
  }
  console.log(`Created ${books.length} books`);
  return books;
}

// Main seeding function
async function main(): Promise<void> {
  const users = await seedUsers(50);
  const profiles = await seedProfiles(users);
  await seedAddresses(profiles);
  const categories = await seedCategories();
  const posts = await seedPosts(users, categories, 100);
  await seedComments(users, posts, 200);
  await seedLikes(users, posts, 500);
  await seedFollows(users);
  await seedTags();
  const genres = await seedGenres();
  await seedBooks(users, genres, 100);

  console.log('Seed data creation completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma
      .$disconnect()
      .then(() => {})
      .catch((e) => console.log('Error disconnecting: ', e));
  });
