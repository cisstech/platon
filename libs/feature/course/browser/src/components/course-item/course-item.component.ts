import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core'

import { MatIconModule } from '@angular/material/icon'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { NgeUiListModule } from '@cisstech/nge/ui/list'

import { Course } from '@platon/feature/course/common'
import { antTagColorFromPercentage } from '@platon/shared/ui'

@Component({
  standalone: true,
  selector: 'course-item',
  templateUrl: './course-item.component.html',
  styleUrls: ['./course-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NzIconModule,
    NzBadgeModule,
    NzBadgeModule,
    NzToolTipModule,
    NzProgressModule,
    NgeUiListModule,
  ],
})
export class CourseItemComponent implements OnChanges {
  @Input() item!: Course
  @Input() simple = false

  protected name = ''
  protected desc = ''
  protected progressColor = 'primary'

  ngOnChanges(): void {
    this.name = this.item.name
    this.desc = this.item.desc as string
    if (this.simple) {
      this.desc = ''
    }

    this.progressColor = antTagColorFromPercentage(this.item.statistic?.progression ?? 0)
  }
}
