import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';

import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';


import { CourseActivity } from '@platon/feature/course/common';
import { CoursePipesModule } from '../../pipes';
import { CourseItemComponent } from '../course-item/course-item.component';

@Component({
  standalone: true,
  selector: 'course-activity-card',
  templateUrl: './course-activity-card.component.html',
  styleUrls: ['./course-activity-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    NzGridModule,
    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    NzProgressModule,

    CoursePipesModule,
    CourseItemComponent,
  ]
})
export class CourseActivityCardComponent {
  @Input() item!: CourseActivity;
}
