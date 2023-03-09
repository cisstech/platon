import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { CourseActivity } from '@platon/feature/course/common';
import { CourseActivityCardComponent } from '../course-activity-card/course-activity-card.component';

@Component({
  standalone: true,
  selector: 'course-activity-grid',
  templateUrl: './course-activity-grid.component.html',
  styleUrls: ['./course-activity-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzGridModule,
    NzTabsModule,
    CourseActivityCardComponent,
  ]
})
export class CourseActivityGridComponent {

  protected tabs: Tab[] = [];
  protected empty = false;

  @Input()
  set items(value: CourseActivity[]) {
    this.tabs = [
      { title: 'En cours', items: value.filter(item => item.state === 'opened') },
      { title: 'À venir', items: value.filter(item => item.state === 'planned') },
      { title: 'Fermé', items: value.filter(item => item.state === 'closed') }
    ];
    this.empty = !value.length;
  }

  trackTab(_: number, item: Tab): string {
    return item.title;
  }

  trackActivity(_: number, item: CourseActivity): string {
    return item.id;
  }

}

interface Tab {
  title: string,
  items: CourseActivity[]
}
