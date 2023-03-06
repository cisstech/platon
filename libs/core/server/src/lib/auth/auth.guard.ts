import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportGuard } from '@nestjs/passport';
import { firstValueFrom, Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard extends PassportGuard(['jwt']) {
  constructor(private reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      const check = super.canActivate(context);
      if (typeof check === 'boolean') {
        return isPublic || check;
      }

      if (check instanceof Observable) {
        return (await firstValueFrom(check)) || isPublic;
      }

      return (await check) || isPublic
    } catch (error) {
      if (isPublic) {
        return true;
      }
      throw error;
    }
  }
}
