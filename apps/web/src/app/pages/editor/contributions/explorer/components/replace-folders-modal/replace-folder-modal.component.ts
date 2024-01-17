import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'

export type ReplaceFolderModalData = {
  code: string
  versions: string[]
  selection: string
}

@Component({
  standalone: true,
  selector: 'app-editor-replace-folder-modal',
  templateUrl: './replace-folder-modal.component.html',
  styleUrls: ['./replace-folder-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NzSelectModule],
})
export class ReplaceFolderModalComponent {
  protected readonly data = inject<ReplaceFolderModalData>(NZ_MODAL_DATA)
}
