import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ClipboardService } from '@cisstech/nge/services'
import { DialogService } from '@platon/core/browser'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

@Component({
  standalone: true,
  selector: 'course-sharing',
  templateUrl: './course-sharing.component.html',
  styleUrls: ['./course-sharing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,

    NzIconModule,
    NzDropDownModule,
    NzSelectModule,
    NzButtonModule,
    NzToolTipModule,

    NzModalModule,
  ],
})
export class CourseSharingComponent {
  private readonly dialogService = inject(DialogService)
  private readonly clipboardService = inject(ClipboardService)

  @Input() courseId!: string

  protected mode: 'lti' | 'internal' = 'lti'

  protected share(): void {
    const suffix = this.mode === 'lti' ? `api/v1/lti/launch?next=/courses/${this.courseId}` : `courses/${this.courseId}`
    this.clipboardService.copy(`${location.origin}/${suffix}`)
    this.dialogService.success('Lien copié dans le presse-papier')
  }
}
