import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UnauthorizedResponse } from '@platon/core/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Configuration } from '../../config/configuration'
import { UserEntity } from '../../users/user.entity'
import { UserService } from '../../users/user.service'
import { TokenPayload } from '../auth.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService, configService: ConfigService<Configuration>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('secret', { infer: true }),
    })
  }

  async validate(payload: TokenPayload): Promise<UserEntity> {
    // An untyped token reads as an access token until it expires: older sessions go on without signing in again.
    if (payload.typ !== undefined && payload.typ !== 'access') {
      throw new UnauthorizedResponse('An access token is expected')
    }
    const user = (await this.userService.findByIdOrName(payload.sub)).orElseThrow(
      () => new UnauthorizedResponse('The user of the token no longer exists')
    )
    await this.userService.updateLastActivity(user)
    return user
  }
}
