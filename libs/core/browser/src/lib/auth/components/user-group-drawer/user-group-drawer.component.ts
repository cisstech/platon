import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { User, UserGroup } from '@platon/core/common';
import { UiModalDrawerComponent } from '@platon/shared/ui';

import { UserSearchBarComponent } from '../user-search-bar/user-search-bar.component';
import { UserSearchModalComponent } from '../user-search-modal/user-search-modal.component';
import { UserTableComponent } from '../user-table/user-table.component';
import { UserService } from '../../api/user.service';
import { NzBadgeModule } from 'ng-zorro-antd/badge';


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

    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    NzPopconfirmModule,

    UserTableComponent,
    UserSearchBarComponent,
    UserSearchModalComponent,

    UiModalDrawerComponent,
  ]
})
export class UserGroupDrawerComponent {
  protected group?: UserGroup;
  protected groupName = '';

  protected members: User[] = [];
  protected selection: string[] = [];

  @ViewChild(UiModalDrawerComponent, { static: true })
  protected modal!: UiModalDrawerComponent

  @Output() changedGroup = new EventEmitter<UserGroup>();

  protected get excludes(): string[] {
    return this.members.map(m => m.username);
  }

  constructor(
    private readonly userService: UserService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  open(group: UserGroup) {
    this.group = group;
    this.groupName = group.name;
    this.modal.open();
  }

  protected async addMembers(users: User[]): Promise<void> {
    if (!users.length)
      return;

    this.group = await firstValueFrom(
      this.userService.updateUserGroup(this.group?.id as string, {
        users: [
          ...this.members.map(m => m.username),
          ...users.map(u => u.username)
        ]
      })
    );

    this.members = [
      ...users,
      ...this.members,
    ];


    this.changedGroup.emit(this.group);
    this.changeDetectorRef.detectChanges();
  }

  protected async renameGroup(): Promise<void> {
    if (!this.groupName.trim())
      return;

    this.group = await firstValueFrom(
      this.userService.updateUserGroup(this.group?.id as string, {
        name: this.groupName.trim()
      })
    );

    this.changedGroup.emit(this.group);
    this.changeDetectorRef.markForCheck();
  }

  protected async removeMembers(): Promise<void> {
   this.group =  await firstValueFrom(
      this.userService.updateUserGroup(this.group?.id as string, {
        users: this.members.filter(member => !this.selection.includes(member.id))
          .map(member => member.id)
      })
    );

    this.members = this.members.filter(member => !this.selection.includes(member.id));

    this.selection = [];

    this.changedGroup.emit(this.group);
    this.changeDetectorRef.markForCheck();
  }
}
