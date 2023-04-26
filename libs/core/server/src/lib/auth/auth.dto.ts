import { AuthToken, ResetPasswordInput, SignInInput, SignUpInput, UserRoles } from "@platon/core/common";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class AuthTokenDTO implements AuthToken {
  @IsString()
  readonly accessToken!: string;

  @IsString()
  readonly refreshToken!: string;
}

export class SignInInputDTO implements SignInInput {
  @IsString()
  readonly username!: string;

  @IsString()
  readonly password!: string;
}

export class SignUpInputDTO implements SignUpInput {
  @IsString()
  readonly email!: string;

  @IsString()
  readonly username!: string;

  @IsString()
  readonly password!: string;

  @IsString()
  readonly lastName!: string;

  @IsString()
  readonly firstName!: string;

  @IsEnum(UserRoles)
  readonly role!: UserRoles;
}

export class ResetPasswordInputDTO implements ResetPasswordInput {
  @IsString()
  readonly username!: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsString()
  readonly newPassword!: string;
}
