import { UserEntity } from "../users/user.entity";

export interface IRequest extends Request {
  user: UserEntity
}
