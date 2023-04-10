import { Pipe, PipeTransform } from '@angular/core';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import fr from 'date-fns/locale/fr';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number | [string | Date, string | Date], format: 'seconds' | 'milliseconds' = 'seconds'): string {
    const time = Array.isArray(value)
      ? (new Date(value[1]).getTime() - new Date(value[0]).getTime())
      : value;

    format = Array.isArray(value) ? 'milliseconds' : format;

    return !time ? '0' : formatDuration(
      intervalToDuration({
        start: 0,
        end: format === 'seconds' ? time * 1000 : time
      }),
      { locale: fr }
    );
  }
}
