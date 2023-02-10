import { UserRoles } from "../user/user-roles";

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  username: string;
  password: string;
  lastName: string;
  firstName: string;
  role: UserRoles;
}

