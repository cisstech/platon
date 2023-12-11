import { ExpandContext, Expander } from '@cisstech/nestjs-expand'
import { Injectable } from '@nestjs/common'
import { IRequest } from '@platon/core/server'
import { ResourceMeta } from '@platon/feature/resource/common'
import { ResourceMetadataService } from './metadata'
import { ResourceDTO } from './resource.dto'

@Injectable()
@Expander(ResourceDTO)
export class ResourceExpander {
  constructor(private readonly metadataService: ResourceMetadataService) {}

  async metadata(context: ExpandContext<IRequest, ResourceDTO>): Promise<ResourceMeta | undefined> {
    const { parent } = context
    if (parent.type === 'CIRCLE') {
      return undefined
    }

    const metadata = await this.metadataService.of(parent.id)
    return metadata.meta
  }
}
