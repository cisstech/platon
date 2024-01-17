import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { CircleTreeComponent } from '@platon/feature/resource/browser'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { EditorPresenter } from '../../../../editor.presenter'

export type UpdateFoldersModalData = {
  selection: string[]
}

@Component({
  standalone: true,
  selector: 'app-editor-update-folders-modal',
  templateUrl: './update-folders-modal.component.html',
  styleUrls: ['./update-folders-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CircleTreeComponent],
})
export class UpdateFoldersModalComponent {
  private readonly presenter = inject(EditorPresenter)
  protected readonly data = inject<UpdateFoldersModalData>(NZ_MODAL_DATA)
  protected readonly tree = this.presenter.currentTree
  protected readonly ancestors = this.presenter.currentAncestors.map((ancestor) => ancestor.id)
}
