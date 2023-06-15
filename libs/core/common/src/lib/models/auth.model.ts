import { UserRoles } from './user.model';
import { UserEntity } from '@platon/core/server';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface SignInDemoOutput {
  authToken: AuthToken;
  userId: string;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface ResetPasswordInput {
  username: string;
  password?: string;
  newPassword: string;
}

export interface SignUpInput {
  email: string;
  username: string;
  password: string;
  lastName: string;
  firstName: string;
  role: UserRoles;
}

export const TOKEN_EXPIRED_ERROR_CODE = 'auth/token-expired';
