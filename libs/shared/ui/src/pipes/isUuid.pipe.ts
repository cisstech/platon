import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'isUUID',
  standalone: true,
})
export class IsUUIDPipe implements PipeTransform {
  transform(value: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
  }
}
