import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UnauthorizedResponse } from '@platon/core/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Configuration } from '../../config/configuration'
import { UserEntity } from '../../users/user.entity'
import { UserService } from '../../users/user.service'
import { TokenPayload } from '../auth.types'

/** Checks the token of `POST /auth/refresh`: a refresh token, or an untyped token that has an end. */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private readonly userService: UserService

  constructor(userService: UserService, configService: ConfigService<Configuration>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('secret', { infer: true }),
    })
    this.userService = userService
  }

  async validate(payload: TokenPayload): Promise<UserEntity> {
    const untypedWithEnd = payload.typ === undefined && payload.exp !== undefined
    if (payload.typ !== 'refresh' && !untypedWithEnd) {
      throw new UnauthorizedResponse('A refresh token is expected')
    }
    return (await this.userService.findByIdOrName(payload.sub)).orElseThrow(
      () => new UnauthorizedResponse('The user of the token no longer exists')
    )
  }
}
