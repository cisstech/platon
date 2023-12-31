import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import {
  UserGroupDrawerComponent,
  UserGroupTableComponent,
  UserSearchBarComponent,
  UserService,
} from '@platon/core/browser'
import { UserFilters, UserGroup } from '@platon/core/common'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-admin-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    NzPopconfirmModule,

    UserSearchBarComponent,
    UserGroupTableComponent,
    UserGroupDrawerComponent,
  ],
})
export class AdminGroupsPage {
  protected groups: UserGroup[] = []
  protected selection: string[] = []

  protected filters: UserFilters = { limit: 10 }

  @ViewChild(UserGroupDrawerComponent)
  protected drawer!: UserGroupDrawerComponent

  constructor(private readonly userService: UserService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  protected async addGroup(): Promise<void> {
    const group = await firstValueFrom(
      this.userService.createUserGroup({
        name: 'Nouveau groupe',
      })
    )
    this.groups = [group, ...this.groups]
    this.drawer.open(group)
    this.changeDetectorRef.markForCheck()
  }

  protected async deleteGroups(): Promise<void> {
    await Promise.all(this.selection.map((id) => firstValueFrom(this.userService.deleteUserGroup(id))))
    this.groups = this.groups.filter((group) => !this.selection.includes(group.id))
    this.selection = []
    this.changeDetectorRef.markForCheck()
  }

  protected onChangedGroup(group: UserGroup): void {
    this.groups = this.groups.map((g) => (g.id === group.id ? group : g))
    this.changeDetectorRef.markForCheck()
  }
}
