import { Injectable, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthService } from '@platon/core/browser'
import { User, removeLeadingSlash } from '@platon/core/common'
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
            type: 'type' in owner ? owner.type : ResourceTypes.CIRCLE,
          }
        : undefined,
      opened: currentResource.id === owner?.id,
    }
  }

  resolvePath(uri: monaco.Uri, to: monaco.Uri) {
    const { owner: srcRes, opened: srcOpened } = this.findOwnerResource(uri)
    if (!srcRes) {
      throw new Error(`Unable to resolve resource linked to : ${uri}`)
    }

    const { owner: dstRes, opened: dstOpened } = this.findOwnerResource(to)
    if (!dstRes) {
      throw new Error(`Unable to resolve resource linked to : ${to}`)
    }

    if (srcOpened && !dstOpened) {
      throw new Error(`Parent resource cannot access child resource files`)
    }

    if (srcOpened) {
      return removeLeadingSlash(uri.path)
    }

    if (!srcOpened && !dstOpened) {
      const indexSrc = this.ancestors.findIndex((ancestor) => ancestor.id === srcRes.id)
      const indexDst = this.ancestors.findIndex((ancestor) => ancestor.id === dstRes.id)
      if (indexSrc < indexDst) {
        throw new Error(`Parent resource cannot access child resource files`)
      }
      if (indexSrc === indexDst) {
        return removeLeadingSlash(uri.path)
      }
    }

    const version = uri.authority.split(':')[1]
    return `/${srcRes.code}:${version}${uri.path}`
  }
}
