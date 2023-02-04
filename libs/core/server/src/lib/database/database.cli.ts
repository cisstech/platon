import { DataSource } from 'typeorm';
import { config } from './database.config';

export const AppDataSource = new DataSource({
  ...config,
  entities: ['libs/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
});

