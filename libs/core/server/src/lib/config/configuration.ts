declare type EnvType = 'development' | 'production'
export interface Configuration {
  environment: EnvType,
  secret: string,
  database: {
    url: string,
    port: number,
    host: string,
    username: string,
    password: string,
  },
  redis: {
    host: string,
    port: number,
  },
  auth: {
    salt: number,
    accessLifetime: string,
    refreshLifetime: string
  },
  graphql: {
    playground: boolean,
  },
}

export const configuration = (): Configuration => ({
  environment: process.env['NODE_ENV'] as EnvType,
  secret: process.env['SECRET_KEY'] || 'secret',
  database: {
    url: process.env['DB_URL'] as string,
    port: Number.parseInt(process.env['DB_PORT'] || ''),
    host: process.env['DB_HOST'] as string,
    username: process.env['DB_USERNAME'] as string,
    password: process.env['DB_PASSWORD'] as string,
  },
  redis: {
    host: process.env['REDIS_HOST'] as string,
    port: Number.parseInt(process.env['REDIS_PORT'] || ''),
  },
  auth: {
    salt: Number.parseInt(process.env['PASSWORD_SALT'] || '10'),
    accessLifetime: process.env['JWT_ACCESS_TOKEN_LIFETIME'] || '15m',
    refreshLifetime: process.env['JWT_REFRESH_TOKEN_LIFETIME'] || '7d',
  },
  graphql: {
    playground: Boolean(process.env['GRAPHQL_PLAYGROUND']),
  },
})
