/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportGuard } from '@nestjs/passport';
import { TOKEN_EXPIRED_ERROR_CODE, UnauthorizedResponse, User } from '@platon/core/common';
import { TokenExpiredError } from 'jsonwebtoken';
import { Observable, firstValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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
      const loggedIn = super.canActivate(context);
      if (typeof loggedIn === 'boolean') {
        return isPublic || loggedIn;
      }

      // loggedIn should be called first for promise and observables to trigger the authentication so
      // public routes can also access user information in case of a valid token

      if (loggedIn instanceof Observable) {
        return (await firstValueFrom(loggedIn)) || isPublic;
      }

      return (await loggedIn) || isPublic
    } catch (error) {
      if (isPublic) {
        return true;
      }
      throw error;
    }
  }

  override handleRequest(err: any, user: User, info: any, context: ExecutionContext, status: any) {
    if (info instanceof TokenExpiredError || Array.isArray(info) && info.some((i) => i instanceof TokenExpiredError)) {
      throw new UnauthorizedResponse(TOKEN_EXPIRED_ERROR_CODE)
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
