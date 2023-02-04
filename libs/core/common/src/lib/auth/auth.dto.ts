import { UserRoles } from "../user/user-roles";

export class SignInInput {
  username!: string;
  password!: string;
}

export class SignUpInput {
  email!: string;
  username!: string;
  password!: string;
  lastName!: string;
  firstName!: string;
  role!: UserRoles;
}

export class AuthToken {
  accessToken!: string;
  refreshToken!: string;
}

