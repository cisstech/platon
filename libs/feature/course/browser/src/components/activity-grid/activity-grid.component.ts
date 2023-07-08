import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzSegmentedModule } from 'ng-zorro-antd/segmented'
import { NzTabsModule } from 'ng-zorro-antd/tabs'

import { FormsModule } from '@angular/forms'
import { Activity } from '@platon/feature/course/common'
import { CourseActivityCardComponent } from '../activity-card/activity-card.component'

@Component({
  standalone: true,
  selector: 'course-activity-grid',
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    NzGridModule,
    NzTabsModule,
    NzSegmentedModule,
    CourseActivityCardComponent,
  ],
})
export class CourseActivityGridComponent {
  protected tabs: Tab[] = []
  protected empty = false
  protected selectedIndex = 0

  @Input()
  set items(value: Activity[]) {
    this.tabs = [
      { title: 'Ouvert', items: value.filter((item) => item.state === 'opened') },
      { title: 'À venir', items: value.filter((item) => item.state === 'planned') },
      { title: 'Fermé', items: value.filter((item) => item.state === 'closed') },
    ]
    this.empty = !value.length
  }

  protected trackActivity(_: number, item: Activity): string {
    return item.id
  }
}

interface Tab {
  title: string
  items: Activity[]
}
