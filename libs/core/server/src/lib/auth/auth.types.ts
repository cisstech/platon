import { Request, Response } from 'express'
import { UserEntity } from '../users/user.entity'

/**
 * Represents an extended version of the Express Request object with additional properties and methods.
 * This is used to provide a consistent API for the request object across the application.
 * Extra properties and methods are added to the request object by the auth guard.
 */
export interface IRequest extends Request {
  /**
   * The authenticated user.
   */
  user: UserEntity

  /**
   * Utility function to calculate some value once during the request lifecycle and memoize it.
   * All calls to this function with the same key will return the same value during the request lifecycle.
   * @example
   * ```typescript
   * const req: IRequest = ...
   * const value = await req.memoize('key', async () => {
   *  // Some heavy computation
   * return 42
   * })
   * ```
   * @param key The key to memoize the value.
   * @param fn Function to calculate the value to memoize.
   * @returns The memoized value.
   */
  memoize: <TResult>(key: string, fn: () => Promise<TResult>) => Promise<TResult>

  [key: string]: unknown
}

/** The claims of a session token; older tokens have no `typ`. */
export interface TokenPayload {
  sub: string
  username: string
  typ?: 'access' | 'refresh'
  exp?: number
}

export interface AuthExecutionContext {
  req: IRequest
  res: Response

  payload?: unknown

  /**
   * Connection is only available for subscriptions and websockets.
   * This is defined in the graphql module config.
   */
  connection?: {
    context?: {
      headers?: Record<string, string>
    }
  }
}
