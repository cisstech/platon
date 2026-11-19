import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreatedResponse, ItemResponse, UserRoles } from '@platon/core/common'
import { AuthTokenDTO, ResetPasswordInputDTO, SignInInputDTO, SignUpInputDTO } from './auth.dto'
import { AuthService } from './auth.service'
import type { IRequest } from './auth.types'
import { Public } from './decorators/public.decorator'
import { Roles } from './decorators/roles.decorator'
import { RefreshGuard } from './guards/refresh.guard'
import { bearerToken } from '../utils/http-utils'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles(UserRoles.admin)
  @Post('signup')
  async signUp(@Body() input: SignUpInputDTO): Promise<CreatedResponse<AuthTokenDTO>> {
    return new CreatedResponse({
      resource: await this.authService.signUp(input),
    })
  }

  @Public()
  @Post('signin')
  async signIn(@Body() input: SignInInputDTO): Promise<ItemResponse<AuthTokenDTO>> {
    return new ItemResponse({
      resource: await this.authService.signIn(input),
    })
  }

  @Post('reset-password')
  async resetPassword(@Body() input: ResetPasswordInputDTO, @Req() req: IRequest): Promise<ItemResponse<AuthTokenDTO>> {
    return new ItemResponse({
      resource: await this.authService.resetPassword(input, req),
    })
  }

  /** The global guard lets only access tokens through: this route checks a refresh token with its own guard. */
  @Public()
  @UseGuards(RefreshGuard)
  @ApiBearerAuth()
  @Post('refresh')
  async refresh(@Req() req: IRequest): Promise<ItemResponse<AuthTokenDTO>> {
    return new ItemResponse({ resource: await this.authService.refresh(req.user, bearerToken(req) as string) })
  }
}
