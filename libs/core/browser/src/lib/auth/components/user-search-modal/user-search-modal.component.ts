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

import { User, UserFilters, UserGroup } from '@platon/core/common'
import { UiModalTemplateComponent } from '@platon/shared/ui'

import { UserSearchBarComponent } from '../user-search-bar/user-search-bar.component'

@Component({
  standalone: true,
  selector: 'user-search-modal',
  templateUrl: './user-search-modal.component.html',
  styleUrls: ['./user-search-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NzModalModule, NzButtonModule, UserSearchBarComponent, UiModalTemplateComponent],
})
export class UserSearchModalComponent {
  @Input() title = ''
  @Input() okTitle = 'OK'
  @Input() noTitle = 'Annuler'
  @Input() filters: UserFilters = {}
  @Input() excludes: string[] = []
  @Input({ transform: booleanAttribute }) multi = true
  @Input({ transform: booleanAttribute }) allowGroup = false

  @Output() closed = new EventEmitter<(User | UserGroup)[]>()

  @ViewChild(UiModalTemplateComponent, { static: true })
  protected modal!: UiModalTemplateComponent

  protected selection: User[] = []
  protected get ready(): boolean {
    const n = this.selection.length
    return !this.multi ? n === 1 : n > 0
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  open(): void {
    this.modal.open()
  }

  close(data: User[]): void {
    this.closed.emit(data)
    this.selection = []
    this.changeDetectorRef.markForCheck()
  }
}
