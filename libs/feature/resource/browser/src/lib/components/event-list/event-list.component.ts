import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ResourceEvent } from '@platon/feature/resource/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
  standalone: true,
  selector: 'res-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzEmptyModule,
    NzTimelineModule
  ]
})
export class ResourceEventListComponent {
  @Input() items: ResourceEvent[] = [];

  trackById(_: number, item: ResourceEvent) {
    return item.id;
  }
}
