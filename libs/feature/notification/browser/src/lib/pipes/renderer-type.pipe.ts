import { Pipe, PipeTransform } from '@angular/core';
import { NotificationRenderer } from '../models/notification-parser';

@Pipe({
  name: 'rendererType',
  standalone: true
})

export class RendererTypePipe implements PipeTransform {
  transform(value?: NotificationRenderer) {
    if (!value?.content) return 'undefined';
    if (typeof value.content === 'string') return 'string';
    return 'component';
  }
}
