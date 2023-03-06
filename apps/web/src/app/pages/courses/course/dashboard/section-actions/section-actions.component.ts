import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { CourseSection } from '@platon/feature/course/common';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

@Component({
  standalone: true,
  selector: 'app-course-section-actions',
  templateUrl: './section-actions.component.html',
  styleUrls: ['./section-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzSpaceModule,
    NzButtonModule,
    NzPopoverModule,
    NzPopconfirmModule,
  ]
})
export class CourseSectionActionsComponent {
  @Input() section!: CourseSection;
  @Input() sectionCount = 0;

  @Output() moveUp = new EventEmitter();
  @Output() moveDown = new EventEmitter();
  @Output() insertBelow = new EventEmitter();
  @Output() remove = new EventEmitter();
}
