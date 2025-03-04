import 'dotenv/config'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import pgvector from 'pgvector' // https://github.com/pgvector/pgvector-node?tab=readme-ov-file#typeorm

import { DataSourceOptions } from 'typeorm'

export const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env['DB_URL'],
  port: Number.parseInt(process.env['DB_PORT'] || ''),
  host: process.env['DB_HOST'],
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_NAME'],
  synchronize: false,
  migrationsRun: false,
  logging: ['error'],
  logger: 'advanced-console',
}
