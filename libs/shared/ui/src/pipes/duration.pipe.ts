import { Pipe, PipeTransform } from '@angular/core';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import fr from 'date-fns/locale/fr';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: number, format: 'seconds' | 'milliseconds' = 'seconds'): string {
    return !value ? '0' : formatDuration(
      intervalToDuration({
        start: 0,
        end: format === 'seconds' ? value * 1000 : value
      }),
      { locale: fr }
    );
  }
}
