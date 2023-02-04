import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthToken, SignInInput, SignUpInput } from '@platon/core/common';
import * as bcrypt from 'bcrypt';
import { Configuration } from '../config/configuration';
import { UserService } from '../users/user.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService<Configuration>
  ) { }

  async signIn(input: SignInInput): Promise<AuthToken> {
    const optionalUser = await this.userService.findByUsername(input.username);
    const user = optionalUser.orElseThrow(() => new NotFoundException(`User not found: ${input.username}`));
    if (!user.password ||!(await bcrypt.compare(input.password, user.password))) {
      throw new BadRequestException('Password is incorrect')
    }
    return this.authenticate(user.id, user.username);
  }

  async signUp(input: SignUpInput): Promise<AuthToken> {
    const optionalUser = await this.userService.findByUsername(input.username);
    if (optionalUser.isPresent()) {
      throw new BadRequestException(`User already found: ${input.username}`)
    }

    const user = await this.userService.create({
      ...input,
      password: await this.hash(input.password),
    });

    return this.authenticate(user.id, user.username);
  }

  async authenticate(userId: string, username: string): Promise<AuthToken> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get('secret', { infer: true }),
          expiresIn: this.configService.get('auth.accessLifetime', { infer: true }),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get('secret', { infer: true }),
          expiresIn: this.configService.get('auth.refreshLifetime', { infer: true }),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.configService.get('auth.salt', { infer: true }) as number);
  }
}
