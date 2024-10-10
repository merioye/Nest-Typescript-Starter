/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      username: 'john_doe',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      username: 'jane_smith',
      password: 'password456',
      firstName: 'Jane',
      lastName: 'Smith',
      age: 28,
      role: 'ADMIN',
    },
  });

  // Create Profiles
  await prisma.profile.create({
    data: {
      bio: 'Software developer and book enthusiast',
      website: 'https://johndoe.com',
      avatarUrl: 'https://example.com/avatar1.jpg',
      socialLinks: { twitter: '@johndoe', linkedin: 'johndoe' },
      userId: user1.id,
      address: {
        create: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
      },
    },
  });

  await prisma.profile.create({
    data: {
      bio: 'Marketing specialist and travel lover',
      website: 'https://janesmith.com',
      avatarUrl: 'https://example.com/avatar2.jpg',
      socialLinks: { instagram: '@janesmith', facebook: 'janesmith' },
      userId: user2.id,
      address: {
        create: {
          street: '456 Elm St',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          zipCode: '90001',
        },
      },
    },
  });

  // Create Categories
  const category1 = await prisma.category.create({
    data: {
      name: 'Technology',
      description: 'All things tech',
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: 'Travel',
      description: 'Explore the world',
    },
  });

  // Create Posts
  const post1 = await prisma.post.create({
    data: {
      title: 'The Future of AI',
      content: 'Artificial Intelligence is rapidly evolving...',
      published: true,
      authorId: user1.id,
      categoryId: category1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'My Trip to Paris',
      content: 'Last summer, I had the opportunity to visit Paris...',
      published: true,
      authorId: user2.id,
      categoryId: category2.id,
    },
  });

  // Create Comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Great post! Very insightful.',
      authorId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Thanks for sharing your experience!',
      authorId: user1.id,
      postId: post2.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'I agree with your points.',
      authorId: user2.id,
      postId: post1.id,
      parentId: comment1.id,
    },
  });

  // Create Likes
  await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user1.id,
      postId: post2.id,
    },
  });

  // Create Follows
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  // Create Tags
  // const tag1 = await prisma.tag.create({
  //   data: {
  //     name: 'AI',
  //     posts: { connect: { id: post1.id } },
  //     users: { connect: { id: user1.id } },
  //   },
  // });

  // const tag2 = await prisma.tag.create({
  //   data: {
  //     name: 'Travel',
  //     posts: { connect: { id: post2.id } },
  //     users: { connect: { id: user2.id } },
  //   },
  // });

  // Create Genres
  const genre1 = await prisma.genre.create({
    data: {
      name: 'Science Fiction',
      description: 'Imaginative and futuristic concepts',
    },
  });

  const genre2 = await prisma.genre.create({
    data: {
      name: 'Travel Guide',
      description: 'Books about travel destinations and tips',
    },
  });

  // Create Books
  await prisma.book.create({
    data: {
      title: 'AI: The Next Frontier',
      description: 'Exploring the future of artificial intelligence',
      price: 29.99,
      publishDate: new Date('2023-01-15'),
      authorId: user1.id,
      genreId: genre1.id,
      purchasers: { connect: { id: user2.id } },
    },
  });

  await prisma.book.create({
    data: {
      title: 'Paris: A Traveler Guide',
      description: 'Everything you need to know about visiting Paris',
      price: 19.99,
      publishDate: new Date('2023-03-20'),
      authorId: user2.id,
      genreId: genre2.id,
      purchasers: { connect: { id: user1.id } },
    },
  });
}
