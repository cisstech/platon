import { AuthToken, SignInInput, SignUpInput, UserRoles } from "@platon/core/common";

export class AuthTokenDTO implements AuthToken {
  accessToken!: string;
  refreshToken!: string;
}

export class SignInInputDTO implements SignInInput {
  username!: string;
  password!: string;
}

export class SignUpInputDTO implements SignUpInput {
  email!: string;
  username!: string;
  password!: string;
  lastName!: string;
  firstName!: string;
  role!: UserRoles;
}
