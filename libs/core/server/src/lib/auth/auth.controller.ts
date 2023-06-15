import { Body, Controller, Post, Req, Get, Res } from '@nestjs/common';
import { CreatedResponse, ItemResponse } from '@platon/core/common';
import {
  AuthTokenDTO,
  ResetPasswordInputDTO,
  SignInInputDTO,
  SignUpInputDTO,
} from './auth.dto';
import { AuthService } from './auth.service';
import { IRequest } from './auth.types';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(
    @Body() input: SignUpInputDTO
  ): Promise<CreatedResponse<AuthTokenDTO>> {
    return new CreatedResponse({
      resource: await this.authService.signUp(input),
    });
  }

  @Public()
  @Post('signin')
  async signIn(
    @Body() input: SignInInputDTO
  ): Promise<ItemResponse<AuthTokenDTO>> {
    return new ItemResponse({
      resource: await this.authService.signIn(input),
    });
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() input: ResetPasswordInputDTO
  ): Promise<ItemResponse<AuthTokenDTO>> {
    return new ItemResponse({
      resource: await this.authService.resetPassword(input),
    });
  }

  @Post('refresh')
  async refresh(@Req() req: IRequest): Promise<ItemResponse<AuthTokenDTO>> {
    return new ItemResponse({
      resource: await this.authService.authenticate(
        req.user.id,
        req.user.username
      ),
    });
  }
}
