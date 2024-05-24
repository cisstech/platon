import { Pipe, PipeTransform } from '@angular/core'
import { ExerciseResourceMeta, ResourceMeta } from '@platon/feature/resource/common'

@Pipe({
  name: 'exerciseResourceMeta',
  pure: true,
})
export class ExerciseResourceMetaPipe implements PipeTransform {
  transform(value: ResourceMeta, _args?: ResourceMeta): ExerciseResourceMeta {
    return value as ExerciseResourceMeta
  }
}
