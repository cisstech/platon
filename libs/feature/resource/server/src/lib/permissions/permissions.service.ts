import { Injectable } from '@nestjs/common'
import { UserRoles } from '@platon/core/common'
import { UserEntity } from '@platon/core/server'
import { ResourceMember, ResourcePermissions, ResourceTypes } from '@platon/feature/resource/common'
import { ResourceMemberService } from '../members'
import { ResourceDTO } from '../resource.dto'
import { ResourceEntity } from '../resource.entity'
import { ResourceService } from '../resource.service'
import { ResourceWatcherEntity, ResourceWatcherService } from '../watchers'
import { MemberPermissions } from './permissions.entity'

interface UserPermissionsInput<T extends ResourceEntity | ResourceDTO> {
  resource: T
  user: UserEntity
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
    const { resource, user, userWatchings, userMemberships } = input
    const [circle, members, watchings, descendants] = await Promise.all([
      resource.type === ResourceTypes.CIRCLE ? resource : this.resourceService.getById(resource.parentId as string),
      userMemberships || this.memberService.findAllByUserId(user.id),
      userWatchings || this.watcherService.findAllByUserId(user.id),
      this.resourceService.findDescendantCircles(
        resource.type === ResourceTypes.CIRCLE ? resource.id : (resource.parentId as string)
      ),
    ])

    if (circle.personal && circle.ownerId !== user.id) {
      return {
        read: false,
        write: false,
        watcher: false,
      }
    }

    const shareds = members.map((m) => m.resourceId)

    return {
      read:
        user.role === UserRoles.admin || // user is admin
        !circle.parentId || // circle is a root circle
        members.some((m) => m.resourceId === circle.id) || // user is member of the circle
        descendants.some((c) => shareds.includes(c.id)), // user is member of a descendant circle,
      write:
        user.role === UserRoles.admin || // user is admin
        shareds.includes(circle.id) || // user is member of the circle
        circle.ownerId === user.id, // user is owner of the circle,
      watcher: watchings.some((w) => w.resourceId === resource.id),
    }
  }

  async userPermissionsOnResources<T extends ResourceEntity | ResourceDTO>(
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
        permissions: await this.userPermissionsOnResource({ resource, user, userMemberships, userWatchings }),
      }))
    )
  }
}
