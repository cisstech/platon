import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { MatIconModule } from '@angular/material/icon'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { NgeUiListModule } from '@cisstech/nge/ui/list'

import { Course } from '@platon/feature/course/common'

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
    NzToolTipModule,

    NgeUiListModule,
  ],
})
export class CourseItemComponent implements OnInit {
  @Input() item!: Course
  @Input() simple = false

  protected name = ''
  protected desc = ''
  protected tags: string[] = []

  ngOnInit(): void {
    this.name = this.item.name
    this.desc = this.item.desc as string
    if (this.simple) {
      this.desc = ''
    }
  }
}
