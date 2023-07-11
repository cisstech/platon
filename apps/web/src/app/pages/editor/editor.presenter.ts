import { Injectable, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ResourceService } from '@platon/feature/resource/browser'
import { CircleTree, Resource, ResourceTypes, circleFromTree, resourceAncestors } from '@platon/feature/resource/common'
import { firstValueFrom } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class EditorPresenter {
  private readonly resourceService = inject(ResourceService)

  private resource!: Resource
  private ancestors: CircleTree[] = []

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

    const [resource, circles] = await Promise.all([
      firstValueFrom(this.resourceService.find(id)),
      firstValueFrom(this.resourceService.tree()),
    ])

    const ancestors =
      resource.type === ResourceTypes.CIRCLE
        ? resourceAncestors(circles, resource.id)
        : [
            circleFromTree(circles, resource.parentId as string) as CircleTree,
            ...resourceAncestors(circles, resource.parentId as string),
          ]

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
}
