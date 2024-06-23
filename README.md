# NestJS TypeScript Template

## Project Overview

This is a production-ready template for developing applications using NestJS and TypeScript. It includes a comprehensive setup with various tools and configurations to streamline the development process.

## 📖 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Development Workflow](#development-workflow)
- [Scripts](#scripts)
- [Linting and Formatting](#linting-and-formatting)
- [Testing](#testing)
- [Environment Configuration](#environment-configuration)
- [License](#license)

## 📋 Features

- NestJS Framework
- TypeScript for static type checking
- Swagger for API documentation
- Jest for testing
- ESLint and Prettier for code quality and formatting
- Nestjs-18n for localization
- PM2 for process management
- Docker to containerize the application

## ❇️ Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Swagger**: A tool for documenting RESTful APIs.
- **Jest**: A delightful JavaScript testing framework.
- **ESLint**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript.
- **Prettier**: An opinionated code formatter.
- **Nestjs-i18n**: Internationalization framework for Nestjs
- **PM2**: A production process manager for Node.js applications.
- **Docker**: A platform designed to help developers build, share, and run container applications.

## ⚙️ Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/merioye/Nest-Typescript-Template.git
   cd nest-typescript-template
   ```

2. **Install Dependencies**
   Make sure you have Node.js (>=20) installed. Then run:

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.development`, `.env.test`, `.env.production` files in the root directory and copy environment variables from `.env.example` file and configure their values according to the environment. For example in `.env.development`:

   ```env
   NODE_ENV=development
   DATABASE_URL=your_development_database_url
   ```

4. **Start the Application**
   ```bash
   npm run start:dev
   ```

## 🖇️ Development Workflow

- **Build the Project**

  ```bash
  npm run build
  ```

- **Start the Development Server**

  ```bash
  npm run start:dev
  ```

- **Start the Production Server**

  ```bash
  npm run start:prod
  ```

- **Run Tests**
  ```bash
  npm test
  ```

## 📝 Scripts

- `npm run prebuild`: Prebuild script.
- `npm run build`: Build the project.
- `npm run start`: Start the application in development mode.
- `npm run start:dev`: Start the application in watch mode for development.
- `npm run start:debug`: Start the application in debug mode.
- `npm run start:prod`: Start the application in production mode using PM2.
- `npm run lint`: Lint the codebase.
- `npm run lint:fix`: Fix linting errors.
- `npm run format:check`: Check code formatting.
- `npm run format:fix`: Fix code formatting.
- `npm run test`: Run all tests.
- `npm run test:watch`: Run tests in watch mode.
- `npm run test:e2e`: Run end-to-end tests.
- `npm run docker:dev:up`: Create docker containers for services specified in `docker-compose.dev.yaml` for development environment.
- `npm run docker:dev:down`: Remove running docker containers for services specified in `docker-compose.dev.yaml` file.
- `npm run docker:prod:up`: Create docker containers for services specified in `docker-compose.prod.yaml` for production environment.
- `npm run docker:prod:down`: Remove running docker containers for services specified in `docker-compose.prod.yaml` file.
- `npm run clean`: Clean the project.

## 🔖 Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting. Ensure your code follows the defined standards by running:

```bash
npm run lint
npm run format:check
```

You can automatically fix issues with:

```bash
npm run lint:fix
npm run format:fix
```

## 🧪 Testing

This project uses Jest for unit and end-to-end testing. You can run the tests with the following commands:

```bash
npm run test
npm run test:watch
npm run test:e2e
```

## 🛠️ Environment Configuration

Ensure you have a env files with all necessary environment variables set up. Example:

```bash
NODE_ENV=development
DATABASE_URL=your_database_url
```

## 🗎 License

This project is licensed under the MIT license.
Created by Umair Saleem.
