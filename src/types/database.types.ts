enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

type User = {
  id: number;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  isActive: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profile?: Profile;
  posts: Post[];
  comments: Comment[];
  likes: Like[];
  followers: Follow[];
  following: Follow[];
  authoredBooks: Book[];
  purchasedBooks: Book[];
  tags: Tag[];
  interests: string[];
  isDeleted: boolean;
};

type Profile = {
  id: number;
  bio?: string;
  website?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, any>;
  user: User;
  userId: number;
  address?: Address;
  isDeleted: boolean;
};

type Address = {
  id: number;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  profile: Profile;
  profileId: number;
  isDeleted: boolean;
};

type Post = {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  authorId: number;
  comments: Comment[];
  likes: Like[];
  tags: Tag[];
  category: Category;
  categoryId: number;
  isDeleted: boolean;
};

type Comment = {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  authorId: number;
  post: Post;
  postId: number;
  parent?: Comment;
  parentId?: number;
  replies: Comment[];
  isDeleted: boolean;
};

type Like = {
  id: number;
  createdAt: Date;
  user: User;
  userId: number;
  post: Post;
  postId: number;
  isDeleted: boolean;
};

interface Follow {
  id: number;
  follower: User;
  followerId: number;
  following: User;
  followingId: number;
  createdAt: Date;
  isDeleted: boolean;
}

type Category = {
  id: number;
  name: string;
  description?: string;
  posts: Post[];
  parentCategory?: Category;
  parentCategoryId?: number;
  subCategories: Category[];
  isDeleted: boolean;
};

type Tag = {
  id: number;
  name: string;
  posts: Post[];
  users: User[];
  isDeleted: boolean;
};

type Book = {
  id: number;
  title: string;
  description?: string;
  price: number;
  publishDate: Date;
  author: User;
  authorId: number;
  purchasers: User[];
  genre: Genre;
  genreId: number;
  isDeleted: boolean;
};

type Genre = {
  id: number;
  name: string;
  description?: string;
  books: Book[];
  isDeleted: boolean;
};

export {
  Role,
  User,
  Profile,
  Address,
  Post,
  Comment,
  Like,
  Follow,
  Category,
  Tag,
  Book,
  Genre,
};
