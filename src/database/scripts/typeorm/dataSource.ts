import { join } from 'path';
import { DataSource } from 'typeorm';

export const dataSource = new DataSource({
  type: process.env.DB_DIALECT as any,
  url: process.env.TYPEORM_DATABASE_URL,
  entities: [join(__dirname, '../../entities/typeorm/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../../migrations/typeorm/**/*{.ts,.js}')],
});
