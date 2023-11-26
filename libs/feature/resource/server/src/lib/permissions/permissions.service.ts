import { Injectable } from '@nestjs/common'
import { User, UserRoles } from '@platon/core/common'
import { UserEntity } from '@platon/core/server'
import { ResourceMember, ResourcePermissions, ResourceTypes } from '@platon/feature/resource/common'
import { ResourceMemberService } from '../members'
import { ResourceDTO } from '../resource.dto'
import { ResourceEntity } from '../resource.entity'
import { ResourceService } from '../resource.service'
import { ResourceWatcherEntity, ResourceWatcherService } from '../watchers'
import { MemberPermissions } from './permissions.entity'

type Resource = ResourceEntity | ResourceDTO

interface UserPermissionsInput<T extends Resource> {
  resource: T
  user?: User
  userWatchings?: ResourceWatcherEntity[]
  userMemberships?: ResourceMember[]
}

@Injectable()
export class ResourcePermissionService {
  constructor(
    private readonly memberService: ResourceMemberService,
    private readonly watcherService: ResourceWatcherService,
    private readonly resourceService: ResourceService
  ) {}

  async userPermissionsOnResource<T extends ResourceEntity | ResourceDTO>(
    input: UserPermissionsInput<T>
  ): Promise<ResourcePermissions> {
    if (!input.user) {
      return {
        read: false,
        write: false,
        watcher: false,
        waiting: false,
        member: false,
      }
    }

    const { resource, user, userWatchings, userMemberships } = input
    const [circle, members, watchings, descendants] = await Promise.all([
      resource.type === ResourceTypes.CIRCLE ? resource : this.resourceService.getById(resource.parentId as string),
      userMemberships || this.memberService.findAllByUserId(user.id),
      userWatchings || this.watcherService.findAllByUserId(user.id),
      this.resourceService.findDescendantCircles(
        resource.type === ResourceTypes.CIRCLE ? resource.id : (resource.parentId as string)
      ),
    ])

    const shareds = members.map((m) => m.resourceId)

    return {
      read: circle.personal ? this.applyRestrictifReadRule(user, circle, members, descendants, shareds) : true,
      write:
        (user.role === UserRoles.admin && !circle.personal) || // user is admin and circle is not personal
        shareds.includes(circle.id) || // user is member of the circle
        circle.ownerId === user.id, // user is owner of the circle,
      watcher: watchings.some((w) => w.resourceId === resource.id),
      member: members.some((m) => m.resourceId === resource.id),
      waiting: members.some((m) => m.resourceId === resource.id && m.waiting),
    }
  }

  async userPermissionsOnResources<T extends Resource>(
    resources: T[],
    user: UserEntity
  ): Promise<
    {
      resource: T
      permissions: MemberPermissions
    }[]
  > {
    const userWatchings = await this.watcherService.findAllByUserId(user.id)
    const userMemberships = await this.memberService.findAllByUserId(user.id)
    return Promise.all(
      resources.map(async (resource) => ({
        resource,
        permissions: await this.userPermissionsOnResource({
          resource,
          user,
          userMemberships,
          userWatchings,
        }),
      }))
    )
  }

  /**
   * Applies the restrictive read rule to determine if a user has permission to read a personal circle.
   *
   *
   * @param user - The user for whom the permission is being checked.
   * @param circle - The circle associated with the resource.
   * @param members - The list of resource members.
   * @param descendants - The list of descendant constraints.
   * @param shareds - The list of shared circle IDs.
   * @returns A boolean indicating whether the user has permission to read the resource.
   */
  applyRestrictifReadRule(
    user: User,
    circle: Resource,
    members: ResourceMember[],
    descendants: Resource[],
    shareds: string[]
  ): boolean {
    return (
      user.id === circle.ownerId || // user is owner of the circle,
      members.some((m) => m.resourceId === circle.id) || // user is member of the circle
      descendants.some((c) => shareds.includes(c.id)) // user is member of a descendant circle (NOT IMPLEMENTED YET BUT HERE TO HANDLE THE CASE)
    )
  }
}
