import { Pipe, PipeTransform } from '@angular/core'
import { Resource } from '@platon/feature/resource/common'
import { firstValueFrom } from 'rxjs'
import { ResourceService } from '../api/resource.service'

@Pipe({
  name: 'resourceFind',
  pure: true,
})
export class ResourceFindPipe implements PipeTransform {
  constructor(private readonly resourceService: ResourceService) {}
  async transform(id: string): Promise<Resource | undefined> {
    try {
      return await firstValueFrom(this.resourceService.find(id))
    } catch {
      return undefined
    }
  }
}
