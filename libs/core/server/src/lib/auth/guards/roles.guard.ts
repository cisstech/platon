import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRoles } from '@platon/core/common'
import { IRequest } from '../auth.types'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles) {
      return true
    }
    // TODO create util function to get request to handle both rest and graphql
    const { user } = context.switchToHttp().getRequest() as IRequest
    return roles.some((role) => role === user?.role)
  }
}
