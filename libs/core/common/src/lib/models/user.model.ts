import { Level } from "./level.model";
import { Topic } from "./topic.model";

export enum UserRoles {
  admin = 'admin',
  teacher = 'teacher',
  student = 'student'
}

export interface User {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly role: UserRoles;
  readonly username: string;
  readonly active: boolean;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly lastLogin?: Date;
  readonly firstLogin?: Date;
}

export class UpdateUser {
  readonly role?: UserRoles;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly active?: boolean;
}

export interface UserPrefs {
  readonly levels: Level[];
  readonly topics: Topic[];
}

export class UpdateUserPrefs {
  readonly levels?: string[];
  readonly topics?: string[];
}
