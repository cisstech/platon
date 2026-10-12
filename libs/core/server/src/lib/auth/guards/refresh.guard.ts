import { Injectable } from '@nestjs/common'
import { AuthGuard as PassportGuard } from '@nestjs/passport'
import { UnauthorizedResponse } from '@platon/core/common'
import { UserEntity } from '../../users/user.entity'

/** The guard of `POST /auth/refresh`, which the global guard, for access tokens only, lets through. */
@Injectable()
export class RefreshGuard extends PassportGuard('jwt-refresh') {
  // Without PassportModule, Nest cannot resolve the options the base guard asks for.
  constructor() {
    super()
  }

  override handleRequest<TUser = UserEntity>(error: unknown, user: TUser | false): TUser {
    if (error) throw error
    if (!user) throw new UnauthorizedResponse('The session has ended')
    return user
  }
}
