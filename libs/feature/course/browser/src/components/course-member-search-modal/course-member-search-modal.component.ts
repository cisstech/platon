import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  booleanAttribute,
} from '@angular/core'
import { FormsModule } from '@angular/forms'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalModule } from 'ng-zorro-antd/modal'

import { UiModalTemplateComponent } from '@platon/shared/ui'
import { CourseMemberSearchBarComponent } from '../course-member-search-bar/course-member-search-bar.component'
import { CourseMember } from '@platon/feature/course/common'

@Component({
  standalone: true,
  selector: 'course-member-search-modal',
  templateUrl: './course-member-search-modal.component.html',
  styleUrls: ['./course-member-search-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    CourseMemberSearchBarComponent,
    UiModalTemplateComponent,
  ],
})
export class CourseMemberSearchModalComponent {
  @Input() title = ''
  @Input() okTitle = 'OK'
  @Input() noTitle = 'Annuler'
  @Input() excludes: string[] = []
  @Input({ transform: booleanAttribute }) multi = true
  @Input({ transform: booleanAttribute }) allowGroup = false
  @Input({ required: true }) courseId!: string

  @Output() closed = new EventEmitter<CourseMember[]>()

  @ViewChild(UiModalTemplateComponent, { static: true })
  protected modal!: UiModalTemplateComponent

  protected selection: CourseMember[] = []
  protected get ready(): boolean {
    const n = this.selection.length
    return !this.multi ? n === 1 : n > 0
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  open(): void {
    this.modal.open()
  }

  close(data: CourseMember[]): void {
    this.closed.emit(data)
    this.selection = []
    this.changeDetectorRef.markForCheck()
  }
}
