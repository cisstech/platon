import {
  Body,
  Controller, Post, Req
} from '@nestjs/common';
import { AuthToken, CreatedResponse, ItemResponse, SignInInput, SignUpInput } from '@platon/core/common';
import { AuthService } from './auth.service';
import { IRequest } from './auth.types';
import { Public } from './decorators/public.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('signup')
  async signUp(@Body() input: SignUpInput): Promise<CreatedResponse<AuthToken>> {
    return new CreatedResponse({
      resource: await this.authService.signUp(input)
    });
  }

  @Public()
  @Post('signin')
  async signIn(@Body() input: SignInInput): Promise<ItemResponse<AuthToken>> {
    return new ItemResponse({
      resource: await this.authService.signIn(input)
    });
  }

  @Post('refresh')
  async refresh(@Req() req: IRequest): Promise<ItemResponse<AuthToken>> {
    return new ItemResponse({
      resource: await this.authService.authenticate(req.user.id, req.user.username)
    });
  }
}
