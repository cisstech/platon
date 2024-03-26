import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Configuration } from '../../config/configuration'
import { UserEntity } from '../../users/user.entity'
import { UserService } from '../../users/user.service'

type JwtPayload = {
  sub: string
  username: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService, configService: ConfigService<Configuration>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('secret', { infer: true }),
    })
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user = (await this.userService.findByIdOrName(payload.sub)).orElseThrow(
      () => new UnauthorizedException(`Failed to authentificate user: ${payload}`)
    )
    return user
  }
}
