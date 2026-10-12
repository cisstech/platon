import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  AuthToken,
  BadRequestResponse,
  CreateCandidateAccountInput,
  ForbiddenResponse,
  ResetPasswordInput,
  SignInDemoOutput,
  SignInInput,
  SignUpInput,
} from '@platon/core/common'
import * as bcrypt from 'bcrypt'
import { Configuration } from '../config/configuration'
import { UserService } from '../users/user.service'
import { UserRoles } from '@platon/core/common'
import { randomUUID } from 'crypto'
import { IRequest } from './auth.types'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  /** Hashed once, the first time a sign-in has no password to compare against. */
  private decoy?: Promise<string>

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService<Configuration>
  ) {}

  /**
   * One answer, in the same time, for an unknown account and a wrong password: a different one would
   * tell which accounts exist. An account without a password is compared against a decoy hash.
   */
  async signIn(input: SignInInput): Promise<AuthToken> {
    const user = (await this.userService.findByIdOrName(input.username)).orUndefined()
    const matches = await bcrypt.compare(
      input.password,
      user?.password || (await (this.decoy ??= this.hash(randomUUID())))
    )
    if (!user?.password || !matches) {
      throw new BadRequestResponse('Username or password is incorrect')
    }

    return this.authenticate(user.id, user.username)
  }

  async signUp(input: SignUpInput): Promise<AuthToken> {
    const optionalUser = await this.userService.findByIdOrName(input.username)
    if (optionalUser.isPresent()) {
      throw new BadRequestResponse(`User already found: ${input.username}`)
    }

    const user = await this.userService.create({
      ...input,
      password: await this.hash(input.password),
    })

    return this.authenticate(user.id, user.username)
  }

  async signInDemo(): Promise<SignInDemoOutput> {
    const anonymousUser = await this.userService.create({
      username: 'demo.' + randomUUID().split('-').join('_'),
      firstName: 'anon',
      lastName: 'ymous',
      active: true,
      role: UserRoles.demo,
    })

    const token = await this.authenticate(anonymousUser.id, anonymousUser.username)

    return {
      authToken: token,
      userId: anonymousUser.id,
    }
  }

  async resetPassword(input: ResetPasswordInput, req: IRequest): Promise<AuthToken> {
    const reqUser = req.user
    const user = (await this.userService.findByUsername(input.username)).get()
    if (reqUser.username !== user.username && reqUser.role !== UserRoles.admin) {
      throw new ForbiddenResponse('You are not allowed to reset this password')
    }
    if (user.password && !(await bcrypt.compare(input.password || '', user.password))) {
      throw new ForbiddenResponse('Password is incorrect')
    }
    if (input.newPassword === input.password) {
      throw new BadRequestResponse('New password must be different from the old one')
    }
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?([^\w\s]|_)).{12,}$/
    if (!passwordRegex.test(input.newPassword.trim())) {
      throw new BadRequestResponse('Invalid password format')
    }
    user.password = await this.hash(input.newPassword.trim())
    await this.userService.update(input.username, user)
    return this.authenticate(user.id, user.username)
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
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get('secret', { infer: true }),
          expiresIn: this.configService.get('auth.refreshLifetime', { infer: true }),
        }
      ),
    ])
    // Intentionally not blocking authentication if login tracking fails
    this.userService.touchLastLogin(userId).catch((error) => {
      this.logger.error('Failed to update last login:', error)
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  private async hash(data: string): Promise<string> {
    return bcrypt.hash(data, this.configService.get('auth.salt', { infer: true }) as number)
  }

  async createCandidateAccount(input: CreateCandidateAccountInput): Promise<string> {
    const user = await this.userService.create({
      username: 'candidat.' + randomUUID().split('-').join('_'),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      active: true,
      role: UserRoles.candidate,
    })
    return user.id
  }
}
