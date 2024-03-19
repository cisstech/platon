import { Injectable } from '@nestjs/common'
import { User, UserRoles } from '@platon/core/common'
import { IRequest, UserEntity } from '@platon/core/server'
import {
  ResourceMember,
  ResourcePermissions,
  ResourceTypes,
  noResourcePermissions,
} from '@platon/feature/resource/common'
import { ResourceMemberService } from '../members'
import { ResourceDTO } from '../resource.dto'
import { ResourceEntity } from '../resource.entity'
import { ResourceService } from '../resource.service'
import { ResourceWatcherEntity, ResourceWatcherService } from '../watchers'

type Resource = ResourceEntity | ResourceDTO

type PermissionsContext = {
  user: UserEntity
  userMemberships: ResourceMember[]
  userWatchings: ResourceWatcherEntity[]
}

interface PermissionsInput<T extends Resource> {
  req?: IRequest
  resource: T
}

/**
 * Service for checking user permissions on resources.
 * @remarks
 * - This service will handle multiple calls during the same request and will memoize the results.
 */
@Injectable()
export class ResourcePermissionService {
  constructor(
    private readonly memberService: ResourceMemberService,
    private readonly watcherService: ResourceWatcherService,
    private readonly resourceService: ResourceService
  ) {}

  async userPermissionsOnResource<T extends ResourceEntity | ResourceDTO>(
    input: PermissionsInput<T>
  ): Promise<ResourcePermissions> {
    const { req, resource } = input
    if (!req?.user) {
      return noResourcePermissions()
    }

    const context = await req.memoize<PermissionsContext>('resource.permissions.context', async () => {
      return this.buildPermissionsContext(req)
    })

    const { user, userMemberships, userWatchings } = context

    const circleId = resource.type === ResourceTypes.CIRCLE ? resource.id : resource.parentId!
    const [circle, descendants] = await Promise.all([
      resource.type === ResourceTypes.CIRCLE
        ? resource
        : req.memoize(`resource.permissions.circle.${circleId}`, async () => {
            return this.resourceService.getById(circleId!, false)
          }),
      req.memoize(`resource.permissions.descendants.${circleId}`, async () => {
        return this.resourceService.getDescendants(circleId)
      }),
    ])

    const memberships = userMemberships.map((m) => m.resourceId)
    const isWaitingForBeingMember = userMemberships.some((m) => m.resourceId === resource.id && m.waiting)

    return {
      // This logic is implemented in ResourceService in method change please report any change
      read: circle.personal ? this.applyRestrictifReadRule(user, circle, memberships, descendants) : true,
      write:
        circle.ownerId === user.id || // user is owner of the circle
        (user.role === UserRoles.admin && !circle.personal) || // user is admin and circle is not personal
        (memberships.includes(circle.id) && !isWaitingForBeingMember), // user is member of the circle and not in waiting state
      watcher: userWatchings.some((w) => w.resourceId === resource.id),
      member: memberships.includes(resource.id),
      waiting: isWaitingForBeingMember,
    }
  }

  async userPermissionsOnResources<T extends Resource>(
    resources: T[],
    req: IRequest
  ): Promise<{ resource: T; permissions: ResourcePermissions }[]> {
    return Promise.all(
      resources.map(async (resource) => ({
        resource,
        permissions: await this.userPermissionsOnResource({ req, resource }),
      }))
    )
  }

  /**
   * Applies the restrictive read rule to determine if a user has permission to read a personal circle.
   * @param user - The user for whom the permission is being checked.
   * @param circle - The circle associated with the resource.
   * @param memberships - User's memberships.
   * @param descendants - Circle's descendants.
   * @returns A boolean indicating whether the user has permission to read the resource.
   */
  private applyRestrictifReadRule(
    user: User,
    circle: Resource,
    memberships: string[],
    descendants: Resource[]
  ): boolean {
    return (
      user.id === circle.ownerId || // user is owner of the circle,
      memberships.includes(circle.id) || // user is member of the circle
      descendants.some((c) => memberships.includes(c.id)) // user is member of a descendant circle (NOT IMPLEMENTED YET AS FEATURE BUT HERE TO HANDLE THE CASE)
    )
  }

  private async buildPermissionsContext(req: IRequest): Promise<PermissionsContext> {
    const { user } = req
    const [userMemberships, userWatchings] = await Promise.all([
      this.memberService.findAllByUserId(user.id),
      this.watcherService.findAllByUserId(user.id),
    ])
    return { user, userMemberships, userWatchings }
  }
}
