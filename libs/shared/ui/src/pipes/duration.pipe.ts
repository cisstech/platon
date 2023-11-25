import { Pipe, PipeTransform } from '@angular/core'
import formatDuration from 'date-fns/formatDuration'
import intervalToDuration from 'date-fns/intervalToDuration'
import fr from 'date-fns/locale/fr'

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number | [string | Date, string | Date], format: 'seconds' | 'milliseconds' = 'seconds'): string {
    let time = 0
    let isArray = false
    if (Array.isArray(value)) {
      isArray = true
      const dates = value.map((e) => (e ? new Date(e).getTime() : null))
      if (!dates[0] || !dates[1]) {
        return '0'
      } else {
        time = dates[1] - dates[0]
      }
    } else {
      time = value
    }

    format = isArray ? 'milliseconds' : format

    return !time
      ? '0'
      : formatDuration(
          intervalToDuration({
            start: 0,
            end: format === 'seconds' ? time * 1000 : time,
          }),
          { locale: fr }
        )
  }
}
