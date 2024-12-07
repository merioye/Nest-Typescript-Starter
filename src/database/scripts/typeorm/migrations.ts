import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

import { dataSource } from './dataSource';

const execAsync = promisify(exec);

const MIGRATIONS_PATH = join(__dirname, '../../migrations/typeorm');

export const generateMigration = async (name: string): Promise<void> => {
  try {
    await execAsync(
      `npx typeorm migration:generate ${MIGRATIONS_PATH}/${name} -d ${__dirname}/datasource.ts`
    );
    console.log(`Migration ${name} generated successfully`);
  } catch (error) {
    console.error('Error generating migration:', error);
    throw error;
  }
};

export const createEmptyMigration = async (name: string): Promise<void> => {
  try {
    await execAsync(`npx typeorm migration:create ${MIGRATIONS_PATH}/${name}`);
    console.log(`Empty migration ${name} created successfully`);
  } catch (error) {
    console.error('Error creating empty migration:', error);
    throw error;
  }
};

export const runMigrations = async (): Promise<void> => {
  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    console.log('Migrations executed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
};

export const revertMigration = async (): Promise<void> => {
  try {
    await dataSource.initialize();
    await dataSource.undoLastMigration();
    console.log('Last migration reverted successfully');
  } catch (error) {
    console.error('Error reverting migration:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
};

export const revertAllMigrations = async (): Promise<void> => {
  try {
    await dataSource.initialize();
    await dataSource.undoLastMigration({ transaction: 'all' });
    console.log('All migrations reverted successfully');
  } catch (error) {
    console.error('Error reverting all migrations:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
};
