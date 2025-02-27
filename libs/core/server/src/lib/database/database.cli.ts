import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from './database.config'

export const AppDataSource = new DataSource({
  ...config,
  entities: ['libs/**/*.entity.ts', 'libs/**/*.view.ts'],
  migrations: ['migrations/*.ts'],
} as DataSourceOptions)

// @ts-expect-error TypeORM does not support but the database supports
// https://github.com/typeorm/typeorm/issues/10056
AppDataSource.driver.supportedDataTypes.push('vector')
