import { Injectable, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { ResourceService } from '@platon/feature/resource/browser'
import {
  CircleTree,
  Resource,
  ResourceTypes,
  circleFromTree,
  circleTreeFromResource,
  resourceAncestors,
} from '@platon/feature/resource/common'
import { firstValueFrom } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class EditorPresenter {
  private readonly authService = inject(AuthService)
  private readonly resourceService = inject(ResourceService)
  private version!: string
  private resource!: Resource
  private ancestors: CircleTree[] = []

  get currentVersion(): string {
    return this.version
  }

  get currentResource(): Readonly<Resource> {
    return this.resource
  }

  get currentAncestors(): ReadonlyArray<Readonly<CircleTree>> {
    return this.ancestors
  }

  async init(activatedRoute: ActivatedRoute) {
    const params = activatedRoute.snapshot.paramMap
    const queryParams = activatedRoute.snapshot.queryParamMap

    const id = params.get('id') as string
    const version = queryParams.get('version') || 'latest'
    const filesToOpen = (queryParams.get('files') || '').split(',').filter(Boolean)

    const user = (await this.authService.ready()) as User
    const [resource, circles, personal] = await Promise.all([
      firstValueFrom(this.resourceService.find({ id })),
      firstValueFrom(this.resourceService.tree()),
      firstValueFrom(this.resourceService.circle(user.username)),
    ])

    const ancestors =
      resource.parentId === personal.id
        ? [circleTreeFromResource(personal)]
        : resource.type === ResourceTypes.CIRCLE
        ? resourceAncestors(circles, resource.id)
        : [
            circleFromTree(circles, resource.parentId as string) as CircleTree,
            ...resourceAncestors(circles, resource.parentId as string),
          ]

    this.version = version
    this.resource = resource
    this.ancestors = ancestors

    return {
      circles,
      version,
      resource,
      ancestors,
      filesToOpen,
    }
  }

  /**
   *  Get the resource thats owns the given uri
   * @param uri the uri to get the owner of
   */
  findOwnerResource(uri: monaco.Uri) {
    const { currentAncestors, currentResource } = this
    const [resource] = uri.authority.split(':')

    const owner =
      currentResource.id === resource
        ? currentResource
        : currentAncestors.find((ancestor) => ancestor.code === resource)

    return {
      owner: owner
        ? {
            ...owner,
            type: 'type' in owner ? owner.type : 'CIRCLE',
          }
        : undefined,
      opened: currentResource.id === owner?.id,
    }
  }
}
