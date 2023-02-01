declare type EnvType = 'development' | 'production'
export interface Configuration {
  environment: EnvType,
  database: {
    url: string,
    port: number,
    host: string,
    username: string,
    password: string,
  }
}

export const configuration = (): Configuration => ({
  environment: process.env['NODE_ENV'] as EnvType,
  database: {
    url: process.env['DB_URL'] as string,
    port: Number.parseInt(process.env['DB_PORT'] || ''),
    host: process.env['DB_HOST'] as string,
    username: process.env['DB_USERNAME'] as string,
    password: process.env['DB_PASSWORD'] as string,
  }
})
