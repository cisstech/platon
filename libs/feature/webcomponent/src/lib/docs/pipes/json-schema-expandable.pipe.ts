import { Pipe, PipeTransform } from '@angular/core'
import { JSONSchema7 } from 'json-schema'

@Pipe({
  name: 'JSONSchemaExpandable',
})
export class JSONSchemaExpandablePipe implements PipeTransform {
  transform(value: JSONSchema7): boolean {
    if (value.type === 'array') {
      const items = value.items as JSONSchema7
      const itemTypes = Array.isArray(items.type) ? items.type : items.type ? [items.type] : []
      return itemTypes.some((type) => type === 'object') && !!items.properties
    }
    return value.type === 'object'
  }
}
