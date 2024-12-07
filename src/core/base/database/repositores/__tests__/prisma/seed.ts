import { PrismaClient } from '@prisma/client';

import { Role } from '@/types';

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  // Create Users
  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      username: 'john_doe',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      role: Role.ADMIN,
      interests: ['coding', 'reading'],
      profile: {
        create: {
          bio: 'Software developer and book enthusiast',
          website: 'https://johndoe.com',
          avatarUrl: 'https://example.com/avatar1.jpg',
          socialLinks: { twitter: '@johndoe', linkedin: 'johndoe' },
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
      },
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      username: 'jane_smith',
      password: 'password456',
      firstName: 'Jane',
      lastName: 'Smith',
      age: 28,
      role: Role.ADMIN,
      interests: ['traveling', 'photography'],
      profile: {
        create: {
          bio: 'Marketing specialist and travel lover',
          website: 'https://janesmith.com',
          avatarUrl: 'https://example.com/avatar2.jpg',
          socialLinks: { instagram: '@janesmith', facebook: 'janesmith' },
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
      },
    },
  });

  // Create additional users for pagination testing
  const additionalUsers = [];
  for (let i = 1; i <= 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        username: `user_${i}`,
        password: `password${i}`,
        firstName: 'User',
        lastName: `${i}`,
        age: 20 + i,
        role: i % 2 === 0 ? Role.USER : Role.ADMIN,
        interests: [`interest${i}`, `hobby${i}`],
        profile: {
          create: {
            bio: `Bio for user ${i}`,
            website: `https://user${i}.com`,
            avatarUrl: `https://example.com/avatar${i}.jpg`,
            socialLinks: { twitter: `@user${i}` },
            address: {
              create: {
                street: `${i} Test St`,
                city: `City ${i}`,
                state: 'ST',
                country: 'USA',
                zipCode: `1000${i}`,
              },
            },
          },
        },
      },
    });
    additionalUsers.push(user);
  }

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
      authorId: john.id,
      categoryId: category1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'My Trip to Paris',
      content: 'Last summer, I had the opportunity to visit Paris...',
      published: true,
      authorId: jane.id,
      categoryId: category2.id,
    },
  });

  // Create additional posts for some users
  for (let i = 0; i < 10; i++) {
    const randomUser =
      additionalUsers[Math.floor(Math.random() * additionalUsers.length)];
    if (!randomUser) continue;

    await prisma.post.create({
      data: {
        title: `Post ${i + 1} by ${randomUser.username}`,
        content: `Content for post ${i + 1}...`,
        published: true,
        authorId: randomUser.id,
        categoryId: i % 2 === 0 ? category1.id : category2.id,
      },
    });
  }

  // Create Comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Great post! Very insightful.',
      authorId: jane.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Thanks for sharing your experience!',
      authorId: john.id,
      postId: post2.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'I agree with your points.',
      authorId: jane.id,
      postId: post1.id,
      parentId: comment1.id,
    },
  });

  // Create Likes
  await prisma.like.create({
    data: {
      userId: jane.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: john.id,
      postId: post2.id,
    },
  });

  // Create Follows
  await prisma.follow.create({
    data: {
      followerId: jane.id,
      followingId: john.id,
    },
  });

  // Create Tags
  // const tag1 = await prisma.tag.create({
  //   data: {
  //     name: 'AI',
  //     posts: { connect: { id: post1.id } },
  //     users: { connect: { id: john.id } },
  //   },
  // });

  // const tag2 = await prisma.tag.create({
  //   data: {
  //     name: 'Travel',
  //     posts: { connect: { id: post2.id } },
  //     users: { connect: { id: jane.id } },
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
      authorId: john.id,
      genreId: genre1.id,
      purchasers: { connect: { id: jane.id } },
    },
  });

  await prisma.book.create({
    data: {
      title: 'Paris: A Traveler Guide',
      description: 'Everything you need to know about visiting Paris',
      price: 19.99,
      publishDate: new Date('2023-03-20'),
      authorId: jane.id,
      genreId: genre2.id,
      purchasers: { connect: { id: john.id } },
    },
  });
}

export async function clearDatabase(prisma: PrismaClient): Promise<void> {
  // First, clear all self-referencing relationships
  await prisma.comment.updateMany({
    where: { parentId: { not: null } },
    data: { parentId: null },
  });

  // Then clear many-to-many relationships
  await prisma.$transaction([
    // Clear junction tables and leaf nodes first
    prisma.like.deleteMany(),
    prisma.follow.deleteMany(),

    // Clear entities with foreign keys to other tables
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.book.deleteMany(),
    prisma.address.deleteMany(),

    // Clear entities that are referenced by others
    prisma.category.deleteMany(),
    prisma.genre.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.profile.deleteMany(),

    // Finally, clear the root entities
    prisma.user.deleteMany(),
  ]);
}
