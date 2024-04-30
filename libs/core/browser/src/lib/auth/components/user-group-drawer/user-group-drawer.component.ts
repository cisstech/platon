import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { firstValueFrom } from 'rxjs'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { User, UserFilters, UserGroup } from '@platon/core/common'
import { UiModalDrawerComponent } from '@platon/shared/ui'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { UserService } from '../../api/user.service'
import { UserSearchBarComponent } from '../user-search-bar/user-search-bar.component'
import { UserSearchModalComponent } from '../user-search-modal/user-search-modal.component'
import { UserTableComponent } from '../user-table/user-table.component'
import { AuthService } from '../../api/auth.service'

@Component({
  standalone: true,
  selector: 'user-group-drawer',
  templateUrl: './user-group-drawer.component.html',
  styleUrls: ['./user-group-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    MatInputModule,
    MatFormFieldModule,

    NzTabsModule,
    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    NzPopconfirmModule,

    UserTableComponent,
    UserSearchBarComponent,
    UserSearchModalComponent,

    UiModalDrawerComponent,
  ],
})
export class UserGroupDrawerComponent implements OnInit {
  private readonly userService = inject(UserService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly authService = inject(AuthService)

  protected group?: UserGroup
  protected groupName = ''

  protected canEdit = false
  protected members: User[] = []
  protected filters: UserFilters = { limit: 10 }
  protected selection: string[] = []
  protected activeTabIndex = 0

  @Output() updated = new EventEmitter<UserGroup>()

  @ViewChild(UiModalDrawerComponent, { static: true })
  protected modal!: UiModalDrawerComponent

  protected get excludes(): string[] {
    return this.members.map((m) => m.username)
  }

  async ngOnInit(): Promise<void> {
    const user = (await this.authService.ready()) as User
    this.canEdit = user.role === 'admin'
  }

  open(group: UserGroup) {
    this.group = group
    this.groupName = group.name
    this.filters = { limit: 10, groups: [group.id] }
    this.modal.open()
  }

  protected async addMembers(users: User[]): Promise<void> {
    if (!users.length) return

    this.group = await firstValueFrom(
      this.userService.updateUserGroup(this.group?.id as string, {
        users: [...this.members.map((m) => m.username), ...users.map((u) => u.username)],
      })
    )

    this.members = [...users, ...this.members]

    this.updated.emit(this.group)
    this.changeDetectorRef.detectChanges()
  }

  protected async renameGroup(): Promise<void> {
    if (!this.groupName.trim()) return

    this.group = await firstValueFrom(
      this.userService.updateUserGroup(this.group?.id as string, {
        name: this.groupName.trim(),
      })
    )

    this.updated.emit(this.group)
    this.changeDetectorRef.markForCheck()
  }

  protected async removeMembers(): Promise<void> {
    this.group = await firstValueFrom(
      this.userService.updateUserGroup(this.group?.id as string, {
        users: this.members.filter((member) => !this.selection.includes(member.id)).map((member) => member.id),
      })
    )

    this.members = this.members.filter((member) => !this.selection.includes(member.id))

    this.selection = []

    this.updated.emit(this.group)
    this.changeDetectorRef.markForCheck()
  }
}
