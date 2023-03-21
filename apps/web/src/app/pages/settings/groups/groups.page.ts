import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { UserGroupTableComponent, UserSearchBarComponent, UserService } from '@platon/core/browser';
import { UserGroup } from '@platon/core/common';
import { firstValueFrom } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-settings-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    NzIconModule,
    NzButtonModule,
    NzToolTipModule,

    UserSearchBarComponent,
    UserGroupTableComponent,
  ]
})
export class SettingsGroupsPage {
  protected groups: UserGroup[] = [];

  constructor(
    private readonly userService: UserService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  protected async addGroup(): Promise<void> {
    const group = await firstValueFrom(
      this.userService.createUserGroup({
        name: 'Nouveau groupe'
      })
    );

    this.groups = [
      group,
      ...this.groups
    ];

    this.changeDetectorRef.detectChanges();
  }

}
