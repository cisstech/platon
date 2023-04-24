import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './database.config';


export const AppDataSource = new DataSource({
  ...config,
  entities: ['libs/**/*.entity.ts', "libs/**/*.view.ts"],
  migrations: ['migrations/*.ts'],
} as DataSourceOptions);

