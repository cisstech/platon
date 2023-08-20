import { UserEntity } from '../users/user.entity'

export interface IRequest extends Request {
  user: UserEntity
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
