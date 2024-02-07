import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'

import { MatCardModule } from '@angular/material/card'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { MatIconModule } from '@angular/material/icon'
import { Activity } from '@platon/feature/course/common'
import { UiModalDrawerComponent } from '@platon/shared/ui'
import { CoursePipesModule } from '../../pipes'
import { CourseActivitySettingsComponent } from '../activity-settings/activity-settings.component'
import { CourseItemComponent } from '../course-item/course-item.component'

@Component({
  standalone: true,
  selector: 'course-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,
    MatCardModule,

    NzGridModule,
    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    NzProgressModule,
    NzToolTipModule,

    CoursePipesModule,
    CourseItemComponent,

    UiModalDrawerComponent,
    CourseActivitySettingsComponent,
  ],
})
export class CourseActivityCardComponent {
  @Input() item!: Activity
}
