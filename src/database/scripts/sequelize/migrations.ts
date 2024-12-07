import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { Sequelize } from 'sequelize';

const execAsync = promisify(exec);

const getSequelizeInstance = (env: string) => {
  const config = {
    development: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      dialect: process.env.DB_DIALECT as any,
    },
    production: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      dialect: process.env.DB_DIALECT as any,
    },
  };

  return new Sequelize(config[env as keyof typeof config]);
};

const MIGRATIONS_PATH = join(__dirname, '../../migrations/sequelize');

export const generateMigration = async (name: string): Promise<void> => {
  try {
    await execAsync(
      `npx sequelize-cli migration:generate --name ${name} --migrations-path ${MIGRATIONS_PATH}`
    );
    console.log(`Migration ${name} generated successfully`);
  } catch (error) {
    console.error('Error generating migration:', error);
    throw error;
  }
};

export const createEmptyMigration = async (name: string): Promise<void> => {
  try {
    await execAsync(
      `npx sequelize-cli migration:create --name ${name} --migrations-path ${MIGRATIONS_PATH}`
    );
    console.log(`Empty migration ${name} created successfully`);
  } catch (error) {
    console.error('Error creating empty migration:', error);
    throw error;
  }
};

export const runMigrations = async (env: string): Promise<void> => {
  const sequelize = getSequelizeInstance(env);
  try {
    await execAsync(
      `npx sequelize-cli db:migrate --migrations-path ${MIGRATIONS_PATH}`
    );
    console.log('Migrations executed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

export const revertMigration = async (env: string): Promise<void> => {
  const sequelize = getSequelizeInstance(env);
  try {
    await execAsync(
      `npx sequelize-cli db:migrate:undo --migrations-path ${MIGRATIONS_PATH}`
    );
    console.log('Last migration reverted successfully');
  } catch (error) {
    console.error('Error reverting migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

export const revertAllMigrations = async (env: string): Promise<void> => {
  const sequelize = getSequelizeInstance(env);
  try {
    await execAsync(
      `npx sequelize-cli db:migrate:undo:all --migrations-path ${MIGRATIONS_PATH}`
    );
    console.log('All migrations reverted successfully');
  } catch (error) {
    console.error('Error reverting all migrations:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};
