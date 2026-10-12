declare type EnvType = 'development' | 'production'

export interface Configuration {
  environment: EnvType
  secret: string
  database: {
    url: string
    port: number
    host: string
    username: string
    password: string
  }
  cache: {
    filesLifetime: number
  }
  redis: {
    host: string
    port: number
  }
  auth: {
    salt: number
    accessLifetime: string
    refreshLifetime: string
  }
  sandbox: {
    url: string
    envLifespan: number
  }
  discord: {
    token: string
  }
  mail: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
    tlsRejectUnauthorized: boolean
    from: string
    technicalTeam: string[]
  }
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
  cache: {
    filesLifetime: Number.parseInt(process.env['FILES_CACHE_LIFETIME'] || '604800'),
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
  sandbox: {
    url: process.env['SANDBOX_URL'] as string,
    // 1 week = 7 * 24 * 60 * 60 = 604800 seconds.
    envLifespan: Number.parseInt(process.env['SANDBOX_ENV_LIFESPAN'] || '604800'),
  },
  discord: {
    token: process.env['DISCORD_BOT_TOKEN'] as string,
  },
  mail: {
    host: process.env['EMAIL_HOST'] as string,
    port: Number.parseInt(process.env['EMAIL_PORT'] || ''),
    secure: process.env['EMAIL_SECURE'] ? process.env['EMAIL_SECURE'].toLowerCase() === 'true' : false,
    user: process.env['EMAIL_USER'] as string,
    password: process.env['EMAIL_PASSWORD'] as string,
    tlsRejectUnauthorized: process.env['EMAIL_TLS_REJECT_UNAUTHORIZED']
      ? process.env['EMAIL_TLS_REJECT_UNAUTHORIZED'].toLowerCase() === 'true'
      : true,
    from: process.env['EMAIL_FROM'] as string,
    technicalTeam: process.env['EMAIL_TECHNICAL_TEAM']
      ? process.env['EMAIL_TECHNICAL_TEAM'].split(',').map((email) => email.trim())
      : [],
  },
})
