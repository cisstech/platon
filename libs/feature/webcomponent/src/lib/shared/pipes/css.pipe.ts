/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgModule, Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'css',
})
export class CssPipe implements PipeTransform {
  transform(input: string | undefined, type: 'class' | 'style'): any {
    const tokens = (input || '').split('<>')
    if (type === 'class') {
      return (tokens.find((e) => !e.includes(':')) || '').trim()
    }
    const styles = (tokens.find((e) => e.includes(':')) || '').trim()
    const matches = styles.match(/([\w-]+)\s*:([^;]+)/gm)
    return ((matches as string[]) || [])?.reduce(
      (dict, match) => {
        const tmp = match.split(':')
        const prop = tmp[0].trim()
        const value = tmp[1].trim()
        dict[prop] = value
        return dict
      },
      {} as Record<string, unknown>
    )
  }
}

@NgModule({
  declarations: [CssPipe],
  exports: [CssPipe],
})
export class CssPipeModule {}
