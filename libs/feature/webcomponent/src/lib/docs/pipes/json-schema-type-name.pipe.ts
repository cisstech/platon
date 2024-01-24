import { Pipe, PipeTransform } from '@angular/core'
import { JSONSchema7 } from 'json-schema'

@Pipe({
  name: 'JSONSchemaTypeName',
})
export class JSONSchemaTypeNamePipe implements PipeTransform {
  transform(value: JSONSchema7): string {
    if (value.type === 'array') {
      const items = value.items as JSONSchema7
      const itemTypes = Array.isArray(items.type) ? items.type.join(' | ') : items.type?.toString() ?? 'unknown'
      return `${itemTypes}[]`
    }
    return value.type?.toString() ?? 'unknown'
  }
}
